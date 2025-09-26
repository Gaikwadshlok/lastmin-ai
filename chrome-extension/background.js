// LastMin AI Bridge - Background Script
console.log('LastMin AI Bridge Extension loaded');

// Connect to bridge server on startup
let bridgeConnection = null;

// Connect to bridge server
async function connectToBridge() {
  try {
    console.log('Attempting to connect to bridge server...');
    
    // Test bridge server connection
    const response = await fetch('http://localhost:5051/health');
    if (response.ok) {
      console.log('✅ Bridge server connection successful');
      bridgeConnection = true;
      
      // Register extension with bridge server
      fetch('http://localhost:5051/register-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          extensionId: chrome.runtime.id,
          status: 'connected',
          timestamp: new Date().toISOString()
        })
      }).catch(e => console.log('Registration optional:', e.message));
      
    }
  } catch (error) {
    console.log('❌ Bridge server not available:', error.message);
    bridgeConnection = false;
  }
}

// Connect on startup
connectToBridge();

// Reconnect every 30 seconds if disconnected
setInterval(() => {
  if (!bridgeConnection) {
    connectToBridge();
  }
}, 30000);

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.type === 'FETCH_URL') {
    handleFetchRequest(message, sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'GET_PAGE_CONTENT') {
    handleContentExtractionRequest(message, sender, sendResponse);
    return true;
  }
});

async function handleFetchRequest(message, sendResponse) {
  try {
    const { url, requestId } = message;
    console.log(`Fetching URL: ${url}`);
    
    // Get active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab) {
      sendResponse({ error: 'No active tab found' });
      return;
    }
    
    // Navigate to URL
    await chrome.tabs.update(activeTab.id, { url: url });
    
    // Wait for page to load
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === activeTab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        extractPageContent(activeTab.id, requestId, sendResponse);
      }
    });
    
  } catch (error) {
    console.error('Fetch error:', error);
    sendResponse({ error: error.message });
  }
}

async function extractPageContent(tabId, requestId, sendResponse) {
  try {
    // Inject and execute content extraction
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: extractCleanText,
    });
    
    const content = results[0].result;
    
    // Send response back
    sendResponse({
      success: true,
      requestId: requestId,
      content: content
    });
    
    // Also notify bridge server
    if (bridgeConnection) {
      fetch('http://localhost:5051/content-extracted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestId,
          content: content,
          timestamp: new Date().toISOString()
        })
      }).catch(e => console.log('Bridge notification failed:', e.message));
    }
    
  } catch (error) {
    console.error('Content extraction error:', error);
    sendResponse({ error: error.message });
  }
}

// Function to be injected into pages for content extraction
function extractCleanText() {
  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    '.advertisement', '.ads', '.sidebar', '.menu', '.navigation'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });
  
  // Get main content
  const contentSelectors = [
    'main', 'article', '.content', '.main-content', 
    '.post-content', '.entry-content', '#content', '#main'
  ];
  
  let mainContent = '';
  
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      mainContent = element.innerText || element.textContent || '';
      if (mainContent.trim().length > 100) break;
    }
  }
  
  // Fallback to body
  if (!mainContent || mainContent.trim().length < 100) {
    mainContent = document.body.innerText || document.body.textContent || '';
  }
  
  // Clean text
  const cleanText = mainContent
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
    .substring(0, 8000); // Limit size
  
  return {
    title: document.title,
    url: window.location.href,
    content: cleanText,
    wordCount: cleanText.split(' ').length,
    timestamp: new Date().toISOString()
  };
}