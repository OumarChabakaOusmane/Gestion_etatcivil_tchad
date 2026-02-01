import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import useCurrentUser from '../hooks/useCurrentUser';
import NotificationBell from './NotificationBell';
import PageTransition from './PageTransition';
import CommandPalette from './CommandPalette';
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
        <div className={`d-flex min-vh-100 ${darkMode ? 'bg-dark' : 'bg-light'} font-family-sans transition-all`}>
            {/* Sidebar Fixe */}
            <aside className="d-flex flex-column text-white shadow-lg admin-sidebar"
                style={{ width: '280px', background: 'linear-gradient(180deg, #202885 0%, #151a5c 100%)', height: '100vh', position: 'fixed', zIndex: 1000, overflowY: 'auto' }}>

                <div className="p-4 mb-3 text-center border-bottom border-white border-opacity-10">
                    <Link to="/" className="text-decoration-none d-flex align-items-center justify-content-center gap-2 mb-1">
                        <img src="/drapeau-tchad.jpg" alt="Logo" style={{ width: '35px', height: '22px', objectFit: 'cover', borderRadius: '2px' }} />
                        <span className="fw-bold text-white text-uppercase tracking-widest" style={{ fontSize: '0.9rem', letterSpacing: '2px' }}>Tchad Civil</span>
                    </Link>
                    <div className="small text-warning fw-bold opacity-75" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>ADMINISTRATION CENTRALE</div>
                </div>

                <div className="px-3 py-4">
                    <nav className="nav flex-column gap-2">
                        <Link to="/admin/dashboard"
                            className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/dashboard') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-grid-1x2-fill"></i>
                            <span className="fw-semibold">Tableau de Bord</span>
                        </Link>

                        <Link to="/admin/demandes"
                            className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/demandes') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-file-earmark-text-fill"></i>
                            <span className="fw-semibold">Gérer les Demandes</span>
                        </Link>

                        <Link to="/admin/articles"
                            className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/articles') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-newspaper"></i>
                            <span className="fw-semibold">Actualités</span>
                        </Link>

                        <div className="sidebar-label px-3 mt-3 mb-2 text-uppercase text-white opacity-25 fw-bold" style={{ fontSize: '0.6rem' }}>Opérations</div>

                        <Link to="/admin/guichet/naissance"
                            className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/guichet') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-pencil-square"></i>
                            <span className="fw-semibold">Saisie Acte</span>
                        </Link>

                        <Link to="/admin/rapports"
                            className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/rapports') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-bar-chart-fill"></i>
                            <span className="fw-semibold">Statistiques</span>
                        </Link>

                        {authService.isAdmin() && (
                            <Link to="/admin/utilisateurs"
                                className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/utilisateurs') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                                <i className="bi bi-people-fill"></i>
                                <span className="fw-semibold">Utilisateurs</span>
                            </Link>
                        )}

                        <Link to="/admin/messages"
                            className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/messages') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                            <i className="bi bi-chat-left-text-fill"></i>
                            <span className="fw-semibold">Messages</span>
                        </Link>

                        <div className="sidebar-label px-3 mt-3 mb-2 text-uppercase text-white opacity-25 fw-bold" style={{ fontSize: '0.6rem' }}>Système</div>

                        {authService.isAdmin() && (
                            <Link to="/admin/settings"
                                className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/settings') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                                <i className="bi bi-gear-fill"></i>
                                <span className="fw-semibold">Paramètres</span>
                            </Link>
                        )}

                        {authService.isAdmin() && (
                            <Link to="/admin/logs"
                                className={`nav-link d-flex align-items-center gap-3 p-3 rounded-4 transition-all ${isActive('/admin/logs') ? 'admin-nav-active' : 'admin-nav-link'}`}>
                                <i className="bi bi-shield-check"></i>
                                <span className="fw-semibold">Journal d'Activité</span>
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
            <main className="flex-grow-1" style={{ marginLeft: '280px' }}>
                <header className={`p-3 d-flex justify-content-between align-items-center sticky-top border-bottom transition-all ${darkMode ? 'bg-dark border-secondary' : 'bg-white border-light'}`} style={{ zIndex: 900 }}>
                    <div className="d-flex align-items-center gap-3 ps-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary d-flex align-items-center justify-content-center">
                            <i className="bi bi-shield-lock-fill fs-5"></i>
                        </div>
                        <div>
                            <h6 className={`fw-bold m-0 ${darkMode ? 'text-white' : 'text-dark'}`}>Portail d'Administration</h6>
                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>Délégation Générale à l'État Civil</div>
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
                                <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{currentUser?.prenom || 'Admin'}</div>
                                <div className="text-muted" style={{ fontSize: '0.65rem' }}>{authService.isAdmin() ? 'Administrateur Système' : 'Agent État Civil'}</div>
                            </div>
                            <div className="position-relative">
                                {currentUser?.photo ? (
                                    <img
                                        src={currentUser.photo}
                                        alt="Profil"
                                        className="rounded-circle border border-2 border-primary-subtle shadow-sm"
                                        style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                                        style={{ width: '42px', height: '42px', border: '2px solid rgba(255,255,255,0.2)' }}>
                                        {currentUser?.prenom?.[0] || 'A'}
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
            `}} />
        </div>
    );
};

export default AdminLayout;

