import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import PublicNavbar from "../../components/PublicNavbar";
import { useLanguage } from "../../context/LanguageContext";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      if (authService.hasAdminAccess()) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Tentative de connexion avec:", formData.email);
      const response = await authService.login(formData.email, formData.password);
      console.log("Réponse de connexion:", response);

      // Extraction correcte : authService.login retourne déjà response.data
      // La structure attendue est { success: true, data: { user, token } }
      const user = response.data?.user || response.user || response;

      console.log("Utilisateur connecté:", user);
      console.log("Rôle détecté:", user?.role);

      if (!user || !user.role) {
        throw new Error("Impossible de récupérer les informations de l'utilisateur après connexion.");
      }

      // Forcer un rechargement complet pour garantir l'initialisation du state
      if (user.role === 'admin' || user.role === 'agent') {
        console.log("Redirection vers Admin/Agent Dashboard");
        window.location.href = '/admin/dashboard';
      } else {
        console.log("Redirection vers Citizen Dashboard");
        window.location.href = '/dashboard';
      }

    } catch (err) {
      console.error("Erreur de login:", err);

      if (err.requireVerification) {
        // Redirection vers OTP si compte non vérifié
        navigate('/verify-otp', { state: { email: err.email } });
        return;
      }

      // Extraction plus robuste du message d'erreur pour éviter de passer un objet à React
      let errorMessage = "Erreur de connexion. Vérifiez vos identifiants.";
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && err.error && typeof err.error === 'string') {
        errorMessage = err.error;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      console.log("Tentative de connexion Google Web...");
      const idToken = credentialResponse.credential;
      const response = await authService.loginWithGoogle(idToken);

      const user = response.data?.user || response.user || response;

      if (user.role === 'admin' || user.role === 'agent') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Erreur Google Login Web:", err);
      setError(err.message || "Échec de la connexion avec Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className={`min-vh-100 d-flex align-items-stretch overflow-hidden bg-light ${language === 'ar' ? 'rtl' : ''}`}>
        <div className="container-fluid p-0">
          <div className="row g-0 min-vh-100">
            {/* Left Side - Image */}
            <div className="col-lg-6 d-none d-lg-block position-relative">
              <div className="position-absolute top-0 start-0 w-100 h-100">
                <img
                  src="/assets/auth-side.png"
                  alt="Background"
                  className="w-100 h-100 object-fit-cover"
                  style={{ objectPosition: 'center' }}
                />
                {/* Overlay Bleu Tchad Gradient */}
                <div className="position-absolute top-0 start-0 w-100 h-100"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 32, 91, 0.9) 0%, rgba(0, 51, 141, 0.7) 100%)' }}>
                </div>
              </div>
              <div className="position-absolute bottom-0 start-0 w-100 p-5 text-white" style={{ zIndex: 10 }}>
                <div className="mb-3">
                  <span className="badge bg-warning text-dark border border-warning rounded-pill px-3 py-2 fw-bold shadow-sm">
                    🏛️ {t('republic')}
                  </span>
                </div>
                <h2 className="display-4 fw-bold mb-3">{t('authSideTitle')}</h2>
                <p className="lead fs-5 opacity-90" style={{ maxWidth: '80%' }}>
                  {t('authSideDesc')}
                </p>
                <div className="mt-5 d-flex gap-3">
                  <div className="bg-white bg-opacity-10 p-3 rounded-3 backdrop-blur-sm">
                    <h5 className="fw-bold mb-0">100%</h5>
                    <small className="opacity-75">{t('authDigital')}</small>
                  </div>
                  <div className="bg-white bg-opacity-10 p-3 rounded-3 backdrop-blur-sm">
                    <h5 className="fw-bold mb-0">24/7</h5>
                    <small className="opacity-75">{t('authAvailable')}</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light">
              <div className="w-100 p-3">
                {/* Container Card */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden mx-auto" style={{ maxWidth: '450px' }}>
                  <div className="card-body p-4 p-md-5">

                    <div className="text-center mb-4">
                      <div className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, var(--tchad-blue) 0%, var(--tchad-blue-light) 100%)',
                          boxShadow: '0 8px 16px -4px rgba(0, 32, 91, 0.3)'
                        }}>
                        <span style={{ fontSize: '2rem' }}>🔐</span>
                      </div>
                      <h2 className="fw-bold mb-1 text-dark"><span>{t('loginTitle')}</span></h2>
                      <p className="text-muted small"><span>{t('loginSubtitle')}</span></p>
                    </div>

                    {error && (
                      <div key="login-error-alert" translate="no" className="alert alert-danger border-start border-4 border-danger rounded-4 d-flex align-items-center mb-4 py-3 shadow-sm" role="alert" style={{ background: '#fff5f5' }}>
                        <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                          <i className="bi bi-x-lg fs-6"></i>
                        </div>
                        <div>
                          <p className="fw-bold mb-0 text-danger" style={{ fontSize: '0.9rem' }}><span>Erreur d'accès</span></p>
                          <small className="text-secondary" style={{ fontSize: '0.8rem' }}><span>{error}</span></small>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="needs-validation">
                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          name="email"
                          className="form-control bg-light border-0"
                          id="floatingInput"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="email"
                          required
                          style={{ height: '55px' }}
                        />
                        <label htmlFor="floatingInput">{t('labelEmailAuth')}</label>
                      </div>

                      <div className="form-floating mb-3">
                        <input
                          type="password"
                          name="password"
                          className="form-control bg-light border-0"
                          id="floatingPassword"
                          placeholder="Mot de passe"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="current-password"
                          required
                          style={{ height: '55px' }}
                        />
                        <label htmlFor="floatingPassword">{t('labelPassword')}</label>
                      </div>

                      <div className="text-end mb-4">
                        <Link to="/forgot-password"
                          className="text-decoration-none small fw-semibold text-primary hover-opacity">
                          {t('forgotPassword')}
                        </Link>
                      </div>

                      <button
                        type="submit"
                        className="btn w-100 py-3 fw-bold text-uppercase tracking-wider mb-4 shadow-sm hover-translate"
                        disabled={loading}
                        style={{
                          borderRadius: '10px',
                          backgroundColor: '#00205b', // Bleu Tchad explicite
                          color: '#ffffff', // Blanc explicite
                          border: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        {loading ? (
                          <span className="d-flex align-items-center justify-content-center">
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {t('loggingIn')}
                          </span>
                        ) : (
                          <span className="d-flex align-items-center justify-content-center">
                            {t('btnLogin')} <i className={`bi ${language === 'ar' ? 'bi-arrow-left me-2' : 'bi-arrow-right ms-2'}`}></i>
                          </span>
                        )}
                      </button>
                    </form>

                    <div className="text-center mb-4">
                      <div className="d-flex align-items-center my-3">
                        <hr className="flex-grow-1" />
                        <span className="mx-2 text-muted small">{t('or') || 'OU'}</span>
                        <hr className="flex-grow-1" />
                      </div>

                      <div className="d-flex justify-content-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => setError("Erreur lors de la connexion Google")}
                          useOneTap
                          theme="outline"
                          shape="pill"
                          locale={language}
                        />
                      </div>
                    </div>

                  </div>
                  <div className="card-footer bg-light p-3 text-center border-top-0">
                    <p className="mb-0 text-muted small">
                      {t('noAccount')}{" "}
                      <Link to="/register" className="text-decoration-none fw-bold text-primary ms-1">
                        {t('createAccount')}
                      </Link>
                    </p>
                  </div>
                </div>
                {/* End Container Card */}

                <div className="text-center mt-4">
                  <small className="text-muted opacity-75 d-inline-flex align-items-center gap-2">
                    <i className="bi bi-shield-lock-fill"></i>
                    {t('secureGov')}
                  </small>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
