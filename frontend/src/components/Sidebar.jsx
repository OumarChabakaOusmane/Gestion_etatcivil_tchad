import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    const menuItems = [
        { path: '/dashboard', icon: 'bi-grid-fill', label: t('menuDashboard') },
        { path: '/mes-demandes', icon: 'bi-folder-fill', label: t('menuDemandes') },
        { path: '/profil', icon: 'bi-person-fill', label: t('menuProfile') },
        { path: '/aide', icon: 'bi-question-circle-fill', label: t('menuAide') },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="d-flex flex-column py-4" style={{ width: '260px', backgroundColor: '#0a429b', minHeight: '100%' }}>
            <nav className="nav flex-column gap-2 px-3">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`d-flex align-items-center gap-3 px-3 py-3 rounded-3 text-decoration-none transition-all ${isActive(item.path)
                            ? 'bg-white text-primary shadow-sm fw-bold'
                            : 'text-white hover-bg-white-10'
                            }`}
                        style={{ fontSize: '0.95rem' }}
                    >
                        <i className={`bi ${item.icon} fs-5`}></i>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
