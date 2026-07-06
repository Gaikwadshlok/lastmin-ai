import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export class ErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { hasError: false };
        this.handleReload = () => window.location.reload();
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('Unexpected UI error:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-6 text-center", children: _jsxs("div", { className: "space-y-4 max-w-md", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Something went wrong" }), _jsx("p", { className: "text-sm text-muted-foreground break-words", children: this.state.error?.message || 'An unexpected error occurred.' }), _jsxs("div", { className: "flex gap-3 justify-center", children: [_jsx("button", { onClick: this.handleReload, className: "px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm", children: "Reload" }), _jsx("button", { onClick: () => this.setState({ hasError: false, error: undefined }), className: "px-4 py-2 rounded-md border text-sm", children: "Dismiss" })] })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
