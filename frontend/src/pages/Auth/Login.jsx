import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import PublicNavbar from "../../components/PublicNavbar";
import { useLanguage } from "../../context/LanguageContext";

export default function Login() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      const user = response.data?.user || response.data; // Au cas où la structure diffère légèrement

      console.log("Utilisateur connecté:", user);
      console.log("Rôle détecté:", user.role);

      // Petit délai pour assurer que le localStorage est bien écrit
      setTimeout(() => {
        // Redirection selon le rôle
        if (user.role === 'admin') {
          console.log("Redirection vers Admin Dashboard");
          navigate('/admin/dashboard');
        } else {
          console.log("Redirection vers Citizen Dashboard");
          navigate('/dashboard');
        }
      }, 100);

    } catch (err) {
      console.error("Erreur de login:", err);
      setError(err.message || "Erreur de connexion. Vérifiez vos identifiants.");
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
                  src="/src/assets/auth-side.png"
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
                      <h2 className="fw-bold mb-1 text-dark">{t('loginTitle')}</h2>
                      <p className="text-muted small">{t('loginSubtitle')}</p>
                    </div>

                    {error && (
                      <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center mb-4 py-2" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <small className="fw-medium">{error}</small>
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
