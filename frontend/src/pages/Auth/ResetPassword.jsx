import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import PublicNavbar from "../../components/PublicNavbar";
import { useLanguage } from "../../context/LanguageContext";

export default function ResetPassword() {
    const { t, language } = useLanguage();
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const errorMessage = typeof err === 'string' ? err : err.message || "Lien invalide ou expiré";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PublicNavbar />
            <div className={`min-vh-100 d-flex align-items-center justify-content-center bg-light ${language === 'ar' ? 'rtl' : ''}`}>
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "450px", width: "100%" }}>
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <div className="mx-auto bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "70px", height: "70px" }}>
                                <i className="bi bi-key-fill fs-2"></i>
                            </div>
                            <h2 className="fw-bold fs-4">Nouveau mot de passe</h2>
                            <p className="text-muted small">Entrez votre nouveau mot de passe sécurisé.</p>
                        </div>

                        {error && <div className="alert alert-danger py-2 mb-3 small">{error}</div>}

                        {success ? (
                            <div className="alert alert-success py-3 text-center">
                                <i className="bi bi-check-circle-fill fs-1 d-block mb-2"></i>
                                <strong>Mot de passe modifié !</strong>
                                <p className="small mb-0 mt-1">Redirection vers la connexion...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-floating mb-3">
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        placeholder="Nouveau mot de passe"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="password">Mot de passe</label>
                                </div>

                                <div className="form-floating mb-4">
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirm"
                                        placeholder="Confirmer"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="confirm">Confirmer</label>
                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm"></span> : "Réinitialiser"}
                                </button>
                            </form>
                        )}
                    </div>
                    <div className="card-footer bg-light p-3 text-center border-top-0">
                        <Link to="/login" className="text-decoration-none small text-muted">
                            <i className="bi bi-arrow-left me-1"></i> Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
