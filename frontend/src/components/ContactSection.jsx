import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import contactService from '../services/contactService';

export default function ContactSection() {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await contactService.submitMessage(formData);
            if (response.success) {
                setSubmitted(true);
                setFormData({ nom: '', email: '', sujet: '', message: '' });
                setTimeout(() => setSubmitted(false), 5000);
            }
        } catch (err) {
            console.error('Erreur contact:', err);
            setError(err.message || "Une erreur est survenue lors de l'envoi.");
        } finally {
            setLoading(false);
        }
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
                            <div className="alert alert-success border-0 shadow-sm rounded-4 animate__animated animate__fadeIn">
                                ✅ {t('contactSuccess')}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger border-0 shadow-sm rounded-4 animate__animated animate__shakeX">
                                ❌ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="animate__animated animate__fadeInLeft">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-floating shadow-sm">
                                        <input
                                            type="text"
                                            name="nom"
                                            className="form-control border-0"
                                            id="nom"
                                            placeholder={t('labelName')}
                                            value={formData.nom}
                                            onChange={handleChange}
                                            required
                                        />
                                        <label htmlFor="nom">{t('labelName')}</label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating shadow-sm">
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control border-0"
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
                                    <div className="form-floating shadow-sm">
                                        <input
                                            type="text"
                                            name="sujet"
                                            className="form-control border-0"
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
                                    <div className="form-floating shadow-sm">
                                        <textarea
                                            name="message"
                                            className="form-control border-0"
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
                                    <button
                                        type="submit"
                                        className="btn btn-primary-custom btn-lg w-100 py-3 rounded-pill shadow hover-lift transition-all d-flex align-items-center justify-content-center"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                {t('sending')}...
                                            </>
                                        ) : (
                                            <>
                                                <i className={`bi bi-send ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>
                                                {t('btnSend')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Informations de contact */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-lg h-100 animate__animated animate__fadeInRight" style={{ borderRadius: '24px' }}>
                            <div className="card-body p-4 p-md-5">
                                <h4 className="fw-bold mb-4 d-flex align-items-center gap-3">
                                    <span className="bg-primary bg-opacity-10 p-2 rounded-3">
                                        <i className="bi bi-info-circle-fill text-primary"></i>
                                    </span>
                                    {t('contactInfo')}
                                </h4>
                                <p className="text-muted mb-5 lh-base">
                                    {t('contactInfoDesc')}
                                </p>

                                <div className="contact-list">
                                    {/* Adresse */}
                                    <div className="d-flex align-items-start gap-4 mb-4 pb-4 border-bottom border-light">
                                        <div className="flex-shrink-0 bg-primary bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                            <i className="bi bi-geo-alt-fill text-primary fs-4"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark">{t('addrLabel')}</h6>
                                            <p className="text-muted mb-0">{t('addrValue')}</p>
                                        </div>
                                    </div>

                                    {/* Téléphone */}
                                    <div className="d-flex align-items-start gap-4 mb-4 pb-4 border-bottom border-light">
                                        <div className="flex-shrink-0 bg-success bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                            <i className="bi bi-telephone-fill text-success fs-4"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark">{t('phoneLabel')}</h6>
                                            <p className="text-muted mb-0">{t('phoneValue')}</p>
                                        </div>
                                    </div>

                                    {/* E-mail */}
                                    <div className="d-flex align-items-start gap-4 mb-4 pb-4 border-bottom border-light">
                                        <div className="flex-shrink-0 bg-info bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                            <i className="bi bi-envelope-fill text-info fs-4"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark">{t('emailLabel')}</h6>
                                            <p className="text-muted mb-0">contact@etatcivil.td</p>
                                        </div>
                                    </div>

                                    {/* Horaires */}
                                    <div className="d-flex align-items-start gap-4">
                                        <div className="flex-shrink-0 bg-warning bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                            <i className="bi bi-clock-fill text-warning fs-4"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark">{t('hoursLabel')}</h6>
                                            <p className="text-muted mb-0 small" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
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
