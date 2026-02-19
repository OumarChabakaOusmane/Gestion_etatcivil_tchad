import { useState, useEffect } from 'react';
import auditService from '../../services/auditService';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        loadLogs();
    }, [filterAction]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterAction) params.action = filterAction;

            const response = await auditService.getLogs(params);
            setLogs(response.data || []);
        } catch (error) {
            console.error('Erreur chargement logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString('fr-FR');
    };

    const getActionBadge = (action) => {
        let color = 'secondary';
        if (action.includes('LOGIN')) color = 'info';
        if (action.includes('CREATED')) color = 'success';
        if (action.includes('DELETED')) color = 'danger';
        if (action.includes('ACCEPTED')) color = 'success';
        if (action.includes('REJECTED')) color = 'warning';
        if (action.includes('ROLE')) color = 'primary';

        return <span className={`badge bg-${color} bg-opacity-75`}>{action}</span>;
    };

    const renderLogDetails = (log) => {
        const { action, details } = log;
        let data = {};

        try {
            data = typeof details === 'string' ? JSON.parse(details) : (details || {});
        } catch (e) {
            return <span className="text-muted fst-italic">{String(details)}</span>;
        }

        switch (action) {
            case 'LOGIN_SUCCESS':
                return <span>Connexion réussie au portail</span>;
            case 'LOGIN_ERROR':
                return <span className="text-danger">Échec de connexion : {data.reason || 'Erreur inconnue'}</span>;
            case 'ARTICLE_CREATED':
                return <span>Création de l'article : <strong>{data.title || 'Sans titre'}</strong></span>;
            case 'ARTICLE_UPDATED':
                return <span>Mise à jour de l'article : <strong>{data.title || data.articleId}</strong></span>;
            case 'ARTICLE_DELETED':
                return <span className="text-danger">Suppression de l'article ID: {data.articleId}</span>;
            case 'DEMANDE_ACCEPTED':
                return <span>Approbation de la demande <strong>#{data.demandeId?.slice(-8).toUpperCase()}</strong></span>;
            case 'DEMANDE_REJECTED':
                return (
                    <span>
                        Rejet de la demande <strong>#{data.demandeId?.slice(-8).toUpperCase()}</strong>
                        <br />
                        <small className="text-danger">Motif: {data.motif || 'Non précisé'}</small>
                    </span>
                );
            case 'USER_CREATED':
                return <span>Création de l'utilisateur : <strong>{data.email}</strong></span>;
            case 'ROLE_UPDATED':
                return <span>Rôle de <strong>{data.email}</strong> modifié vers <strong>{data.newRole}</strong></span>;
            case 'OTP_SENT':
                return <span>Code OTP envoyé à {data.email || 'l\'utilisateur'}</span>;
            default:
                return <span>{typeof details === 'object' ? JSON.stringify(details) : String(details)}</span>;
        }
    };

    return (
        <div className="p-4 p-lg-5 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Journal d'Activité</h2>
                    <p className="text-muted mb-0">Historique de sécurité et actions sensibles.</p>
                </div>
                <button onClick={loadLogs} className="btn btn-outline-primary rounded-pill px-3">
                    <i className="bi bi-arrow-clockwise me-2"></i>Actualiser
                </button>
            </div>

            <div className="bg-white p-3 rounded-4 shadow-sm mb-4">
                <div className="d-flex gap-3">
                    <select className="form-select w-auto" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                        <option value="">Toutes les actions</option>
                        <option value="LOGIN_SUCCESS">Connexions</option>
                        <option value="USER_CREATED">Utilisateurs créés</option>
                        <option value="ROLE_UPDATED">Rôles modifiés</option>
                        <option value="DEMANDE_ACCEPTED">Actes Validés</option>
                        <option value="DEMANDE_REJECTED">Demandes Rejetées</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="small text-muted fw-bold text-uppercase border-bottom">
                                <th className="ps-4 py-3">Date / Heure</th>
                                <th className="py-3">Utilisateur</th>
                                <th className="py-3">Rôle</th>
                                <th className="py-3">Action</th>
                                <th className="py-3">Détails</th>
                                <th className="pe-4 py-3 text-end">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Aucune activité enregistrée</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="border-bottom-faint">
                                    <td className="ps-4 py-3 fw-bold small text-dark">{formatDate(log.timestamp)}</td>
                                    <td className="py-3">
                                        <div className="fw-bold text-dark small">{log.userName}</div>
                                        <div className="text-muted x-small">{log.userEmail}</div>
                                    </td>
                                    <td className="py-3">
                                        <span className="badge bg-light text-dark border">{log.userRole}</span>
                                    </td>
                                    <td className="py-3">{getActionBadge(log.action)}</td>
                                    <td className="py-3 small text-muted" style={{ minWidth: '250px' }}>
                                        {renderLogDetails(log)}
                                    </td>
                                    <td className="pe-4 py-3 text-end small font-monospace text-muted">{log.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
