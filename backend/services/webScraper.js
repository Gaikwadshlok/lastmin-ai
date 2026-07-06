// Direct Web Scraping Service
// Fallback when Chrome extension bridge is not available

import axios from 'axios';
import * as cheerio from 'cheerio';

// Simple web scraping function
export async function fetchWebContentDirect(url) {
  try {
    console.log(`[WebScraper] 🌐 Fetching content directly from: ${url}`);
    
    // Set a reasonable timeout and user agent
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      }
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Parse HTML content with cheerio
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .ad, .ads, .advertisement, .sidebar').remove();
    
    // Try to get the main content
    let content = '';
    const contentSelectors = [
      'main', 
      'article', 
      '.content', 
      '.main-content', 
      '.post-content', 
      '.entry-content',
      '#content', 
      '#main',
      '.article-body',
      '.story-body'
    ];

    // Try each selector to find main content
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) break; // Found substantial content
      }
    }

    // If no main content found, get body text
    if (!content || content.length < 200) {
      content = $('body').text().trim();
    }

    // Clean up the text
    content = content
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n')  // Replace multiple newlines
      .trim()
      .substring(0, 5000);  // Limit content length

    const title = $('title').text().trim() || 'Web Page';
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || '';

    const result = {
      success: true,
      title: title,
      url: url,
      content: content,
      description: description,
      wordCount: content.split(' ').filter(word => word.length > 0).length,
      timestamp: new Date().toISOString(),
      method: 'direct-scraping'
    };

    console.log(`[WebScraper] ✅ Successfully scraped ${url}: ${result.wordCount} words`);
    return result;

  } catch (error) {
    console.error(`[WebScraper] ❌ Failed to scrape ${url}:`, error.message);
    
    // Return error info instead of null
    return {
      success: false,
      title: 'Scraping Failed',
      url: url,
      content: `Failed to access ${url}. Error: ${error.message}. This could be due to website restrictions, network issues, or the site requiring JavaScript.`,
      error: error.message,
      wordCount: 0,
      timestamp: new Date().toISOString(),
      method: 'direct-scraping'
    };
  }
}

// Smart URL mapping for different query types
const queryMappings = {
  weather: [
    'https://weather.com',
    'https://www.accuweather.com',
    'https://www.weather.gov'
  ],
  news: [
    'https://www.bbc.com/news',
    'https://edition.cnn.com',
    'https://www.reuters.com'
  ],
  finance: [
    'https://finance.yahoo.com',
    'https://www.marketwatch.com'
  ],
  technology: [
    'https://techcrunch.com',
    'https://www.theverge.com'
  ]
};

// Function to determine query type and get appropriate URLs
function getRelevantUrls(query) {
  const lowerQuery = query.toLowerCase();
  
  // Weather queries
  if (lowerQuery.match(/weather|temperature|forecast|rain|sunny|cloudy|climate|storm/)) {
    return { type: 'weather', urls: queryMappings.weather };
  }
  
  // News queries
  if (lowerQuery.match(/news|headline|current events|breaking|latest news|happening/)) {
    return { type: 'news', urls: queryMappings.news };
  }
  
  // Finance queries
  if (lowerQuery.match(/stock|price|market|finance|investment|crypto|bitcoin/)) {
    return { type: 'finance', urls: queryMappings.finance };
  }
  
  // Technology queries
  if (lowerQuery.match(/tech|technology|ai|software|app|digital/)) {
    return { type: 'technology', urls: queryMappings.technology };
  }
  
  // Default: try news sites for general queries
  return { type: 'general', urls: queryMappings.news };
}

// Function to search for current information with automatic website fetching
export async function searchWeb(query) {
  try {
    console.log(`[WebScraper] 🔍 Searching for: ${query}`);
    
    const { type, urls } = getRelevantUrls(query);
    console.log(`[WebScraper] 📊 Query type detected: ${type}`);
    
    // Try to fetch content from the most relevant website
    let bestResult = null;
    let attemptedUrls = [];
    
    for (const url of urls.slice(0, 2)) { // Try max 2 URLs to avoid timeout
      try {
        console.log(`[WebScraper] 🌐 Attempting to fetch from: ${url}`);
        const result = await fetchWebContentDirect(url);
        attemptedUrls.push(url);
        
        if (result && result.success && result.wordCount > 100) {
          bestResult = result;
          console.log(`[WebScraper] ✅ Successfully got content from ${url}`);
          break;
        }
      } catch (error) {
        console.log(`[WebScraper] ⚠️ Failed to fetch from ${url}: ${error.message}`);
        continue;
      }
    }
    
    if (bestResult) {
      return {
        ...bestResult,
        queryType: type,
        searchQuery: query,
        content: `Based on current web content from ${bestResult.url}:\n\n${bestResult.content}`
      };
    }
    
    // If no content was successfully fetched, provide helpful guidance
    return {
      success: false,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Information`,
      url: `search:${query}`,
      content: `I attempted to fetch current ${type} information from websites like ${attemptedUrls.join(', ')}, but encountered access restrictions. \n\nTo get current ${type} information, you can:\n1. Visit ${urls[0]} directly in your browser\n2. Provide me with a specific URL to scrape\n3. Try asking about a specific location or topic\n\nFor example, if you have a specific ${type} URL, ask me to "fetch content from [URL]".`,
      queryType: type,
      attemptedUrls,
      wordCount: 50,
      timestamp: new Date().toISOString(),
      method: 'auto-search'
    };

  } catch (error) {
    console.error(`[WebScraper] ❌ Search failed:`, error.message);
    return {
      success: false,
      title: 'Search Error',
      content: `I encountered an error while trying to fetch information: ${error.message}`,
      error: error.message,
      timestamp: new Date().toISOString(),
      method: 'auto-search'
    };
  }
}

// Test URLs for different types of content
export const testUrls = {
  news: 'https://httpbin.org/html',  // Safe test URL
  example: 'https://example.com',
  httpbin: 'https://httpbin.org/json',
  weather: 'https://example.com', // For testing weather detection
  safe: 'https://httpbin.org/html'  // Always accessible for testing
};

// Export query mappings for testing
export { queryMappings };