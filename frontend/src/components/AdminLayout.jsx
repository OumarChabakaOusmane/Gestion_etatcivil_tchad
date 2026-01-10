import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import useCurrentUser from '../hooks/useCurrentUser';
import NotificationBell from './NotificationBell';
import PageTransition from './PageTransition';
import { useState, useEffect } from 'react';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const [darkMode, setDarkMode] = useState(localStorage.getItem('adminTheme') === 'dark');

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('adminTheme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('adminTheme', 'light');
        }
    }, [darkMode]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/admin/dashboard') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="d-flex min-vh-100 bg-light font-family-sans">
            {/* Sidebar Fixe */}
            <aside className="d-flex flex-column text-white shadow-lg"
                style={{ width: '280px', backgroundColor: 'var(--admin-navy)', minHeight: '100vh', position: 'fixed', zIndex: 1000 }}>

                <div className="p-4 mb-4 border-bottom border-white border-opacity-10 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <img src="/drapeau-tchad.jpg" alt="Logo" style={{ width: '40px', height: '25px', objectFit: 'cover', borderRadius: '3px' }} />
                        <span className="fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>Tchad Civil</span>
                    </div>
                    <div className="small opacity-50 fw-bold">PORTAIL ADMIN</div>
                </div>

                <nav className="nav flex-column gap-2 px-3">
                    <Link to="/admin/dashboard"
                        className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/dashboard') ? 'active-admin-custom shadow-sm' : 'text-white-50 hover-admin-custom'}`}>
                        <i className={`bi bi-grid-1x2-fill fs-5 ${isActive('/admin/dashboard') ? 'text-white' : ''}`}></i>
                        <span className="fw-semibold">Tableau de Bord</span>
                    </Link>

                    <Link to="/admin/demandes"
                        className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/demandes') ? 'active-admin-custom shadow-sm' : 'text-white-50 hover-admin-custom'}`}>
                        <i className={`bi bi-file-earmark-text-fill fs-5 ${isActive('/admin/demandes') ? 'text-white' : ''}`}></i>
                        <span className="fw-semibold">Gérer les Demandes</span>
                    </Link>

                    <Link to="/admin/guichet/naissance"
                        className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/guichet') ? 'active-admin-custom shadow-sm' : 'text-white-50 hover-admin-custom'}`}>
                        <i className={`bi bi-pencil-square fs-5 ${isActive('/admin/guichet') ? 'text-white' : ''}`}></i>
                        <span className="fw-semibold">Saisie Acte (Guichet)</span>
                    </Link>

                    <Link to="/admin/rapports"
                        className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/rapports') ? 'active-admin-custom shadow-sm' : 'text-white-50 hover-admin-custom'}`}>
                        <i className={`bi bi-bar-chart-fill fs-5 ${isActive('/admin/rapports') ? 'text-white' : ''}`}></i>
                        <span className="fw-semibold">Rapports & Stats</span>
                    </Link>

                    <Link to="/admin/utilisateurs"
                        className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/utilisateurs') ? 'active-admin-custom shadow-sm' : 'text-white-50 hover-admin-custom'}`}>
                        <i className={`bi bi-people-fill fs-5 ${isActive('/admin/utilisateurs') ? 'text-white' : ''}`}></i>
                        <span className="fw-semibold">Utilisateurs</span>
                    </Link>

                    <div className="my-2 border-top border-white border-opacity-10 mx-3"></div>

                    <Link to="/admin/settings"
                        className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/settings') ? 'active-admin-custom shadow-sm' : 'text-white-50 hover-admin-custom'}`}>
                        <i className={`bi bi-gear-fill fs-5 ${isActive('/admin/settings') ? 'text-white' : ''}`}></i>
                        <span className="fw-semibold">Paramètres</span>
                    </Link>
                </nav>

                <div className="mt-auto p-4 border-top border-white border-opacity-10 bg-black bg-opacity-10">
                    <button onClick={handleLogout} className="btn border-0 text-white-50 d-flex align-items-center gap-3 p-0 hover-text-white transition-all w-100">
                        <i className="bi bi-box-arrow-left fs-5"></i> <span className="fw-semibold">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Zone de Contenu */}
            <main className="flex-grow-1" style={{ marginLeft: '280px' }}>
                <header className="bg-white p-4 shadow-sm d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 900 }}>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-shield-check text-primary fs-4"></i>
                        <h5 className="fw-bold m-0 text-dark">Espace Administration</h5>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                        <button
                            className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 transition-all ${darkMode ? 'bg-warning text-dark' : 'bg-light text-muted'}`}
                            style={{ width: '38px', height: '38px' }}
                            onClick={() => setDarkMode(!darkMode)}
                            title={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
                        >
                            <i className={`bi bi-${darkMode ? 'sun-fill' : 'moon-stars-fill'} fs-5`}></i>
                        </button>
                        <NotificationBell />
                        <div className="text-end d-none d-md-block">
                            <div className="fw-bold text-dark small">Bonjour, {currentUser?.prenom || 'Administrateur'}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>N'Djaména, Tchad</div>
                        </div>
                        {currentUser?.photo ? (
                            <img
                                src={currentUser.photo}
                                alt="Profil"
                                className="rounded-circle shadow-sm border border-2 border-white"
                                style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                                style={{ width: '45px', height: '45px', border: '2px solid white' }}>
                                {currentUser?.prenom?.[0] || 'A'}
                            </div>
                        )}
                    </div>
                </header>

                <div className="p-0">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
