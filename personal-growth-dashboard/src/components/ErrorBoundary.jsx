import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh', fontFamily: 'monospace' }}>
                    <h1 style={{ color: '#ff4444', fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
                    <p style={{ color: '#888', marginBottom: '2rem' }}>Please share this screen with the developer.</p>
                    <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                        <h3 style={{ color: '#f4f46a', marginBottom: '0.5rem' }}>Error: {this.state.error && this.state.error.toString()}</h3>
                        <pre style={{ color: '#aaa', fontSize: '0.8rem' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '99px', cursor: 'pointer', fontWeight: 'bold' }}
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
