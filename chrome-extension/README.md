# LastMin AI Bridge - Chrome Extension

This Chrome extension acts as a bridge between your LastMin AI application and web pages, allowing the AI to fetch and analyze content from any website without server-side costs.

## 🚀 How It Works

```
Your AI → Bridge Server (localhost:5000) → Chrome Extension → Web Page → Extract Content → AI
```

## 📋 Features

- **Web Content Extraction**: Extract clean text from any webpage
- **Text Selection Help**: Highlight text on any page to get AI explanations
- **Real-time Bridge**: Communication between AI and web pages via localhost:5000
- **Zero Server Costs**: All web scraping happens locally in your browser
- **Privacy Focused**: No data sent to external servers

## 🛠️ Installation

### Step 1: Install Bridge Server Dependencies

```bash
cd chrome-extension
npm install
```

### Step 2: Start Bridge Server

```bash
npm start
```

The bridge server will run on `http://localhost:5000`

### Step 3: Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### Step 4: Pin the Extension

1. Click the puzzle piece icon in Chrome toolbar
2. Find "LastMin AI Bridge" and click the pin icon
3. The extension icon should now be visible in your toolbar

## 🔧 Usage

### For AI Web Fetching

Your AI can now fetch web content by making requests to the bridge server:

```javascript
// Fetch any webpage content
const response = await fetch('http://localhost:5000/fetch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const data = await response.json();
console.log(data.content); // Clean text from the webpage
```

### For Users

1. **Text Selection**: Highlight text on any webpage to get AI explanations
2. **Page Extraction**: Click the extension icon → "Extract Current Page"
3. **Status Check**: See if the bridge server is connected

## 📡 API Endpoints

The bridge server provides these endpoints:

- `GET /health` - Check server and extension status
- `POST /fetch` - Fetch content from any URL
- `GET /current-page` - Get content from current active tab  
- `POST /explain` - Process selected text for AI explanation
- `GET /test` - Test endpoint with server info

## 🔗 Integration with LastMin AI

To integrate with your existing AI service, modify `backend/services/aiService.js`:

```javascript
// Add web content fetching capability
export async function fetchWebContent(url) {
  try {
    const response = await fetch('http://localhost:5000/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Web fetch error:', error);
    return null;
  }
}
```

## 🛡️ Security & Privacy

- **Local Only**: All processing happens locally on your machine
- **No External Servers**: Content is not sent to any external services
- **User Control**: Users can see exactly what content is being extracted
- **Permissions**: Extension only accesses pages when explicitly requested

## 🧪 Testing

1. Start the bridge server: `npm start`
2. Load the extension in Chrome
3. Visit any webpage
4. Test the connection: Click extension → "Test Connection"
5. Try extracting content: Click extension → "Extract Current Page"

## 📝 Development

### Bridge Server Development

```bash
npm run dev  # Start with nodemon for auto-restart
```

### Extension Development

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click refresh icon on the LastMin AI Bridge extension
4. Test your changes

## 🔧 Troubleshooting

### Extension Not Working
- Check if bridge server is running (`http://localhost:5000/health`)
- Reload the extension in Chrome extensions page
- Check browser console for errors

### Can't Fetch Websites
- Ensure extension has proper permissions
- Some sites may block content extraction due to CSP
- Check network tab for CORS issues

### Bridge Server Issues
- Make sure port 5000 is not in use by other applications
- Check firewall settings
- Verify WebSocket connection (port 5001)

## 🚀 Production Deployment

For production use:

1. **Package Extension**: Create a .zip of the chrome-extension folder
2. **Host Bridge Server**: Deploy bridge server to a VPS or cloud service
3. **Update URLs**: Change localhost URLs to your production domain
4. **SSL**: Use HTTPS for production bridge server

## 📄 License

MIT License - Feel free to modify and distribute!

---

**Made with ❤️ for LastMin AI**