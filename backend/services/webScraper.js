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

// Function to search for current information (simplified)
export async function searchWeb(query) {
  try {
    console.log(`[WebScraper] 🔍 Searching for: ${query}`);
    
    // For now, we'll provide a helpful response about web search capability
    return {
      success: true,
      title: 'Web Search Results',
      url: `search:${query}`,
      content: `I understand you're looking for information about "${query}". While I have direct web scraping capability, I don't have access to search engines like Google. 

To get current information, you could:
1. Provide a specific URL for me to scrape
2. Ask me to fetch content from a news website
3. Use the Chrome extension bridge for more advanced web access

For example, try asking me to "fetch content from https://example.com" with a specific URL.`,
      wordCount: 50,
      timestamp: new Date().toISOString(),
      method: 'search-info'
    };

  } catch (error) {
    console.error(`[WebScraper] ❌ Search failed:`, error.message);
    return null;
  }
}

// Test URLs for different types of content
export const testUrls = {
  news: 'https://httpbin.org/html',  // Safe test URL
  example: 'https://example.com',
  httpbin: 'https://httpbin.org/json'
};