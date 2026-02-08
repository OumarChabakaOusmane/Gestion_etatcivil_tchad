import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../../services/authService";
import PublicNavbar from "../../components/PublicNavbar";
import { useLanguage } from "../../context/LanguageContext";

export default function VerifyOtp() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    // const otpCodeFromRegistration = location.state?.otpCode; // REMOVED
    // const justRegistered = location.state?.justRegistered; // REMOVED

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [message, setMessage] = useState("");

    if (!email) {
        return (
            <div className="container mt-5 text-center">
                <h3>Erreur : Email manquant</h3>
                <Link to="/login" className="btn btn-primary mt-3">Retour connexion</Link>
            </div>
        );
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authService.verifyOtp(email, otp);
            // Succès : Redirection Dashboard
            navigate("/dashboard");
        } catch (err) {
            let errorMessage = "Code invalide ou expiré";
            if (typeof err === 'string') {
                errorMessage = err;
            } else {
                const apiMessage = err.response?.data?.message || err.message;
                if (typeof apiMessage === 'string') {
                    errorMessage = apiMessage;
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setMessage("");
        setError("");
        try {
            await authService.resendOtp(email);
            setMessage("Nouveau code envoyé par email !");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Erreur lors de l'envoi du code");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <>
            <PublicNavbar />
            <div className={`min-vh-100 d-flex align-items-center justify-content-center bg-light ${language === 'ar' ? 'rtl' : ''}`}>
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "500px", width: "100%" }}>
                    <div className="card-body p-5 text-center">
                        <div className="mb-4">
                            <div className="mx-auto bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                                <i className="bi bi-shield-lock-fill fs-1"></i>
                            </div>
                        </div>

                        <h2 className="fw-bold mb-2"><span>Vérification de sécurité</span></h2>
                        <p className="text-muted mb-4">
                            <span>Un code à 6 chiffres a été envoyé à </span><strong><span>{email}</span></strong>
                        </p>

                        {/* OTP DISPLAY REMOVED FOR SECURITY */}

                        {error && <div key="otp-error-alert" translate="no" className="alert alert-danger py-2 mb-3 small"><span>{error}</span></div>}
                        {message && <div key="otp-success-message" translate="no" className="alert alert-success py-2 mb-3 small"><span>{message}</span></div>}

                        <form onSubmit={handleVerify}>
                            <div className="mb-4">
                                <label className="form-label small text-muted">Entrez le code à 6 chiffres</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg text-center fw-bold letter-spacing-2"
                                    placeholder="______"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    style={{ letterSpacing: '8px', fontSize: '1.5rem' }}
                                    autoFocus
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm mb-3" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle-fill me-2"></i>}
                                Valider mon compte
                            </button>
                        </form>

                        <div className="border-top pt-3 mt-3">
                            <p className="text-muted small mb-2">
                                <i className="bi bi-info-circle me-1"></i>
                                Vous n'avez pas reçu le code ?
                            </p>
                            <button
                                onClick={handleResend}
                                className="btn btn-link text-decoration-none fw-semibold"
                                disabled={resendLoading}
                            >
                                {resendLoading ? "Envoi en cours..." : "Renvoyer le code par email"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

