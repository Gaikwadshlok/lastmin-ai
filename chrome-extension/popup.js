// Popup script for LastMin AI Bridge Extension

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Popup loaded');
    
    // Check connection status
    await updateConnectionStatus();
    
    // Set up event listeners
    document.getElementById('extract-page').addEventListener('click', extractCurrentPage);
    document.getElementById('open-dashboard').addEventListener('click', openDashboard);
    document.getElementById('test-connection').addEventListener('click', testConnection);
});

async function updateConnectionStatus() {
    const statusDiv = document.getElementById('status');
    const connectionStatus = document.getElementById('connection-status');
    
    try {
        // Check if bridge server is running
        const response = await fetch('http://localhost:5050/health');
        const data = await response.json();
        
        if (data.status === 'ok') {
            statusDiv.className = 'status connected';
            connectionStatus.innerHTML = `
                <span class="indicator online"></span>
                Bridge Server Connected
            `;
        } else {
            throw new Error('Server not responding');
        }
        
    } catch (error) {
        statusDiv.className = 'status disconnected';
        connectionStatus.innerHTML = `
            <span class="indicator offline"></span>
            Bridge Server Offline
        `;
    }
}

async function extractCurrentPage() {
    try {
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            showNotification('No active tab found', 'error');
            return;
        }
        
        // Send message to content script to extract content
        const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'EXTRACT_CONTENT'
        });
        
        if (response && response.success) {
            showNotification('Page content extracted!', 'success');
            
            // Send to bridge server
            await fetch('http://localhost:5050/explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: response.content.content,
                    url: response.content.url,
                    title: response.content.title
                })
            });
            
            console.log('Content sent to bridge server');
        } else {
            showNotification('Failed to extract content', 'error');
        }
        
    } catch (error) {
        console.error('Extract page error:', error);
        showNotification('Error extracting page', 'error');
    }
}

function openDashboard() {
    chrome.tabs.create({ url: 'http://localhost:3000' });
    window.close();
}

async function testConnection() {
    const button = document.getElementById('test-connection');
    button.textContent = 'Testing...';
    button.disabled = true;
    
    try {
        const response = await fetch('http://localhost:5050/test');
        const data = await response.json();
        
        if (data.message) {
            showNotification('Connection test successful!', 'success');
            await updateConnectionStatus();
        }
    } catch (error) {
        showNotification('Connection test failed', 'error');
        console.error('Test connection error:', error);
    } finally {
        button.textContent = 'Test Connection';
        button.disabled = false;
    }
}

function showNotification(message, type = 'info') {
    // Create temporary notification in popup
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 11px;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = 'rgba(16, 185, 129, 0.9)';
            break;
        case 'error':
            notification.style.background = 'rgba(239, 68, 68, 0.9)';
            break;
        default:
            notification.style.background = 'rgba(99, 102, 241, 0.9)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 2000);
}