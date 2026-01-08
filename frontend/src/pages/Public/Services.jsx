import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import ServiceCard from '../../components/ServiceCard';
import { useLanguage } from '../../context/LanguageContext';

export default function Services() {
    const { t, language } = useLanguage();
    return (
        <div className={`bg-light min-vh-100 ${language === 'ar' ? 'rtl' : ''}`}>
            <PublicNavbar />

            <div className="container py-5 mt-5">
                <div className="text-center mb-5 fade-in">
                    <h1 className="fw-bold display-4 mb-2">{t('servicesTitle')}</h1>
                    <div className="divider mx-auto" style={{ width: '80px', height: '4px', background: 'var(--tchad-blue)', borderRadius: '2px' }}></div>
                    <p className="lead text-muted mt-3 max-w-700 mx-auto">
                        {t('servicesFullSubtitle')}
                    </p>
                </div>

                <div className="row g-4 mb-5">
                    {/* Acte de Naissance */}
                    <div className="col-lg-4">
                        <div className="glass-card p-4 h-100 border-0 shadow-lg hover-translate transition-all rounded-4">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-4 text-primary">
                                <i className="bi bi-file-earmark-person fs-1"></i>
                            </div>
                            <h3 className="fw-bold mb-3">{t('birthCertShort')}</h3>
                            <p className="text-muted small mb-4">
                                {t('serviceBirthFullDesc')}
                            </p>
                            <h6 className="fw-bold small text-uppercase mb-2 text-primary">{t('inclusiveLabel')}</h6>
                            <ul className="list-unstyled small text-muted">
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('birthIncl1')}</li>
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('birthIncl2')}</li>
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('birthIncl3')}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Acte de Mariage */}
                    <div className="col-lg-4">
                        <div className="glass-card p-4 h-100 border-0 shadow-lg hover-translate transition-all rounded-4">
                            <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-flex mb-4 text-danger">
                                <i className="bi bi-heart fs-1"></i>
                            </div>
                            <h3 className="fw-bold mb-3">{t('marriageCertShort')}</h3>
                            <p className="text-muted small mb-4">
                                {t('serviceMarriageFullDesc')}
                            </p>
                            <h6 className="fw-bold small text-uppercase mb-2 text-danger">{t('inclusiveLabel')}</h6>
                            <ul className="list-unstyled small text-muted">
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('marriageIncl1')}</li>
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('marriageIncl2')}</li>
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('marriageIncl3')}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Déclaration de Décès */}
                    <div className="col-lg-4">
                        <div className="glass-card p-4 h-100 border-0 shadow-lg hover-translate transition-all rounded-4">
                            <div className="bg-secondary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-4 text-secondary">
                                <i className="bi bi-file-text fs-1"></i>
                            </div>
                            <h3 className="fw-bold mb-3">{t('deathCertShort')}</h3>
                            <p className="text-muted small mb-4">
                                {t('serviceDeathFullDesc')}
                            </p>
                            <h6 className="fw-bold small text-uppercase mb-2 text-secondary">{t('inclusiveLabel')}</h6>
                            <ul className="list-unstyled small text-muted">
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('deathIncl1')}</li>
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('deathIncl2')}</li>
                                <li className="mb-2"><i className={`bi bi-check2-circle text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('deathIncl3')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Qualité de Service */}
                <div className="glass-card p-5 border-0 shadow-lg rounded-5 mb-5 bg-white">
                    <div className="row align-items-center">
                        <div className="col-md-7">
                            <h2 className="fw-bold mb-4">{t('whyPortalTitle')}</h2>
                            <div className="row g-4">
                                <div className="col-sm-6 text-start">
                                    <h5 className="fw-bold"><i className={`bi bi-lightning-charge-fill text-warning ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('speedTitle')}</h5>
                                    <p className="small text-muted">{t('speedDesc')}</p>
                                </div>
                                <div className="col-sm-6 text-start">
                                    <h5 className="fw-bold"><i className={`bi bi-shield-fill-check text-success ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>{t('securityTitle')}</h5>
                                    <p className="small text-muted">{t('securityDesc')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5 text-center mt-4 mt-md-0">
                            <div className="p-4 bg-light rounded-4">
                                <div className="display-4 fw-bold text-primary mb-1">{t('zeroCfa')}</div>
                                <p className="text-muted fw-bold">{t('freeService')}</p>
                                <hr />
                                <a href="/register" className="btn btn-primary-custom w-100 py-3 shadow-sm rounded-pill">
                                    {t('btnStart')} <i className={`bi ${language === 'ar' ? 'bi-arrow-left me-2' : 'bi-arrow-right ms-2'}`}></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
