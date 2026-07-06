import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
const WebTest = () => {
    const [bridgeStatus, setBridgeStatus] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testUrl, setTestUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
    // Check bridge server status
    const checkBridgeStatus = async () => {
        try {
            const response = await fetch('http://localhost:5050/test');
            const data = await response.json();
            setBridgeStatus(data);
        }
        catch (error) {
            setBridgeStatus({ error: error.message });
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
        }
        catch (error) {
            setTestResult({ error: error.message });
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
        }
        catch (error) {
            setTestResult({ error: error.message, testType: 'Direct Bridge Test' });
        }
        setLoading(false);
    };
    useEffect(() => {
        checkBridgeStatus();
    }, []);
    return (_jsxs("div", { className: "container mx-auto p-8 max-w-4xl", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Web Access Test Page" }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Bridge Server Status" }), _jsx("button", { onClick: checkBridgeStatus, className: "mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Refresh Status" }), bridgeStatus && (_jsx("div", { className: "bg-gray-50 p-4 rounded", children: _jsx("pre", { className: "text-sm overflow-x-auto", children: JSON.stringify(bridgeStatus, null, 2) }) }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "AI Web Chat Test" }), _jsx("button", { onClick: testWebFetch, disabled: loading, className: "mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50", children: loading ? 'Testing...' : 'Test AI Web Access' }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "This tests the complete pipeline: Frontend \u2192 Backend \u2192 AI Service \u2192 Bridge Server" }), testResult && testResult.testType !== 'Direct Bridge Test' && (_jsx("div", { className: "bg-gray-50 p-4 rounded", children: _jsx("pre", { className: "text-sm overflow-x-auto", children: JSON.stringify(testResult, null, 2) }) }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Direct Bridge Server Test" }), _jsx("div", { className: "mb-4", children: _jsx("input", { type: "text", value: testUrl, onChange: (e) => setTestUrl(e.target.value), className: "w-full p-2 border rounded", placeholder: "Enter URL to test" }) }), _jsx("button", { onClick: testBridgeDirectly, disabled: loading, className: "mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50", children: loading ? 'Testing...' : 'Test Direct Bridge Fetch' }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "This tests the bridge server directly, bypassing the AI backend" }), testResult && testResult.testType === 'Direct Bridge Test' && (_jsx("div", { className: "bg-gray-50 p-4 rounded", children: _jsx("pre", { className: "text-sm overflow-x-auto", children: JSON.stringify(testResult, null, 2) }) }))] }), _jsxs("div", { className: "bg-yellow-50 border-l-4 border-yellow-400 p-4", children: [_jsx("h3", { className: "font-semibold", children: "Web Access Setup Instructions:" }), _jsxs("ol", { className: "list-decimal ml-6 mt-2 space-y-1", children: [_jsx("li", { children: "Bridge server should be running on localhost:5050" }), _jsx("li", { children: "Load Chrome extension from chrome://extensions/" }), _jsx("li", { children: "Enable Developer mode and click \"Load unpacked\"" }), _jsx("li", { children: "Select the chrome-extension folder" }), _jsx("li", { children: "Extension should auto-connect (check console)" }), _jsx("li", { children: "Use the Web toggle in chat for current information" })] })] })] }));
};
export default WebTest;
