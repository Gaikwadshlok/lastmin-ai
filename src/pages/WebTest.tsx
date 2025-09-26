import React, { useState, useEffect } from 'react';

const WebTest: React.FC = () => {
  const [bridgeStatus, setBridgeStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testUrl, setTestUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');

  // Check bridge server status
  const checkBridgeStatus = async () => {
    try {
      const response = await fetch('http://localhost:5050/test');
      const data = await response.json();
      setBridgeStatus(data);
    } catch (error) {
      setBridgeStatus({ error: (error as Error).message });
    }
  };

  // Test web content fetching
  const testWebFetch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/chat-web', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: `Can you tell me about the current weather or any recent news? I've enabled web access mode.`,
          context: 'User is testing web access functionality',
          urls: []
        })
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: (error as Error).message });
    }
    setLoading(false);
  };

  // Direct bridge server test
  const testBridgeDirectly = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5050/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      });

      const result = await response.json();
      setTestResult({ ...result, testType: 'Direct Bridge Test' });
    } catch (error) {
      setTestResult({ error: (error as Error).message, testType: 'Direct Bridge Test' });
    }
    setLoading(false);
  };

  useEffect(() => {
    checkBridgeStatus();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Web Access Test Page</h1>
      
      {/* Bridge Status Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bridge Server Status</h2>
        <button
          onClick={checkBridgeStatus}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Status
        </button>
        
        {bridgeStatus && (
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(bridgeStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* AI Web Chat Test */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">AI Web Chat Test</h2>
        <button
          onClick={testWebFetch}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test AI Web Access'}
        </button>
        
        <p className="text-sm text-gray-600 mb-4">
          This tests the complete pipeline: Frontend → Backend → AI Service → Bridge Server
        </p>
        
        {testResult && testResult.testType !== 'Direct Bridge Test' && (
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Direct Bridge Test */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Direct Bridge Server Test</h2>
        
        <div className="mb-4">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter URL to test"
          />
        </div>
        
        <button
          onClick={testBridgeDirectly}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct Bridge Fetch'}
        </button>
        
        <p className="text-sm text-gray-600 mb-4">
          This tests the bridge server directly, bypassing the AI backend
        </p>
        
        {testResult && testResult.testType === 'Direct Bridge Test' && (
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h3 className="font-semibold">Web Access Setup Instructions:</h3>
        <ol className="list-decimal ml-6 mt-2 space-y-1">
          <li>Bridge server should be running on localhost:5050</li>
          <li>Load Chrome extension from chrome://extensions/</li>
          <li>Enable Developer mode and click "Load unpacked"</li>
          <li>Select the chrome-extension folder</li>
          <li>Extension should auto-connect (check console)</li>
          <li>Use the Web toggle in chat for current information</li>
        </ol>
      </div>
    </div>
  );
};

export default WebTest;