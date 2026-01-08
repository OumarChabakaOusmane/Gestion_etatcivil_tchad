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
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className={`container ${language === 'ar' ? 'rtl' : ''}`}>
                <Link className="navbar-brand fw-bold text-primary d-flex align-items-center gap-3" to="/">
                    <img
                        src="/drapeau-tchad.jpg"
                        alt="Logo Tchad"
                        style={{ height: '45px', width: 'auto', borderRadius: '4px' }}
                    />
                    <div className="d-flex flex-column" style={{ lineHeight: '1.2' }}>
                        <span style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>{t('etatCivil')}</span>
                    </div>
                </Link>

                <button
                    className="navbar-toggler"
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
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-4">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/') ? 'fw-bold text-primary' : 'text-dark opacity-75'}`}
                                to="/"
                            >
                                {t('navHome')}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link text-decoration-none text-dark opacity-75"
                                onClick={() => scrollToSection('services')}
                                style={{ border: 'none', background: 'none' }}
                            >
                                {t('navServices')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link text-decoration-none text-dark opacity-75"
                                onClick={() => scrollToSection('comment-ca-marche')}
                                style={{ border: 'none', background: 'none' }}
                            >
                                {t('navSteps')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link text-decoration-none text-dark opacity-75"
                                onClick={() => scrollToSection('contact-section')}
                                style={{ border: 'none', background: 'none' }}
                            >
                                {t('navContact')}
                            </button>
                        </li>
                        <li className="nav-item ms-lg-4">
                            <div className="d-flex align-items-center gap-3">
                                {/* Sélecteur de langue */}
                                <div className="d-flex bg-light rounded-pill p-1 border shadow-sm me-2">
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${language === 'fr' ? 'bg-primary text-white shadow-sm' : 'text-dark border-0'}`}
                                        style={{ fontSize: '0.7rem' }}
                                        onClick={() => setLanguage('fr')}
                                    >
                                        FR
                                    </button>
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${language === 'ar' ? 'bg-primary text-white shadow-sm' : 'text-dark border-0'}`}
                                        style={{ fontSize: '0.7rem' }}
                                        onClick={() => setLanguage('ar')}
                                    >
                                        AR
                                    </button>
                                </div>

                                {localStorage.getItem('user') ? (
                                    <Link
                                        to="/dashboard"
                                        className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                                    >
                                        <i className="bi bi-speedometer2"></i>
                                        {t('navDashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2"
                                            style={{ borderWidth: '1.5px' }}
                                        >
                                            <i className="bi bi-box-arrow-in-right"></i>
                                            {t('navConnexion')}
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                                        >
                                            <i className="bi bi-person-plus"></i>
                                            {t('navInscription')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
