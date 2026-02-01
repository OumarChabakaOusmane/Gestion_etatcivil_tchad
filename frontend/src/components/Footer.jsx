import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t, language } = useLanguage();
    return (
        <footer className={`footer-dark py-5 ${language === 'ar' ? 'rtl' : ''}`} style={{ backgroundColor: '#111', color: '#eee', borderTop: '1px solid #333' }}>
            <div className="container">
                <div className="row g-4">
                    {/* Brand & About */}
                    <div className="col-lg-4 col-md-6">
                        <div className="mb-4">
                            <Link className="navbar-brand text-white fs-4 fw-bold d-flex align-items-center gap-2" to="/">
                                <span className="fs-4">🇹🇩</span> {t('etatCivil')}
                            </Link>
                        </div>
                        <p className="mb-4" style={{ lineHeight: 1.8, color: '#ccc', fontSize: '1.05rem' }}>
                            {t('footerAbout')}
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-icon"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="social-icon"><i className="bi bi-twitter"></i></a>
                            <a href="#" className="social-icon"><i className="bi bi-instagram"></i></a>
                            <a href="#" className="social-icon"><i className="bi bi-linkedin"></i></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-2 col-md-6">
                        <h5 className="text-white mb-4 fw-bold">{t('footerNav')}</h5>
                        <ul className="list-unstyled footer-links">
                            <li className="mb-2"><Link to="/">{t('navHome')}</Link></li>
                            <li className="mb-2"><Link to="/services">{t('navServices')}</Link></li>
                            <li className="mb-2"><Link to="/contact">{t('navContact')}</Link></li>
                            <li className="mb-2"><Link to="/login">{t('navConnexion')}</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-white mb-4 fw-bold">{t('footerServices')}</h5>
                        <ul className="list-unstyled footer-links">
                            <li className="mb-2"><Link to="/demande/naissance">{t('birthCertShort')}</Link></li>
                            <li className="mb-2"><Link to="/demande/mariage">{t('marriageCertShort')}</Link></li>
                            <li className="mb-2"><Link to="/demande/deces">{t('deathCertShort')}</Link></li>
                            <li className="mb-2"><Link to="/dashboard">{t('citizenSpace')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-white mb-4 fw-bold">{t('contactTitle')}</h5>
                        <ul className="list-unstyled contact-info-list">
                            <li className="mb-3 d-flex align-items-start text-start">
                                <i className={`bi bi-geo-alt mt-1 text-primary ${language === 'ar' ? 'ms-3' : 'me-3'}`}></i>
                                <span>{t('addrValue')}</span>
                            </li>
                            <li className="mb-3 d-flex align-items-center text-start">
                                <i className={`bi bi-telephone text-primary ${language === 'ar' ? 'ms-3' : 'me-3'}`}></i>
                                <span>+235 XX XX XX XX</span>
                            </li>
                            <li className="mb-3 d-flex align-items-center text-start">
                                <i className={`bi bi-envelope text-primary ${language === 'ar' ? 'ms-3' : 'me-3'}`}></i>
                                <span>contact@etatcivil.td</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-5" style={{ borderColor: '#333' }} />

                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="text-white-50 mb-0">&copy; {t('footerRights')}</p>
                    </div>
                    <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
                        <p className="text-white-50 mb-0">
                            {t('footerBuiltWith')}
                        </p>
                    </div>
                </div>
            </div>


        </footer>
    );
}
