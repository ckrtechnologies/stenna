import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', margin: '2rem' }}>
                    <h2 style={{ color: '#b91c1c' }}>Something went wrong.</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', color: '#991b1b' }}>{this.state.error?.toString()}</pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
