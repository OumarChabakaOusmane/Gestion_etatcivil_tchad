import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PublicNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();

    // Fonction pour vérifier si le lien est actif
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Fonction pour naviguer vers une section
    const scrollToSection = (sectionId) => {
        // Si on est déjà sur la page d'accueil
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Sinon, naviguer vers la page d'accueil puis scroller
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-lg"
            style={{
                background: '#001a41',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.8rem 0'
            }}>
            <div className={`container ${language === 'ar' ? 'rtl' : ''}`}>
                <Link className="brand-logo-modern" to="/">
                    <div className="tchad-flag-clean">
                        <div className="bar-blue"></div>
                        <div className="bar-yellow"></div>
                        <div className="bar-red"></div>
                    </div>
                    <div className="brand-text-container">
                        <span className="brand-main-text" style={{ color: '#ffffff' }}>{t('etatCivil')}</span>
                        <span className="brand-sub-text" style={{ color: '#ffffff', opacity: 0.8 }}>République du Tchad</span>
                    </div>
                </Link>

                <button
                    className="navbar-toggler border-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#publicNavbar"
                    aria-controls="publicNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="publicNavbar">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-lg-4">
                        <li className="nav-item">
                            <Link
                                className={`nav-link px-3 ${isActive('/') ? 'active fw-bold text-white' : 'text-white-50'}`}
                                to="/"
                                style={{ transition: 'all 0.3s ease' }}
                            >
                                {t('navHome')}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link text-decoration-none text-white-50 px-3"
                                onClick={() => scrollToSection('services')}
                                style={{ border: 'none', background: 'none', transition: 'all 0.3s ease' }}
                            >
                                {t('navServices')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link text-decoration-none text-white-50 px-3"
                                onClick={() => scrollToSection('comment-ca-marche')}
                                style={{ border: 'none', background: 'none', transition: 'all 0.3s ease' }}
                            >
                                {t('navSteps')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link text-decoration-none text-white-50 px-3"
                                onClick={() => scrollToSection('aide')}
                                style={{ border: 'none', background: 'none', transition: 'all 0.3s ease' }}
                            >
                                {t('navAide')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link px-3 ${isActive('/actualites') ? 'active fw-bold text-white' : 'text-white-50'}`}
                                to="/actualites"
                                style={{ transition: 'all 0.3s ease' }}
                            >
                                Actualités
                            </Link>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link text-decoration-none text-white-50 px-3"
                                onClick={() => scrollToSection('contact-section')}
                                style={{ border: 'none', background: 'none', transition: 'all 0.3s ease' }}
                            >
                                {t('navContact')}
                            </button>
                        </li>

                        <li className="nav-item ms-lg-2">
                            <div className="d-flex align-items-center gap-3">
                                {/* Sélecteur de langue */}
                                <div className="d-flex bg-white bg-opacity-10 rounded-pill p-1 border border-white border-opacity-10 shadow-sm">
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${language === 'fr' ? 'bg-white text-primary shadow-sm' : 'text-white border-0 opacity-75'}`}
                                        style={{ fontSize: '0.7rem' }}
                                        onClick={() => setLanguage('fr')}
                                    >
                                        FR
                                    </button>
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${language === 'ar' ? 'bg-white text-primary shadow-sm' : 'text-white border-0 opacity-75'}`}
                                        style={{ fontSize: '0.7rem' }}
                                        onClick={() => setLanguage('ar')}
                                    >
                                        AR
                                    </button>
                                </div>

                                {localStorage.getItem('user') ? (
                                    <Link
                                        to="/dashboard"
                                        className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm border-0"
                                        style={{ background: '#FECB00', color: '#002664', fontWeight: '700' }}
                                    >
                                        <i className="bi bi-speedometer2"></i>
                                        {t('navDashboard')}
                                    </Link>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <Link
                                            to="/login"
                                            className="btn btn-outline-light rounded-pill px-4 d-flex align-items-center gap-2 border-white border-opacity-50"
                                            style={{ borderWidth: '1.5px', fontSize: '0.9rem' }}
                                        >
                                            <i className="bi bi-box-arrow-in-right"></i>
                                            {t('navConnexion')}
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 border-0 shadow-sm"
                                            style={{ background: '#FECB00', color: '#002664', fontWeight: '700', fontSize: '0.9rem' }}
                                        >
                                            <i className="bi bi-person-plus"></i>
                                            {t('navInscription')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .nav-link:hover {
                    color: white !important;
                    opacity: 1 !important;
                }
                .nav-link.active::after {
                    display: none;
                }
            `}} />
        </nav>
    );
}
