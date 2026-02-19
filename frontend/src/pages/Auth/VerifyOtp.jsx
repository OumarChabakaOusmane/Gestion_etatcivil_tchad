import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../../services/authService";
import PublicNavbar from "../../components/PublicNavbar";
import { useLanguage } from "../../context/LanguageContext";

export default function VerifyOtp() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const telephone = location.state?.telephone || "";
    const [otp, setOtp] = useState("");
    const [otpFromState, setOtpFromState] = useState(location.state?.otpCode || "");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Utilisation de useEffect pour rediriger si l'email est manquant
    // Cela évite les plantages au rendu initial sur certaines machines
    useEffect(() => {
        if (!email) {
            const timer = setTimeout(() => {
                navigate("/login");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [email, navigate]);

    if (!email) {
        return (
            <div className="container min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center p-5 card shadow-sm border-0 rounded-4">
                    <i className="bi bi-exclamation-triangle text-warning display-1 mb-3"></i>
                    <h3 className="fw-bold">Session expirée</h3>
                    <p className="text-muted">Veuillez retourner à la page de connexion pour renvoyer un code.</p>
                    <Link to="/login" className="btn btn-primary rounded-pill px-4 mt-2">Retour connexion</Link>
                </div>
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
            const response = await authService.resendOtp(email);
            setMessage("Nouveau code généré !");
            if (response.otpCode) {
                setOtpFromState(response.otpCode);
            }
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

                        <h2 className="fw-bold mb-2">Vérification de sécurité</h2>
                        <p className="text-muted mb-2">
                            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
                        </p>
                        <div className="alert alert-warning border-0 shadow-sm mb-4 d-flex align-items-start gap-2" style={{ fontSize: '0.9rem' }}>
                            <i className="bi bi-exclamation-triangle-fill mt-1"></i>
                            <div className="text-start">
                                <strong>Important :</strong> Si vous ne voyez pas l'email, vérifiez votre dossier <strong>SPAM</strong>. Vous pouvez également demander un nouveau code ci-dessous.
                            </div>
                        </div>

                        {error && <div className="alert alert-danger py-2 mb-3 small">{error}</div>}
                        {message && <div className="alert alert-success py-2 mb-3 small">{message}</div>}

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

                            <div className="mt-2">
                                <a
                                    href={`https://wa.me/${telephone?.replace('+', '')}?text=${encodeURIComponent("SIGEC TCHAD : Votre code de vérification est " + otp + ". Il expire dans 10 minutes.")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-success btn-sm rounded-pill"
                                >
                                    <i className="bi bi-whatsapp me-1"></i>
                                    Démontrer l'envoi WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

