import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import authService from '../services/authService';
import { useLanguage } from '../context/LanguageContext';

const CitizenLayout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.getCurrentUser());
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        const handleUserUpdate = () => {
            setUser(authService.getCurrentUser());
        };

        window.addEventListener('storage', handleUserUpdate);
        return () => window.removeEventListener('storage', handleUserUpdate);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        authService.logout();
        navigate('/');
    };

    return (
        <div className="d-flex flex-column h-100 min-vh-100 font-family-sans">
            {/* Top Bar - Dark Blue */}
            <header className="py-3 px-4 d-flex justify-content-between align-items-center text-white shadow-sm" style={{ backgroundColor: '#0a429b', zIndex: 1050 }}>
                <div className="d-flex align-items-center gap-3">
                    <img
                        src="/drapeau-tchad.jpg"
                        alt="Logo Tchad"
                        style={{ height: '40px', width: 'auto', borderRadius: '4px' }}
                    />
                    <h5 className="m-0 fw-bold" style={{ letterSpacing: '0.5px', fontSize: '1rem' }}>{t('etatCivil')}</h5>
                </div>

                <div className="d-flex align-items-center gap-3">
                    {/* Sélecteur de langue Premium */}
                    <div className="d-flex bg-white bg-opacity-10 rounded-pill p-1 me-2 border border-white border-opacity-25 shadow-sm">
                        <button
                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${language === 'fr' ? 'bg-white text-primary shadow-sm' : 'text-whiteBorder border-0'}`}
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => setLanguage('fr')}
                        >
                            FR
                        </button>
                        <button
                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${language === 'ar' ? 'bg-white text-primary shadow-sm' : 'text-white border-0'}`}
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => setLanguage('ar')}
                        >
                            عربي
                        </button>
                    </div>

                    <span className="opacity-75 d-none d-md-block">{t('welcome')}, <span className="fw-bold text-white opacity-100">{user?.prenom || 'Citoyen'}</span></span>

                    <div className="position-relative">
                        <div
                            className="cursor-pointer d-flex align-items-center gap-2"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold border border-2 border-white"
                                style={{ width: '40px', height: '40px' }}>
                                {user?.prenom?.[0] || 'C'}
                            </div>
                            <i className="bi bi-chevron-down small"></i>
                        </div>

                        {showUserMenu && (
                            <div className="position-absolute end-0 mt-3 bg-white text-dark rounded-3 shadow-lg overflow-hidden" style={{ minWidth: '200px', zIndex: 1100 }}>
                                <div className="p-3 border-bottom bg-light">
                                    <p className="mb-0 fw-bold">{user?.prenom} {user?.nom}</p>
                                    <small className="text-muted">{user?.email}</small>
                                </div>
                                <Link to="/profil" className="d-block p-3 text-dark text-decoration-none hover-bg-light border-0">
                                    <i className={`bi bi-person me-2 ${language === 'ar' ? 'ms-2' : ''}`}></i> {t('myProfile')}
                                </Link>
                                <div className="border-top">
                                    <button onClick={handleLogout} className="w-100 text-start p-3 border-0 bg-transparent text-danger hover-bg-light">
                                        <i className={`bi bi-box-arrow-right me-2 ${language === 'ar' ? 'ms-2' : ''}`}></i> {t('logout')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area with Sidebar */}
            <div className="d-flex flex-grow-1 overflow-hidden">
                <Sidebar />
                <main className="flex-grow-1 bg-light p-4 overflow-auto" style={{ backgroundColor: '#f5f7fa' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default CitizenLayout;
