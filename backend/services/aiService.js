// AI Service - Mixtral Only Integration
import { mockChatCompletion, mockAnalyze, mockSummarize, mockQuizQuestions } from './mockAI.js';
import mixtralService from './mixtralService.js';
import { fetchWebContentDirect, searchWeb } from './webScraper.js';

let initialized = false;

function ensureProviders() {
  if (initialized) return;
  
  // Check Mixtral configuration
  if (mixtralService.isConfigured()) {
    console.log('[AI] ✅ Mixtral initialized successfully with API key');
  } else {
    console.log('[AI] ⚠️  No valid Mixtral API key found - using mock responses for development');
  }
  
  initialized = true;
}

// Function to reset initialization (called after env vars are loaded)
export function resetInitialization() {
  initialized = false;
  console.log('[AI] 🔄 Resetting AI service initialization...');
  // Reload Mixtral configuration with new environment variables
  mixtralService.reloadConfig();
}

// Chrome Extension Bridge Integration with Direct Web Scraping Fallback
export async function fetchWebContent(url) {
  console.log(`[AI] 🌐 Fetching web content: ${url}`);
  
  // First try direct web scraping (more reliable)
  try {
    const directResult = await fetchWebContentDirect(url);
    if (directResult && directResult.success) {
      console.log(`[AI] ✅ Direct scraping successful: ${directResult.wordCount} words`);
      return directResult;
    }
  } catch (error) {
    console.log(`[AI] ⚠️ Direct scraping failed: ${error.message}`);
  }

  // Fallback to Chrome extension bridge
  try {
    console.log(`[AI] 🔄 Trying Chrome extension bridge...`);
    
    const response = await fetch('http://localhost:5051/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      timeout: 30000
    });
    
    if (!response.ok) {
      throw new Error(`Bridge server responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log(`[AI] ✅ Bridge fetch successful: ${data.data.content?.length || 0} chars`);
      return {
        title: data.data.title,
        url: data.data.url,
        content: data.data.content,
        wordCount: data.data.wordCount,
        timestamp: data.data.timestamp,
        method: 'chrome-extension'
      };
    } else {
      throw new Error(data.error || 'Failed to fetch content');
    }
    
  } catch (error) {
    console.error(`[AI] ❌ Both web scraping methods failed for ${url}:`, error.message);
    
    // Return informative error response
    return {
      success: false,
      title: 'Web Access Error',
      url: url,
      content: `Unable to access ${url}. Both direct scraping and Chrome extension bridge failed. This could be due to website restrictions, network issues, or CORS policies.`,
      error: error.message,
      wordCount: 0,
      timestamp: new Date().toISOString(),
      method: 'failed'
    };
  }
}

// Enhanced AI chat with web content support
export async function chatCompletionWithWebAccess(message, context = '', urls = []) {
  ensureProviders();
  
  let enhancedContext = context;
  let webContent = '';
  
  // If URLs provided, fetch their content
  if (urls.length > 0) {
    console.log(`[AI] 🔗 Fetching content from ${urls.length} URLs...`);
    
    for (const url of urls.slice(0, 3)) { // Limit to 3 URLs
      const content = await fetchWebContent(url);
      if (content && content.content) {
        webContent += `\n\n--- Content from ${content.title} (${url}) ---\n${content.content}\n`;
      }
    }
  }
  
  // If no URLs provided but message seems like it needs web data, automatically fetch relevant content
  else if (requiresWebSearch(message)) {
    console.log('[AI] 🔍 Message appears to need web search - attempting automatic content fetch');
    
    // Check if user is asking for a specific website
    const urlMatch = message.match(/(?:fetch|get|visit|scrape|check)\s+(?:from\s+)?(?:https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
    if (urlMatch) {
      let url = urlMatch[1];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      console.log(`[AI] 🎯 Detected URL request: ${url}`);
      
      const content = await fetchWebContent(url);
      if (content && content.content) {
        webContent += `\n\n--- Web Content from ${content.title} ---\n${content.content}\n`;
      }
    } else {
      // Automatically search for relevant web content
      console.log(`[AI] 🚀 Attempting automatic web search for: ${message}`);
      const searchResult = await searchWeb(message);
      if (searchResult && searchResult.content) {
        if (searchResult.success) {
          webContent += `\n\n--- Current Web Information ---\n${searchResult.content}\n`;
          console.log(`[AI] ✅ Successfully fetched web content for query`);
        } else {
          webContent += `\n\n--- Web Access Note ---\n${searchResult.content}\n`;
          console.log(`[AI] ⚠️ Web content fetch had issues but provided guidance`);
        }
      }
    }
  }
  
  // Add web content to context
  if (webContent) {
    enhancedContext += `\n\n=== WEB CONTENT ===\n${webContent}\n=== END WEB CONTENT ===\n\nPlease use this web content to provide accurate and current information in your response. IMPORTANT: Format your response in plain text only - do NOT use any markdown formatting like **, ***, ###, bullet points, or any special characters for emphasis.`;
  } else if (requiresWebSearch(message)) {
    enhancedContext += `\n\nNote: The user is asking about current information (like weather, news, etc.). Since I cannot access real-time data, please provide helpful suggestions for where they can find current information, such as specific websites or apps. Keep your response conversational and in plain text format without any markdown formatting.`;
  }
  
  // Use regular chat completion with enhanced context
  return await chatCompletion(message, enhancedContext);
}

// Helper function to detect if message needs web search
function requiresWebSearch(message) {
  const webKeywords = [
    'current', 'latest', 'recent', 'today', 'now', 'update', 'news',
    'weather', 'temperature', 'forecast', 'climate', 'rain', 'sunny', 'cloudy',
    'price', 'stock', 'trending', 'happening', 'search',
    'find', 'look up', 'check', 'what is', 'tell me about',
    'whats the', 'what\'s the', 'how is the', 'is it', 'will it'
  ];
  
  const lowerMessage = message.toLowerCase();
  return webKeywords.some(keyword => lowerMessage.includes(keyword));
}

async function safeGenerate(prompt, generationConfig = {}) {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.chatCompletion(prompt);
    } catch (error) {
      console.error('[AI] Mixtral error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock for development
  return await mockChatCompletion(prompt);
}

export async function chatCompletion(message, context = '') {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.chatCompletion(message, context);
    } catch (error) {
      console.error('[AI] Mixtral chat error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock
  return await mockChatCompletion(message, context);
}

export async function summarize(text, type = 'detailed') {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      const style = type === 'brief' ? 'Provide a concise 3 sentence summary.' : 
                   type === 'bullet-points' ? 'Return 5-8 bullet points.' : 
                   'Provide a thorough yet compact study summary.';
      const prompt = `${style}\n\nText:\n${text.slice(0, 12000)}`;
      return await mixtralService.chatCompletion(prompt);
    } catch (error) {
      console.error('[AI] Mixtral summarize error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock
  return await mockSummarize(text, type);
}

export async function analyze(text) {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.analyze(text);
    } catch (error) {
      console.error('[AI] Mixtral analyze error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock
  return await mockAnalyze(text);
}

export async function quizQuestions(content, numQuestions = 5) {
  ensureProviders();
  
  // Try Mixtral first
  if (mixtralService.isConfigured()) {
    try {
      return await mixtralService.generateQuiz(content, numQuestions);
    } catch (error) {
      console.error('[AI] Mixtral quiz error, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock
  return await mockQuizQuestions(content, numQuestions);
}

// Export default for backward compatibility
export default {
  chatCompletion,
  summarize,
  analyze,
  quizQuestions
};