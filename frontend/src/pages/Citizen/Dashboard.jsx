import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import demandeService from "../../services/demandeService";
import authService from "../../services/authService";
import welcomeBanner from "../../assets/welcome_banner.png";
import { useLanguage } from "../../context/LanguageContext";

export default function Dashboard() {
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);
    const [recentDemandes, setRecentDemandes] = React.useState([]);
    const { t, language } = useLanguage();

    useEffect(() => {
        loadUserData();
        loadMyStats();
    }, []);

    const loadUserData = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const loadMyStats = async () => {
        try {
            const response = await demandeService.getMyDemandes();
            const demandes = Array.isArray(response.data) ? response.data :
                (Array.isArray(response) ? response : []);

            const statsData = {
                total: demandes.length,
                en_attente: demandes.filter(d => d.statut === 'en_attente').length,
                acceptee: demandes.filter(d => d.statut === 'acceptee').length,
                rejetee: demandes.filter(d => d.statut === 'rejetee').length
            };

            setStats(statsData);

            const sorted = [...demandes].sort((a, b) => {
                const dateA = a.dateDemande?.toDate ? a.dateDemande.toDate() :
                    (a.dateDemande?._seconds ? new Date(a.dateDemande._seconds * 1000) : new Date(a.dateDemande));
                const dateB = b.dateDemande?.toDate ? b.dateDemande.toDate() :
                    (b.dateDemande?._seconds ? new Date(b.dateDemande._seconds * 1000) : new Date(b.dateDemande));
                return dateB - dateA;
            });
            setRecentDemandes(sorted.slice(0, 5));
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "Date inconnue";
        try {
            // Support Firestore Timestamp
            if (dateValue && typeof dateValue === 'object' && dateValue._seconds) {
                return new Date(dateValue._seconds * 1000).toLocaleDateString('fr-FR');
            }
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return "Date invalide";
            return date.toLocaleDateString('fr-FR');
        } catch (e) {
            return "Erreur date";
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="text-center">
                    <div className="spinner-grow text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`fade-in font-family-sans ${language === 'ar' ? 'rtl' : ''}`}>
            {/* Header Citoyen Dynamique style Premium */}
            <div className="position-relative overflow-hidden rounded-4 mb-5 shadow-sm border-0"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(26, 86, 219, 0.08) 0%, rgba(255, 207, 0, 0.08) 50%, rgba(210, 16, 52, 0.08) 100%), url(${welcomeBanner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#fff'
                }}>
                <div className="p-4 p-md-5 position-relative" style={{ zIndex: 1 }}>
                    <div className={`d-flex align-items-center mb-3 ${language === 'ar' ? 'justify-content-start' : ''}`}>
                        <div className="badge bg-primary-custom rounded-pill px-3 py-1 small fw-normal">
                            {t('republic')} 🇨🇩
                        </div>
                    </div>
                    <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>
                        {t('welcome')}, {user?.prenom || 'Citoyen'} ! 👋
                    </h1>
                    <p className="text-muted fs-5 mb-0" style={{ maxWidth: '600px' }}>
                        {stats?.en_attente > 0
                            ? (language === 'ar' ? t('demandesInProgress', { count: stats.en_attente }) : t(stats.en_attente > 1 ? 'demandesInProgress' : 'demandeInProgress', { count: stats.en_attente }))
                            : t('welcomeBackNoDemande')}
                    </p>
                </div>
            </div>

            {/* Cartes Actions */}
            <section className="mb-5">
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="bg-white p-4 rounded-4 shadow-sm h-100 text-center border-0 d-flex flex-column align-items-center hover-translate transition-all">
                            <div className="mb-4">
                                <div className="bg-light rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                    <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                            </div>
                            <h5 className="fw-bold mb-4 text-dark">Demande d'Acte <br /> de Naissance</h5>
                            <Link to="/demande/naissance" className="btn btn-primary w-100 py-2 rounded-3 fw-bold mt-auto" style={{ backgroundColor: '#1a56db', borderColor: '#1a56db' }}>
                                Faire une demande
                            </Link>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-white p-4 rounded-4 shadow-sm h-100 text-center border-0 d-flex flex-column align-items-center hover-translate transition-all">
                            <div className="mb-4">
                                <div className="bg-light rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                    <i className="bi bi-gem text-warning" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                            </div>
                            <h5 className="fw-bold mb-4 text-dark">{t('birthCert').split(' ').slice(0, 2).join(' ')} <br /> {t('birthCert').split(' ').slice(2).join(' ')}</h5>
                            <Link to="/demande/naissance" className="btn btn-primary w-100 py-2 rounded-3 fw-bold mt-auto" style={{ backgroundColor: '#1a56db', borderColor: '#1a56db' }}>
                                {t('makeDemande')}
                            </Link>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-white p-4 rounded-4 shadow-sm h-100 text-center border-0 d-flex flex-column align-items-center hover-translate transition-all">
                            <div className="mb-4">
                                <div className="bg-light rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                    <i className="bi bi-gem text-warning" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                            </div>
                            <h5 className="fw-bold mb-4 text-dark">{t('marriageCert').split(' ').slice(0, 2).join(' ')} <br /> {t('marriageCert').split(' ').slice(2).join(' ')}</h5>
                            <Link to="/demande/mariage" className="btn btn-primary w-100 py-2 rounded-3 fw-bold mt-auto" style={{ backgroundColor: '#1a56db', borderColor: '#1a56db' }}>
                                {t('makeDemande')}
                            </Link>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-white p-4 rounded-4 shadow-sm h-100 text-center border-0 d-flex flex-column align-items-center hover-translate transition-all">
                            <div className="mb-4">
                                <div className="bg-light rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                    <i className="bi bi-plus-lg text-secondary" style={{ fontSize: '3rem' }}></i>
                                </div>
                            </div>
                            <h5 className="fw-bold mb-4 text-dark">{t('deathCert').split(' ').slice(0, 1).join(' ')} <br /> {t('deathCert').split(' ').slice(1).join(' ')}</h5>
                            <Link to="/demande/deces" className="btn btn-primary w-100 py-2 rounded-3 fw-bold mt-auto" style={{ backgroundColor: '#1a56db', borderColor: '#1a56db' }}>
                                {t('makeDeclaration')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Suivi des Demandes */}
            <section className="bg-white rounded-4 shadow-sm p-4 border-0">
                <h5 className="fw-bold mb-4 text-dark" style={{ fontSize: '1.25rem' }}>{t('trackingTitle')}</h5>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className={`border-0 py-3 ${language === 'ar' ? 'pe-3' : 'ps-3'} text-secondary fw-bold small`}>{t('tableType')}</th>
                                <th className="border-0 py-3 text-secondary fw-bold small">{t('tableDate')}</th>
                                <th className="border-0 py-3 text-secondary fw-bold small">{t('tableStatus')}</th>
                                <th className={`border-0 py-3 ${language === 'ar' ? 'ps-3 text-start' : 'pe-3 text-end'} text-secondary fw-bold small`}>{t('tableActions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentDemandes.map((demande) => (
                                <tr key={demande.id || demande._id}>
                                    <td className={`${language === 'ar' ? 'pe-3' : 'ps-3'} fw-bold text-dark`}>
                                        {demande.type === 'naissance' && t('birthCert')}
                                        {demande.type === 'mariage' && t('marriageCert')}
                                        {demande.type === 'deces' && t('deathCert')}
                                    </td>
                                    <td className="text-muted">
                                        {formatDate(demande.dateDemande)}
                                    </td>
                                    <td>
                                        {demande.statut === 'en_attente' && (
                                            <span className="badge bg-primary fw-normal px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.75rem' }}>
                                                <i className={`bi bi-clock-history ${language === 'ar' ? 'ms-1' : 'me-1'}`}></i> {t('statusPending')}
                                            </span>
                                        )}
                                        {demande.statut === 'acceptee' && (
                                            <span className="badge bg-success fw-normal px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.75rem' }}>
                                                <i className={`bi bi-check-circle ${language === 'ar' ? 'ms-1' : 'me-1'}`}></i> {t('statusApproved')}
                                            </span>
                                        )}
                                        {demande.statut === 'rejetee' && (
                                            <span className="badge bg-danger fw-normal px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.75rem' }}>
                                                <i className={`bi bi-x-circle ${language === 'ar' ? 'ms-1' : 'me-1'}`}></i> {t('statusRejected')}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`${language === 'ar' ? 'ps-3 text-start' : 'pe-3 text-end'}`}>
                                        <Link to="/mes-demandes" className="btn btn-primary btn-sm px-4 rounded-3 fw-bold text-decoration-none" style={{ backgroundColor: '#1a56db', borderColor: '#1a56db' }}>
                                            {demande.statut === 'acceptee' ? t('btnDownload') : t('btnView')}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {recentDemandes.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">{t('noDemande')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
