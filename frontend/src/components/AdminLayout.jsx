import React from 'react';
// Deployment Version: 1.1.0 - Sync Sidebar menus
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import useCurrentUser from '../hooks/useCurrentUser';
import NotificationBell from './NotificationBell';
import PageTransition from './PageTransition';
import CommandPalette from './CommandPalette';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(authService.getCurrentUser());
    const [darkMode, setDarkMode] = useState(localStorage.getItem('adminTheme') === 'dark');
    const [showSidebar, setShowSidebar] = useState(false);
    const { language, t } = useLanguage();

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

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    const isActive = (path) => {
        if (path === '/admin/dashboard') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className={`d-flex min-vh-100 ${darkMode ? 'bg-dark' : 'bg-light'} font-family-sans transition-all position-relative`}>
            {/* Sidebar Overlay for Mobile */}
            {showSidebar && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-lg-none"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 995 }}
                    onClick={() => setShowSidebar(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`d-flex flex-column text-white shadow-lg admin-sidebar transition-all ${showSidebar ? 'show' : ''}`}
                style={{
                    width: '280px',
                    background: 'linear-gradient(180deg, #202885 0%, #151a5c 100%)',
                    height: '100vh',
                    position: 'fixed',
                    zIndex: 1000,
                    overflowY: 'auto'
                }}>

                <div className="sidebar-brand-wrapper">
                    <Link to="/" className="brand-logo-modern" onClick={() => setShowSidebar(false)}>
                        <div className="tchad-flag-clean">
                            <div className="bar-blue"></div>
                            <div className="bar-yellow"></div>
                            <div className="bar-red"></div>
                        </div>
                        <div className="brand-text-container">
                            <span className="brand-main-text" style={{ color: '#ffffff' }}>{t('etatCivil')}</span>
                            <span className="brand-sub-text" style={{ color: '#ffffff', opacity: 0.8 }}>Administration Centrale</span>
                        </div>
                    </Link>
                </div>

                <div className="px-3 py-3">
                    <nav className="nav flex-column gap-1">
                        <Link to="/admin/dashboard" onClick={() => setShowSidebar(false)}
                            className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/dashboard') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-grid-1x2-fill"></i>
                            <span className="fw-semibold">Tableau de Bord</span>
                        </Link>

                        <Link to="/admin/demandes" onClick={() => setShowSidebar(false)}
                            className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/demandes') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-file-earmark-text-fill"></i>
                            <span className="fw-semibold">Gérer les Demandes</span>
                        </Link>

                        <Link to="/admin/articles" onClick={() => setShowSidebar(false)}
                            className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/articles') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-newspaper"></i>
                            <span className="fw-semibold">Actualités</span>
                        </Link>

                        <Link to="/admin/guichet/naissance" onClick={() => setShowSidebar(false)}
                            className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/guichet/naissance') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-person-plus-fill"></i>
                            <span className="fw-semibold">Saisie Naissance</span>
                        </Link>

                        <Link to="/admin/guichet/mariage" onClick={() => setShowSidebar(false)}
                            className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/guichet/mariage') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-heart-fill"></i>
                            <span className="fw-semibold">Saisie Mariage</span>
                        </Link>

                        <Link to="/admin/guichet/deces" onClick={() => setShowSidebar(false)}
                            className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/guichet/deces') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-person-x-fill"></i>
                            <span className="fw-semibold">Saisie Décès</span>
                        </Link>

                        <Link to="/admin/rapports" onClick={() => setShowSidebar(false)}
                            className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/rapports') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-bar-chart-fill"></i>
                            <span className="fw-semibold">Statistiques</span>
                        </Link>

                        {authService.isAdmin() && (
                            <Link to="/admin/utilisateurs" onClick={() => setShowSidebar(false)}
                                className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/utilisateurs') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                                <i className="bi bi-people-fill"></i>
                                <span className="fw-semibold">Utilisateurs</span>
                            </Link>
                        )}

                        <Link to="/admin/messages" onClick={() => setShowSidebar(false)}
                            className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/messages') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-chat-left-text-fill"></i>
                            <span className="fw-semibold">Messages</span>
                        </Link>

                        {authService.isAdmin() && (
                            <Link to="/admin/logs" onClick={() => setShowSidebar(false)}
                                className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/logs') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                                <i className="bi bi-shield-check"></i>
                                <span className="fw-semibold">Journal d'Activité</span>
                            </Link>
                        )}

                        {authService.isAdmin() && (
                            <Link to="/admin/settings" onClick={() => setShowSidebar(false)}
                                className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-4 transition-all ${isActive('/admin/settings') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                                <i className="bi bi-gear-fill"></i>
                                <span className="fw-semibold">Paramètres</span>
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="mt-auto p-3">
                    <div className="logout-container p-3 rounded-4 transition-all"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <button onClick={handleLogout} className="btn border-0 text-white d-flex align-items-center gap-3 p-0 transition-all w-100 shadow-none">
                            <i className="bi bi-box-arrow-left fs-5 text-warning"></i>
                            <span className="fw-semibold">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Zone de Contenu */}
            <main className="flex-grow-1 admin-main-content transition-all" style={{ marginLeft: '280px' }}>
                <header className={`p-3 d-flex justify-content-between align-items-center sticky-top border-bottom transition-all ${darkMode ? 'bg-dark border-secondary' : 'bg-white border-light'}`} style={{ zIndex: 900 }}>
                    <div className="d-flex align-items-center gap-2 ps-lg-3">
                        <button
                            className="btn btn-link text-muted p-0 d-lg-none"
                            onClick={toggleSidebar}
                        >
                            <i className={`bi ${showSidebar ? 'bi-x' : 'bi-list'} fs-2`}></i>
                        </button>

                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary d-flex align-items-center justify-content-center d-none d-sm-flex">
                                <i className="bi bi-shield-lock-fill fs-5"></i>
                            </div>
                            <div>
                                <h6 className={`fw-bold m-0 ${darkMode ? 'text-white' : 'text-dark'}`}>Portail d'Administration</h6>
                                <div className={`${darkMode ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>Délégation Générale à l'État Civil</div>
                            </div>
                        </div>
                    </div>


                    <div className="d-flex align-items-center gap-3 pe-3">
                        <button
                            className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 p-0 transition-all ${darkMode ? 'bg-secondary bg-opacity-25 text-warning' : 'bg-light text-muted'}`}
                            style={{ width: '38px', height: '38px' }}
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            <i className={`bi bi-${darkMode ? 'sun-fill' : 'moon-stars-fill'} fs-5`}></i>
                        </button>

                        <NotificationBell />

                        <div className="vr mx-2 opacity-10"></div>

                        <div className="d-flex align-items-center gap-3 ps-2">
                            <div className="text-end d-none d-md-block">
                                <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{user?.prenom || 'Admin'}</div>
                                <div className="text-muted" style={{ fontSize: '0.65rem' }}>{user?.role === 'admin' ? 'Administrateur Système' : 'Agent État Civil'}</div>
                            </div>
                            <div className="position-relative">
                                {user?.photo ? (
                                    <img
                                        src={user.photo}
                                        alt="Profil"
                                        className="rounded-circle border border-2 border-primary-subtle shadow-sm"
                                        style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                                        style={{ width: '42px', height: '42px', border: '2px solid rgba(255,255,255,0.2)' }}>
                                        {user?.prenom?.[0] || 'A'}
                                    </div>
                                )}
                                <div className="position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-0">
                    <PageTransition>
                        {children}
                    </PageTransition>
                    <CommandPalette />
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-nav-link {
                    color: white !important;
                    text-decoration: none;
                }
                .admin-nav-link:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.05);
                }
                .admin-nav-link i {
                    font-size: 1.4rem;
                    opacity: 1;
                    transition: all 0.3s ease;
                }
                .admin-nav-link:hover i {
                    opacity: 1;
                    transform: translateX(3px);
                }

                .admin-nav-active {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(5px);
                    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
                    position: relative;
                }
                .admin-nav-active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 20%;
                    height: 60%;
                    width: 4px;
                    background: white;
                    border-radius: 0 4px 4px 0;
                }
                .admin-nav-active i {
                    font-size: 1.4rem;
                    color: white;
                }

                .logout-container:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                }
                
                .border-bottom-faint {
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                }
                
                .hover-text-white:hover {
                    color: white !important;
                }

                @media (max-width: 991.98px) {
                    .admin-sidebar {
                        transform: translateX(-100%);
                        z-index: 1045 !important;
                    }
                    .admin-sidebar.show {
                        transform: translateX(0);
                    }
                    .admin-main-content {
                        margin-left: 0 !important;
                    }
                }
                
                .transition-all {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .admin-sidebar {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}} />
        </div>
    );
};

export default AdminLayout;

