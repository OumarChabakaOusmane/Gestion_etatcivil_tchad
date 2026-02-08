import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatName } from '../../utils/textHelper';
import demandeService from "../../services/demandeService";
import authService from "../../services/authService";
import welcomeBanner from "../../assets/welcome_banner.png";
import { useLanguage } from "../../context/LanguageContext";

export default function Dashboard() {
    const [stats, setStats] = React.useState({
        total: 0,
        en_attente: 0,
        acceptee: 0,
        rejetee: 0
    });
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
                const getDate = (d) => {
                    if (!d) return 0;
                    if (d.toDate) return d.toDate();
                    if (d._seconds) return new Date(d._seconds * 1000);
                    const parsed = new Date(d);
                    return isNaN(parsed.getTime()) ? 0 : parsed;
                };
                return getDate(b.dateDemande) - getDate(a.dateDemande);
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
        <div className={`fade -in font - family - sans pb - 5 ${language === 'ar' ? 'rtl' : ''} `}>
            {/* Header section with brand colors */}
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2.5rem' }}>
                        {t('welcome')}, {formatName(user?.nom)} {formatName(user?.prenom)} !
                    </h1>
                    <p className="text-muted mb-0">
                        {stats?.en_attente > 0
                            ? (language === 'ar' ? t('demandesInProgress', { count: stats.en_attente }) : t(stats.en_attente > 1 ? 'demandesInProgress' : 'demandeInProgress', { count: stats.en_attente }))
                            : t('welcomeBackNoDemande')}
                    </p>
                </div>
                <div className="text-end d-none d-md-block">
                    <span className="badge rounded-pill bg-light text-dark border px-3 py-2 shadow-sm">
                        <i className="bi bi-calendar3 me-2 text-primary"></i>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all hover-translate">
                        <div className="card-body p-4 d-flex align-items-center gap-4">
                            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-file-earmark-text text-primary fs-3"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Total Demandes</h6>
                                <h3 className="fw-bold mb-0">{stats.total}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all hover-translate">
                        <div className="card-body p-4 d-flex align-items-center gap-4">
                            <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-clock-history text-warning fs-3"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>En Attente</h6>
                                <h3 className="fw-bold mb-0 text-warning">{stats.en_attente}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all hover-translate">
                        <div className="card-body p-4 d-flex align-items-center gap-4">
                            <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-check-circle text-success fs-3"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Approuvées</h6>
                                <h3 className="fw-bold mb-0 text-success">{stats.acceptee}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tiles Grid */}
            <div className="row g-4 mb-5">
                <div className="col-lg-4 col-md-6">
                    <div className="card border-0 shadow-lg rounded-4 h-100 overflow-hidden text-center hover-lift transition-all">
                        <div className="p-5">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4 transition-all" style={{ width: '100px', height: '100px' }}>
                                <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <h4 className="fw-bold text-dark mb-3">Acte de Naissance</h4>
                            <p className="text-muted small mb-4 px-3">Enregistrez une nouvelle naissance ou demandez une copie certifiée de votre acte.</p>
                            <Link to="/demande/naissance" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
                                <i className="bi bi-plus-circle"></i>
                                Faire une demande
                            </Link>
                        </div>
                        <div className="py-2 bg-primary bg-opacity-5 border-top">
                            <span className="small text-primary fw-bold">Délai estimé : 48h - 72h</span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6">
                    <div className="card border-0 shadow-lg rounded-4 h-100 overflow-hidden text-center hover-lift transition-all">
                        <div className="p-5">
                            <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4 transition-all" style={{ width: '100px', height: '100px' }}>
                                <i className="bi bi-heart-fill text-warning" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <h4 className="fw-bold text-dark mb-3">Acte de Mariage</h4>
                            <p className="text-muted small mb-4 px-3">Déclarez votre union ou obtenez un extrait d'acte de mariage certifié par l'état.</p>
                            <Link to="/demande/mariage" className="btn btn-warning text-white w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
                                <i className="bi bi-plus-circle"></i>
                                Faire une demande
                            </Link>
                        </div>
                        <div className="py-2 bg-warning bg-opacity-5 border-top">
                            <span className="small text-warning fw-bold">Délai estimé : 48h - 72h</span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-12">
                    <div className="card border-0 shadow-lg rounded-4 h-100 overflow-hidden text-center hover-lift transition-all">
                        <div className="p-5">
                            <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4 transition-all" style={{ width: '100px', height: '100px' }}>
                                <i className="bi bi-shield-shaded text-danger" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <h4 className="fw-bold text-dark mb-3">Acte de Décès</h4>
                            <p className="text-muted small mb-4 px-3">Déclarez un décès ou demandez une copie officielle pour vos démarches administratives.</p>
                            <Link to="/demande/deces" className="btn btn-danger w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
                                <i className="bi bi-plus-circle"></i>
                                Faire une demande
                            </Link>
                        </div>
                        <div className="py-2 bg-danger bg-opacity-5 border-top">
                            <span className="small text-danger fw-bold">Délai estimé : 24h - 48h</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden border">
                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 text-dark">
                        <i className="bi bi-activity me-2 text-primary"></i>
                        Activités Récentes
                    </h5>
                    <Link to="/mes-demandes" className="btn btn-link text-primary text-decoration-none fw-bold small">
                        Voir tout <i className="bi bi-arrow-right"></i>
                    </Link>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase">Type de document</th>
                                <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Date</th>
                                <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Statut</th>
                                <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentDemandes.map((demande) => (
                                <tr key={demande.id || demande._id}>
                                    <td className="px-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`rounded bg - opacity - 10 p - 2 bg - ${demande.type === 'naissance' ? 'primary' : demande.type === 'mariage' ? 'warning' : 'danger'} `}>
                                                <i className={`bi bi - ${demande.type === 'naissance' ? 'person-badge' : demande.type === 'mariage' ? 'heart' : 'shield-shaded'} text - ${demande.type === 'naissance' ? 'primary' : demande.type === 'mariage' ? 'warning' : 'danger'} `}></i>
                                            </div>
                                            <span className="fw-bold text-dark">
                                                Acte de {demande.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-muted">
                                        {formatDate(demande.dateDemande)}
                                    </td>
                                    <td className="py-3">
                                        {demande.statut === 'en_attente' && (
                                            <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning px-3 py-2 border border-warning border-opacity-25 d-inline-flex align-items-center gap-2">
                                                <span className="dot dot-warning"></span> En attente
                                            </span>
                                        )}
                                        {demande.statut === 'acceptee' && (
                                            <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 border border-success border-opacity-25 d-inline-flex align-items-center gap-2">
                                                <span className="dot dot-success"></span> Approuvé
                                            </span>
                                        )}
                                        {demande.statut === 'rejetee' && (
                                            <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger px-3 py-2 border border-danger border-opacity-25 d-inline-flex align-items-center gap-2">
                                                <span className="dot dot-danger"></span> Rejeté
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        <Link to="/mes-demandes" className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
                                            Détails
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {recentDemandes.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <div className="text-muted mb-3">
                                            <i className="bi bi-inbox fs-1 opacity-25"></i>
                                        </div>
                                        <p className="text-muted">Vous n'avez pas encore effectué de demande.</p>
                                        <Link to="/demander-acte" className="btn btn-primary btn-sm rounded-pill px-4">
                                            Faire ma première demande
                                        </Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
    .hover - translate:hover {
    transform: translateY(-5px);
}
                .hover - lift:hover {
    transform: translateY(-8px);
    box - shadow: 0 1rem 3rem rgba(0, 0, 0, .1)!important;
}
                .hover - lift: hover.bg - opacity - 10 {
    background - opacity: 0.2!important;
}
                .dot {
    width: 8px;
    height: 8px;
    border - radius: 50 %;
    display: inline - block;
}
                .dot - warning { background - color: #ffc107; box - shadow: 0 0 8px #ffc107; }
                .dot - success { background - color: #198754; box - shadow: 0 0 8px #198754; }
                .dot - danger { background - color: #dc3545; box - shadow: 0 0 8px #dc3545; }
                .transition - all { transition: all 0.3s ease; }
`}} />
        </div>
    );
}
