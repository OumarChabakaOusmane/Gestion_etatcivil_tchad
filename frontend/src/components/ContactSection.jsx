import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ContactSection() {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Message envoyé:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ nom: '', email: '', sujet: '', message: '' });
        }, 3000);
    };

    return (
        <section id="contact-section" className="py-5 bg-light">
            <div className="container py-5">
                <div className={`row g-5 ${language === 'ar' ? 'rtl' : ''}`}>
                    {/* Formulaire de contact */}
                    <div className="col-lg-7">
                        <h1 className="fw-bold mb-4">{t('contactTitle')}</h1>
                        <p className="lead mb-4 text-muted">
                            {t('contactSubtitle')}
                        </p>

                        {submitted && (
                            <div className="alert alert-success">
                                ✅ {t('contactSuccess')}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <label htmlFor="nom">{t('labelName')}</label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            id="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <label htmlFor="email">{t('labelEmail')}</label>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="form-floating">
                                        <input
                                            type="text"
                                            name="sujet"
                                            className="form-control"
                                            id="sujet"
                                            placeholder="Sujet"
                                            value={formData.sujet}
                                            onChange={handleChange}
                                            required
                                        />
                                        <label htmlFor="sujet">{t('labelSubject')}</label>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="form-floating">
                                        <textarea
                                            name="message"
                                            className="form-control"
                                            id="message"
                                            placeholder="Message"
                                            style={{ height: '180px' }}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                        <label htmlFor="message">{t('labelMessage')}</label>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary-custom btn-lg w-100">
                                        <i className={`bi bi-send ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>
                                        {t('btnSend')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Informations de contact */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-4">{t('contactInfo')}</h4>
                                <p className="text-muted mb-4">
                                    {t('contactInfoDesc')}
                                </p>

                                <div className="mb-4">
                                    <div className="d-flex align-items-start mb-3">
                                        <div className={`icon-box ${language === 'ar' ? 'ms-3' : 'me-3'}`} style={{ width: '48px', height: '48px', background: 'var(--primary-soft)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-geo-alt text-primary fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">{t('addrLabel')}</h6>
                                            <p className="text-muted mb-0 small">{t('addrValue')}</p>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-start mb-3">
                                        <div className={`icon-box ${language === 'ar' ? 'ms-3' : 'me-3'}`} style={{ width: '48px', height: '48px', background: 'var(--primary-soft)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-telephone text-primary fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">{t('phoneLabel')}</h6>
                                            <p className="text-muted mb-0 small">+235 XX XX XX XX</p>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-start mb-3">
                                        <div className={`icon-box ${language === 'ar' ? 'ms-3' : 'me-3'}`} style={{ width: '48px', height: '48px', background: 'var(--primary-soft)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-envelope text-primary fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">{t('emailLabel')}</h6>
                                            <p className="text-muted mb-0 small">contact@etatcivil.td</p>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-start">
                                        <div className={`icon-box ${language === 'ar' ? 'ms-3' : 'me-3'}`} style={{ width: '48px', height: '48px', background: 'var(--primary-soft)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-clock text-primary fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">{t('hoursLabel')}</h6>
                                            <p className="text-muted mb-0 small" style={{ whiteSpace: 'pre-line' }}>
                                                {t('hoursValue')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
