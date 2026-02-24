import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import PublicNavbar from "../../components/PublicNavbar";
import { useLanguage } from "../../context/LanguageContext";
import uploadService from "../../services/uploadService";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user?.role === 'admin') {
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

  // State pour la photo
  const [photo, setPhoto] = useState(null);

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'ar' ? "كلمات المرور غير متطابقة" : "Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError(language === 'ar' ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل" : "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      console.log('📝 [REGISTER] Début inscription avec:', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        hasPhoto: !!photo
      });

      const { confirmPassword, ...userData } = {
        ...formData,
        role: 'user' // Rôle par défaut explicite
      };

      // Upload photo if exists
      if (photo) {
        try {
          console.log('📤 [REGISTER] Upload photo en cours...');
          const photoUrl = await uploadService.uploadImage(photo, 'profile_photos');
          userData.photo = photoUrl;
          console.log('✅ [REGISTER] Photo uploadée:', photoUrl);
        } catch (uploadError) {
          console.error("❌ [REGISTER] Erreur upload photo:", uploadError);
          // On continue quand même sans photo
        }
      }

      console.log('🚀 [REGISTER] Envoi requête inscription...');
      // Redirection vers OTP après inscription réussie
      const response = await authService.register(userData);

      console.log('✅ [REGISTER] Inscription réussie:', response);
      setError(""); // Effacer les erreurs précédentes

      navigate("/verify-otp", {
        state: {
          email: formData.email,
          telephone: formData.telephone,
          justRegistered: true
        }
      });
    } catch (err) {
      console.error("❌ [REGISTER] Erreur complète:", err);
      console.error("❌ [REGISTER] Détails:", {
        message: err.message,
        error: err.error,
        status: err.response?.status,
        data: err.response?.data
      });

      // Gestion améliorée des erreurs
      let errorMessage = "Erreur lors de l'inscription";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      // Messages d'erreur conviviaux
      if (errorMessage.includes('email') && errorMessage.includes('existe')) {
        errorMessage = "Un compte avec cet email existe déjà. Veuillez vous connecter.";
      } else if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = "Erreur de connexion. Veuillez vérifier votre internet et réessayer.";
      } else if (errorMessage.includes('timeout')) {
        errorMessage = "Le serveur met trop de temps à répondre. Veuillez réessayer.";
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
      const idToken = credentialResponse.credential;
      await authService.loginWithGoogle(idToken);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error("Erreur Google Register Web:", err);
      setError(err.message || "Échec de l'inscription avec Google");
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
                <h2 className="display-4 fw-bold mb-3">{t('homeTitle')}</h2>
                <p className="lead fs-5 opacity-90" style={{ maxWidth: '80%' }}>
                  {t('authSideDesc')}
                </p>
                <div className="mt-4 pt-4 border-top border-white border-opacity-25 d-flex gap-4 opacity-75">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check fs-4 text-warning"></i>
                    <span>{t('secureGov').split(' ').pop()}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history fs-4 text-warning"></i>
                    <span>24/7</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-globe fs-4 text-warning"></i>
                    <span>{t('authAvailable')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light">
              <div className="w-100 p-3">
                {/* Container Card */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden mx-auto" style={{ maxWidth: '550px' }}>
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
                        <span style={{ fontSize: '2rem' }}>📝</span>
                      </div>
                      <h2 className="fw-bold mb-1 text-dark">{t('registerTitle')}</h2>
                      <p className="text-muted small">{t('registerSubtitle')}</p>
                    </div>

                    {error && (
                      <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center mb-4 py-2" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <small className="fw-medium">{error}</small>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="needs-validation">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              name="nom"
                              className="form-control bg-light border-0"
                              id="nom"
                              placeholder="Nom"
                              value={formData.nom}
                              onChange={handleChange}
                              autoComplete="family-name"
                              required
                            />
                            <label htmlFor="nom">{t('labelLastName')} *</label>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              name="prenom"
                              className="form-control bg-light border-0"
                              id="prenom"
                              placeholder="Prénom"
                              value={formData.prenom}
                              onChange={handleChange}
                              autoComplete="given-name"
                              required
                            />
                            <label htmlFor="prenom">{t('labelFirstName')} *</label>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="form-floating">
                            <input
                              type="email"
                              name="email"
                              className="form-control bg-light border-0"
                              id="email"
                              placeholder="Email"
                              value={formData.email}
                              onChange={handleChange}
                              autoComplete="email"
                              required
                            />
                            <label htmlFor="email">{t('labelEmailAuth')} *</label>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="form-floating">
                            <input
                              type="tel"
                              name="telephone"
                              className="form-control bg-light border-0"
                              id="telephone"
                              placeholder="Téléphone"
                              value={formData.telephone}
                              onChange={handleChange}
                              autoComplete="tel"
                              required
                            />
                            <label htmlFor="telephone">{t('phoneLabel')} *</label>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="password"
                              name="password"
                              className="form-control bg-light border-0"
                              id="password"
                              placeholder="Mot de passe"
                              value={formData.password}
                              onChange={handleChange}
                              autoComplete="new-password"
                              required
                            />
                            <label htmlFor="password">{t('labelPasswordAuth')} *</label>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="password"
                              name="confirmPassword"
                              className="form-control bg-light border-0"
                              id="confirmPassword"
                              placeholder="Confirmer"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              autoComplete="new-password"
                              required
                            />
                            <label htmlFor="confirmPassword">{language === 'ar' ? 'تأكيد' : 'Confirmer'} *</label>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn w-100 py-3 fw-bold text-uppercase tracking-wider mt-4 mb-3 shadow-sm hover-translate"
                        disabled={loading}
                        style={{
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #00205b 0%, #00338d 100%)',
                          color: '#ffffff',
                          border: 'none'
                        }}
                      >
                        {loading ? (
                          <span key="loading-state" className="d-flex align-items-center justify-content-center">
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {t('registering')}
                          </span>
                        ) : (
                          <span key="idle-state" className="d-flex align-items-center justify-content-center">
                            <i className={`bi bi-person-plus ${language === 'ar' ? 'ms-2' : 'me-2'}`}></i>
                            {t('btnRegister')}
                          </span>
                        )}
                      </button>

                      <p className="text-muted small text-center mb-0" style={{ fontSize: '0.75rem' }}>
                        En créant un compte, vous acceptez nos CGU et notre politique de confidentialité.
                      </p>
                    </form>

                    <div className="text-center mt-3">
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
                      {t('hasAccount')}{" "}
                      <Link to="/login" className="text-decoration-none fw-bold text-primary ms-1">
                        {t('btnLogin')}
                      </Link>
                    </p>
                  </div>
                </div>
                {/* End Container Card */}
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}
