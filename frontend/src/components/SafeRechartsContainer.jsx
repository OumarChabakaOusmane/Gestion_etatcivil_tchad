import { Component } from 'react';

/**
 * Wrapper pour ResponsiveContainer de Recharts qui prévient les crashes
 * liés aux erreurs removeChild lors du démontage rapide des composants.
 * 
 * Ce composant capture et ignore silencieusement les erreurs DOM qui se produisent
 * pendant le démontage, ce qui est un bug connu de Recharts.
 */
class SafeRechartsContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Vérifier si c'est une erreur removeChild de Recharts
        if (error && error.message && error.message.includes('removeChild')) {
            // Ignorer silencieusement cette erreur spécifique
            return { hasError: false };
        }
        // Propager les autres erreurs
        throw error;
    }

    componentDidCatch(error, errorInfo) {
        // Log uniquement en développement
        if (process.env.NODE_ENV === 'development') {
            if (error && error.message && error.message.includes('removeChild')) {
                console.warn('Recharts removeChild error suppressed (known bug):', error);
            }
        }
    }

    render() {
        return this.props.children;
    }
}

export default SafeRechartsContainer;
