// LastMin AI Bridge - Content Script
console.log('LastMin AI Bridge Content Script loaded on:', window.location.href);

// Initialize content script
let isInitialized = false;

function initializeContentScript() {
  if (isInitialized) return;
  isInitialized = true;
  
  console.log('Content script initialized');
  
  // Add visual indicator that extension is active
  addExtensionIndicator();
  
  // Set up text selection handler
  setupTextSelectionHandler();
}

// Add visual indicator
function addExtensionIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'lastmin-ai-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(45deg, #6366f1, #8b5cf6);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-family: Arial, sans-serif;
    z-index: 10000;
    opacity: 0.7;
    transition: opacity 0.3s;
    cursor: pointer;
  `;
  indicator.textContent = 'LastMin AI Active';
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.opacity = '1';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.opacity = '0.7';
  });
  
  indicator.addEventListener('click', () => {
    extractAndSendPageContent();
  });
  
  document.body.appendChild(indicator);
  
  // Remove indicator after 3 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 300);
    }
  }, 3000);
}

// Set up text selection handler
function setupTextSelectionHandler() {
  let selectionTimeout;
  
  document.addEventListener('mouseup', () => {
    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText.length > 10) { // Only for meaningful selections
        showQuickActionTooltip(selectedText);
      }
    }, 100);
  });
  
  // Hide tooltip when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lastmin-ai-tooltip')) {
      hideQuickActionTooltip();
    }
  });
}

// Show quick action tooltip for selected text
function showQuickActionTooltip(selectedText) {
  hideQuickActionTooltip(); // Remove any existing tooltip
  
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  const tooltip = document.createElement('div');
  tooltip.className = 'lastmin-ai-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    top: ${rect.bottom + window.scrollY + 5}px;
    left: ${rect.left + window.scrollX}px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-family: Arial, sans-serif;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.2s;
    max-width: 200px;
  `;
  
  tooltip.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px;">LastMin AI</div>
    <div style="font-size: 11px; opacity: 0.9;">Click to explain selected text</div>
  `;
  
  tooltip.addEventListener('mouseenter', () => {
    tooltip.style.transform = 'scale(1.05)';
  });
  
  tooltip.addEventListener('mouseleave', () => {
    tooltip.style.transform = 'scale(1)';
  });
  
  tooltip.addEventListener('click', () => {
    explainSelectedText(selectedText);
    hideQuickActionTooltip();
  });
  
  document.body.appendChild(tooltip);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideQuickActionTooltip();
  }, 5000);
}

function hideQuickActionTooltip() {
  const existing = document.querySelector('.lastmin-ai-tooltip');
  if (existing) {
    existing.remove();
  }
}

// Extract and send page content
function extractAndSendPageContent() {
  const content = extractCleanText();
  
  // Send to background script
  chrome.runtime.sendMessage({
    type: 'PAGE_CONTENT_EXTRACTED',
    content: content,
    url: window.location.href
  });
  
  console.log('Page content extracted and sent:', content);
}

// Extract clean text from the current page
function extractCleanText() {
  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside', 
    '.advertisement', '.ads', '.sidebar', '.menu', '.navigation',
    '.social-share', '.comments', '.related-posts'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.style.display = 'none');
  });
  
  // Get main content
  const contentSelectors = [
    'main', 'article', '.content', '.main-content', '.post-content',
    '.entry-content', '.article-content', '#content', '#main'
  ];
  
  let mainContent = '';
  
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      mainContent = element.innerText || element.textContent || '';
      if (mainContent.trim().length > 100) break;
    }
  }
  
  // Fallback to body if no main content found
  if (!mainContent || mainContent.trim().length < 100) {
    mainContent = document.body.innerText || document.body.textContent || '';
  }
  
  // Clean the text
  const cleanText = mainContent
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return {
    title: document.title,
    url: window.location.href,
    content: cleanText.substring(0, 8000), // Limit to 8000 chars
    wordCount: cleanText.split(' ').length,
    timestamp: new Date().toISOString()
  };
}

// Handle selected text explanation
async function explainSelectedText(text) {
  try {
    // Show loading indicator
    showNotification('Sending to LastMin AI...', 'info');
    
    // Send to background script for processing
    const response = await chrome.runtime.sendMessage({
      type: 'EXPLAIN_TEXT',
      text: text,
      url: window.location.href,
      title: document.title
    });
    
    if (response.success) {
      showNotification('Explanation sent to LastMin AI!', 'success');
    } else {
      showNotification('Failed to process text', 'error');
    }
    
  } catch (error) {
    console.error('Error explaining text:', error);
    showNotification('Error processing request', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 10002;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Set background based on type
  switch (type) {
    case 'success':
      notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      break;
    default:
      notification.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
  }
  
  notification.textContent = message;
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.type === 'EXTRACT_CONTENT') {
    const content = extractCleanText();
    sendResponse({ success: true, content: content });
  }
  
  if (message.type === 'EXPLAIN_RESPONSE') {
    if (message.success) {
      showNotification('AI explanation ready!', 'success');
    } else {
      showNotification('Failed to get explanation', 'error');
    }
  }
  
  return true;
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}