import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import authService from '../services/authService';
import '../styles/layout/Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const user = authService.getCurrentUser();

    const menuItems = [
        { path: '/dashboard', icon: 'bi-grid-fill', label: t('menuDashboard') },
        { path: '/mes-demandes', icon: 'bi-folder-fill', label: t('menuDemandes') },
        { path: '/profil', icon: 'bi-person-fill', label: t('menuProfile') },
        { path: '/aide', icon: 'bi-question-circle-fill', label: t('menuAide') },
    ];

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar-wrapper">
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <i className={`bi ${item.icon} sidebar-icon`}></i>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-snippet shadow-sm">
                    {user?.photo ? (
                        <img src={user.photo} alt="Profile" className="user-avatar-mini" />
                    ) : (
                        <div className="user-avatar-mini bg-primary d-flex align-items-center justify-content-center text-white">
                            <i className="bi bi-person-fill"></i>
                        </div>
                    )}
                    <div className="user-info-mini">
                        <span className="user-name-mini">{user?.prenom} {user?.nom}</span>
                        <span className="user-role-mini text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                            {user?.role === 'admin' ? 'Administrateur' : 'Citoyen'}
                        </span>
                    </div>
                    <button className="logout-trigger" onClick={handleLogout} title="Déconnexion">
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
