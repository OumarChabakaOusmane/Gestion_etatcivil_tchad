import { useState } from "react";
import PublicNavbar from "../../components/PublicNavbar";
import { Link } from "react-router-dom";
import authService from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext";

export default function ForgotPassword() {
    const { t, language } = useLanguage();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await authService.forgotPassword(email);
            setMessage(t('emailSent'));
        } catch (err) {
            setError(language === 'ar' ? "فشل إرسال الرابط. تحقق من البريد الإلكتروني." : "Impossible d'envoyer le lien. Vérifiez l'email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PublicNavbar />
            <div className={`min-vh-100 d-flex align-items-center position-relative overflow-hidden ${language === 'ar' ? 'rtl' : ''}`} style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
                <div className="container position-relative py-5">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-5">
                            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                                <div className="card-body p-4 p-md-5">
                                    <div className="text-center mb-4">
                                        <div className="d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#ffe4e6', color: '#e11d48' }}>
                                            <span style={{ fontSize: '2.5rem' }}>🔐</span>
                                        </div>
                                        <h2 className="fw-bold mb-2">{t('forgotPassTitle')}</h2>
                                        <p className="text-muted">
                                            {t('forgotPassDesc')}
                                        </p>
                                    </div>

                                    {message ? (
                                        <div className="alert alert-success border-0 rounded-3 d-flex align-items-center mb-4" role="alert" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                                            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                                            <div>{message}</div>
                                        </div>
                                    ) : (
                                        <>
                                            {error && (
                                                <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center mb-4" role="alert" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                                    <i className="bi bi-exclamation-circle-fill me-2 fs-5"></i>
                                                    <div>{error}</div>
                                                </div>
                                            )}

                                            <form onSubmit={handleSubmit}>
                                                <div className="form-floating mb-4">
                                                    <input
                                                        type="email"
                                                        className="form-control border-light bg-light"
                                                        id="email"
                                                        placeholder="Email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        style={{ height: '60px', borderRadius: '12px' }}
                                                    />
                                                    <label htmlFor="email" className={`text-muted ${language === 'ar' ? 'pe-4' : 'ps-4'}`}>{t('labelEmailAuth')}</label>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="btn btn-primary w-100 py-3 fw-bold mb-3 shadow-sm hover-translate hover-translate-primary"
                                                    style={{ borderRadius: '12px' }}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            {t('sending')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {t('btnSendLink')} <i className={`bi ${language === 'ar' ? 'bi-send-fill me-2' : 'bi-send ms-2'}`}></i>
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </>
                                    )}

                                    <div className="text-center">
                                        <Link to="/login" className="text-decoration-none fw-bold text-muted">
                                            <i className={`bi ${language === 'ar' ? 'bi-arrow-right ms-2' : 'bi-arrow-left me-2'}`}></i>{t('backToLogin')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
