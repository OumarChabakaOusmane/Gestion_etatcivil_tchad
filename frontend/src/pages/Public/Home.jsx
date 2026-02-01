import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import ServiceCard from '../../components/ServiceCard';
import DemandeCard from '../../components/DemandeCard';
import HelpSection from '../../components/HelpSection';
import ContactSection from '../../components/ContactSection';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

export default function Home() {
    const { t, language } = useLanguage();
    return (
        <div className={language === 'ar' ? 'rtl' : ''}>
            <PublicNavbar />

            {/* Hero Section Premium */}
            <section id="accueil" className="hero-section position-relative overflow-hidden" style={{
                backgroundImage: `linear-gradient(135deg, rgba(0, 32, 91, 0.85) 0%, rgba(0, 32, 91, 0.6) 100%), url('/logotechad.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container position-relative" style={{ zIndex: 2 }}>
                    <div className="row">
                        <div className="col-lg-8 animate__animated animate__fadeInUp">
                            <h1 className="hero-title fw-bold text-white mb-4" style={{ fontSize: '3.5rem', lineHeight: '1.2' }}>
                                {t('homeTitle')} <br />
                                <span className="text-warning">{t('homeTitle2')}</span>
                            </h1>
                            <p className="hero-subtitle text-white-50 fs-4 mb-5" style={{ maxWidth: '600px' }}>
                                {t('homeSubtitle')}
                            </p>
                            <div className="d-flex gap-3 hero-actions">
                                <Link to="/register" className="btn btn-primary-custom btn-lg px-5 py-3 rounded-pill shadow-lg hover-lift transition-all">
                                    <i className="bi bi-person-plus me-2"></i>
                                    {t('btnStart')}
                                </Link>
                                <a href="#services" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill hover-lift transition-all">
                                    {t('btnLearnMore')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-5 bg-white">
                <div className="container py-5">
                    <div className="section-title">
                        <h2>{t('servicesTitle')}</h2>
                        <div className="divider"></div>
                        <p className="mt-3 text-muted">{t('servicesSubtitle')}</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <ServiceCard
                                icon="bi bi-file-earmark-person"
                                title={t('birthCert').split(' ').pop()}
                                description={t('serviceBirthDesc')}
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ServiceCard
                                icon="bi bi-heart"
                                title={t('marriageCert').split(' ').pop()}
                                description={t('serviceMarriageDesc')}
                                color="#e11d48"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ServiceCard
                                icon="bi bi-file-text"
                                title={t('deathCert').split(' ').pop()}
                                description={t('serviceDeathDesc')}
                                color="#64748b"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <ServiceCard
                                icon="bi bi-folder-open"
                                title={t('menuDemandes')}
                                description={t('serviceTrackDesc')}
                                color="#10b981"
                            />
                        </div>
                    </div>
                </div>
            </section >

            {/* How it works */}
            < section id="comment-ca-marche" className="bg-light py-5" >
                <div className="container py-5">
                    <div className="section-title">
                        <h2>{t('howItWorksTitle')}</h2>
                        <div className="divider"></div>
                    </div>

                    <div className="row g-4 mt-4">
                        <div className="col-md-3 text-center">
                            <div className="display-5 text-primary mb-3">1️⃣</div>
                            <h5>{t('step1Title')}</h5>
                            <p className="text-muted">
                                {t('step1Desc')}
                            </p>
                        </div>

                        <div className="col-md-3 text-center">
                            <div className="display-5 text-primary mb-3">2️⃣</div>
                            <h5>{t('step2Title')}</h5>
                            <p className="text-muted">
                                {t('step2Desc')}
                            </p>
                        </div>

                        <div className="col-md-3 text-center">
                            <div className="display-5 text-primary mb-3">3️⃣</div>
                            <h5>{t('step3Title')}</h5>
                            <p className="text-muted">
                                {t('step3Desc')}
                            </p>
                        </div>

                        <div className="col-md-3 text-center">
                            <div className="display-5 text-primary mb-3">4️⃣</div>
                            <h5>{t('step4Title')}</h5>
                            <p className="text-muted">
                                {t('step4Desc')}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-5">
                        <Link to="/register" className="btn btn-primary-custom">
                            {t('btnStart')}
                        </Link>
                    </div>
                </div>
            </section >

            {/* Demandes Section */}
            < section id="demandes" className="py-5" style={{ backgroundColor: '#f8fafc' }
            }>
                <div className="container py-5">
                    <div className="section-title">
                        <h2>{t('demandeSectionTitle')}</h2>
                        <div className="divider"></div>
                        <p className="mt-3 text-muted">{t('demandeSectionSubtitle')}</p>
                    </div>

                    <div className="demande-grid">
                        <DemandeCard
                            icon="bi bi-file-earmark-person"
                            title={t('birthCertShort')}
                            description={t('birthCertDesc')}
                            type="naissance"
                        />
                        <DemandeCard
                            icon="bi bi-heart"
                            title={t('marriageCertShort')}
                            description={t('marriageCertDesc')}
                            type="mariage"
                            iconColor="#e11d48"
                        />
                        <DemandeCard
                            icon="bi bi-file-text"
                            title={t('deathCertShort')}
                            description={t('deathCertDesc')}
                            type="deces"
                            iconColor="#64748b"
                        />
                    </div>
                </div>
            </section >

            <HelpSection />

            <ContactSection />

            <Footer />
        </div >
    );
}
