import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

export default function Services() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';

    return (
        <div className={`services-page min-vh-100 bg-white overflow-hidden ${isRtl ? 'rtl' : ''}`} style={{ position: 'relative' }}>
            {/* Soft decorative background elements */}
            <div className="bg-decoration">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
            </div>

            <PublicNavbar />

            <div className="container py-5 mt-5 position-relative" style={{ zIndex: 1 }}>
                <div className="text-center mb-5 animate__animated animate__fadeIn">
                    <h5 className="text-primary-dark fw-bold text-uppercase mb-2 tracking-widest" style={{ letterSpacing: '2px' }}>
                        {t('ourServices') || 'Nos Services'}
                    </h5>
                    <h1 className="fw-bold display-4 text-dark mb-3">
                        {t('servicesTitle')}
                    </h1>
                    <div className="divider mx-auto" style={{ width: '60px', height: '4px', background: 'var(--tchad-blue)', borderRadius: '2px' }}></div>
                    <p className="lead text-muted mt-4 max-w-700 mx-auto">
                        {t('servicesFullSubtitle')}
                    </p>
                </div>

                <div className="row g-4 mb-5">
                    {/* Acte de Naissance */}
                    <div className="col-lg-4 animate__animated animate__fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <div className="premium-service-card card h-100 border-0 shadow-soft p-4 rounded-4 transition-all">
                            <div className="icon-wrapper mb-4">
                                <div className="icon-bg bg-primary-soft"></div>
                                <i className="bi bi-file-earmark-person text-primary"></i>
                            </div>
                            <h4 className="fw-bold mb-3 text-dark">{t('birthCertShort')}</h4>
                            <p className="text-muted small mb-4 flex-grow-1">
                                {t('serviceBirthFullDesc')}
                            </p>

                            <div className="inclusions mb-4">
                                <ul className="list-unstyled mb-0">
                                    <li className="mb-2 d-flex align-items-center small text-secondary">
                                        <i className={`bi bi-check2 text-primary ${isRtl ? 'ms-2' : 'me-2'}`}></i> {t('birthIncl1')}
                                    </li>
                                    <li className="mb-2 d-flex align-items-center small text-secondary">
                                        <i className={`bi bi-check2 text-primary ${isRtl ? 'ms-2' : 'me-2'}`}></i> {t('birthIncl2')}
                                    </li>
                                </ul>
                            </div>

                            <Link to="/register" className="btn btn-primary-outline rounded-pill py-2 fw-bold text-uppercase small tracking-wide">
                                {t('btnStart') || 'Commencer'} <i className={`bi ${isRtl ? 'bi-chevron-left me-2' : 'bi-chevron-right ms-2'}`}></i>
                            </Link>
                        </div>
                    </div>

                    {/* Acte de Mariage */}
                    <div className="col-lg-4 animate__animated animate__fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="premium-service-card card h-100 border-0 shadow-soft p-4 rounded-4 transition-all">
                            <div className="icon-wrapper mb-4">
                                <div className="icon-bg bg-danger-soft"></div>
                                <i className="bi bi-heart text-danger"></i>
                            </div>
                            <h4 className="fw-bold mb-3 text-dark">{t('marriageCertShort')}</h4>
                            <p className="text-muted small mb-4 flex-grow-1">
                                {t('serviceMarriageFullDesc')}
                            </p>

                            <div className="inclusions mb-4">
                                <ul className="list-unstyled mb-0">
                                    <li className="mb-2 d-flex align-items-center small text-secondary">
                                        <i className={`bi bi-check2 text-danger ${isRtl ? 'ms-2' : 'me-2'}`}></i> {t('marriageIncl1')}
                                    </li>
                                    <li className="mb-2 d-flex align-items-center small text-secondary">
                                        <i className={`bi bi-check2 text-danger ${isRtl ? 'ms-2' : 'me-2'}`}></i> {t('marriageIncl2')}
                                    </li>
                                </ul>
                            </div>

                            <Link to="/register" className="btn btn-danger-outline rounded-pill py-2 fw-bold text-uppercase small tracking-wide">
                                {t('btnStart') || 'Commencer'} <i className={`bi ${isRtl ? 'bi-chevron-left me-2' : 'bi-chevron-right ms-2'}`}></i>
                            </Link>
                        </div>
                    </div>

                    {/* Déclaration de Décès */}
                    <div className="col-lg-4 animate__animated animate__fadeInUp" style={{ animationDelay: '0.3s' }}>
                        <div className="premium-service-card card h-100 border-0 shadow-soft p-4 rounded-4 transition-all">
                            <div className="icon-wrapper mb-4">
                                <div className="icon-bg bg-dark-soft"></div>
                                <i className="bi bi-file-text text-dark"></i>
                            </div>
                            <h4 className="fw-bold mb-3 text-dark">{t('deathCertShort')}</h4>
                            <p className="text-muted small mb-4 flex-grow-1">
                                {t('serviceDeathFullDesc')}
                            </p>

                            <div className="inclusions mb-4">
                                <ul className="list-unstyled mb-0">
                                    <li className="mb-2 d-flex align-items-center small text-secondary">
                                        <i className={`bi bi-check2 text-dark ${isRtl ? 'ms-2' : 'me-2'}`}></i> {t('deathIncl1')}
                                    </li>
                                    <li className="mb-2 d-flex align-items-center small text-secondary">
                                        <i className={`bi bi-check2 text-dark ${isRtl ? 'ms-2' : 'me-2'}`}></i> {t('deathIncl2')}
                                    </li>
                                </ul>
                            </div>

                            <Link to="/register" className="btn btn-dark-outline rounded-pill py-2 fw-bold text-uppercase small tracking-wide">
                                {t('btnStart') || 'Commencer'} <i className={`bi ${isRtl ? 'bi-chevron-left me-2' : 'bi-chevron-right ms-2'}`}></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Promotional Banner */}
                <div className="cta-banner rounded-5 p-5 text-white overflow-hidden animate__animated animate__fadeIn" style={{ position: 'relative', background: 'linear-gradient(135deg, #001a41 0%, #003366 100%)' }}>
                    <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
                        <div className="col-lg-8 mb-4 mb-lg-0">
                            <h2 className="fw-bold display-6 mb-3">Prêt à simplifier vos démarches ?</h2>
                            <p className="opacity-75 lead mb-0">Obtenez vos actes civils certifiés sans quitter votre domicile. La plateforme officielle 100% sécurisée.</p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/register" className="btn btn-warning rounded-pill px-5 py-3 fw-bold shadow-lg hover-lift">
                                {t('createAccount') || 'Créer mon compte gratuitement'}
                            </Link>
                        </div>
                    </div>
                    {/* Banner Decorative element */}
                    <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                </div>
            </div>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-decoration {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                }
                .circle {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                }
                .circle-1 {
                    width: 400px;
                    height: 400px;
                    background: rgba(0, 26, 65, 0.05);
                    top: -100px;
                    right: -100px;
                }
                .circle-2 {
                    width: 300px;
                    height: 300px;
                    background: rgba(254, 203, 0, 0.05);
                    bottom: 20%;
                    left: -50px;
                }
                .circle-3 {
                    width: 200px;
                    height: 200px;
                    background: rgba(210, 16, 52, 0.03);
                    top: 40%;
                    left: 40%;
                }

                .premium-service-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                }
                .premium-service-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0, 26, 65, 0.1);
                    background: #fff;
                    border-color: var(--tchad-blue) !important;
                }

                .icon-wrapper {
                    position: relative;
                    width: 65px;
                    height: 65px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                }
                .icon-bg {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 18px;
                    transform: rotate(-10deg);
                    transition: all 0.3s ease;
                }
                .premium-service-card:hover .icon-bg {
                    transform: rotate(0deg) scale(1.1);
                }
                
                .bg-primary-soft { background-color: rgba(0, 26, 65, 0.1); }
                .bg-danger-soft { background-color: rgba(210, 16, 52, 0.1); }
                .bg-dark-soft { background-color: rgba(33, 37, 41, 0.1); }

                .btn-primary-outline {
                    border: 2px solid #001a41;
                    color: #001a41;
                    transition: all 0.3s ease;
                }
                .btn-primary-outline:hover {
                    background: #001a41;
                    color: #fff;
                }

                .btn-danger-outline {
                    border: 2px solid #d21034;
                    color: #d21034;
                    transition: all 0.3s ease;
                }
                .btn-danger-outline:hover {
                    background: #d21034;
                    color: #fff;
                }

                .btn-dark-outline {
                    border: 2px solid #212529;
                    color: #212529;
                    transition: all 0.3s ease;
                }
                .btn-dark-outline:hover {
                    background: #212529;
                    color: #fff;
                }

                .tracking-widest { letter-spacing: 0.1em; }
                .text-primary-dark { color: #001a41; }
                .shadow-soft { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08); }
                .hover-lift:hover { transform: translateY(-5px); }
            `}} />
        </div>
    );
}
