import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Crashed in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-4 text-center">
                    <div className="card shadow-lg p-5 rounded-4 border-0" style={{ maxWidth: '500px' }}>
                        <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                        </div>
                        <h2 className="fw-bold text-dark mb-3">Oups ! Quelque chose a mal tourné</h2>
                        <p className="text-secondary mb-4">
                            L'application a rencontré une erreur inattendue. Ne vous inquiétez pas, vos données sont en sécurité.
                        </p>
                        <div className="d-grid gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary py-3 rounded-3 fw-bold"
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Actualiser la page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn btn-outline-secondary py-2 rounded-3"
                            >
                                Retour à l'accueil
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-start bg-dark p-3 rounded text-white small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                                <summary className="cursor-pointer">Détails techniques (Dev Only)</summary>
                                <pre className="mt-2">{this.state.error.toString()}</pre>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
