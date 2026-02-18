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
        // Vérifier si c'est une erreur connue de Recharts (removeChild, dimensions)
        const msg = error?.message || '';
        if (msg.includes('removeChild') || msg.includes('width') || msg.includes('height')) {
            return { hasError: false };
        }
        throw error;
    }

    componentDidCatch(error) {
        const msg = error?.message || '';
        if (msg.includes('removeChild') || msg.includes('width') || msg.includes('height')) {
            console.warn('SafeRechartsContainer: Erreur graphique Recharts gérée gracieusement');
            return;
        }
    }

    render() {
        return this.props.children;
    }
}

export default SafeRechartsContainer;
