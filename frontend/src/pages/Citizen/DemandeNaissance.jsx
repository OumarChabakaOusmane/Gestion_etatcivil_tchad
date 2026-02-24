import { useState } from "react";
import { useNavigate } from "react-router-dom";
import demandeService from "../../services/demandeService";
import uploadService from "../../services/uploadService";

export default function DemandeNaissance() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Enfant
        prenomEnfant: "",
        nomEnfant: "",
        sexeEnfant: "M",
        dateNaissanceEnfant: "",
        heureNaissanceEnfant: "",
        lieuNaissanceEnfant: "",

        // Père
        prenomPere: "",
        nomPere: "",
        dateNaissancePere: "",
        lieuNaissancePere: "",
        nationalitePere: "TCHADIENNE",
        professionPere: "",
        domicilePere: "",
        nniPere: "",

        // Mère
        prenomMere: "",
        nomMere: "",
        dateNaissanceMere: "",
        lieuNaissanceMere: "",
        nationaliteMere: "TCHADIENNE",
        professionMere: "",
        domicileMere: "",
        nniMere: "",
        nniPereImage: null,
        nniMereImage: null
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const steps = [
        { id: 1, label: "L'Enfant", icon: "bi-person-badge" },
        { id: 2, label: "Le Père", icon: "bi-person-standing" },
        { id: 3, label: "La Mère", icon: "bi-person-standing-dress" },
        { id: 4, label: "Validation", icon: "bi-check-all" }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateStep = (currentStep) => {
        const errors = [];

        switch (currentStep) {
            case 1:
                if (!formData.prenomEnfant.trim()) errors.push("Le prénom de l'enfant est obligatoire");
                if (!formData.nomEnfant.trim()) errors.push("Le nom de l'enfant est obligatoire");
                if (!formData.dateNaissanceEnfant) errors.push("La date de naissance de l'enfant est obligatoire");
                if (!formData.heureNaissanceEnfant) errors.push("L'heure de naissance de l'enfant est obligatoire");
                if (!formData.lieuNaissanceEnfant.trim()) errors.push("Le lieu de naissance de l'enfant est obligatoire");
                break;
            case 2:
                if (!formData.prenomPere.trim()) errors.push("Le prénom du père est obligatoire");
                if (!formData.nomPere.trim()) errors.push("Le nom du père est obligatoire");
                if (!formData.dateNaissancePere) errors.push("La date de naissance du père est obligatoire");
                if (!formData.lieuNaissancePere.trim()) errors.push("Le lieu de naissance du père est obligatoire");
                if (!formData.professionPere.trim()) errors.push("La profession du père est obligatoire");
                if (!formData.domicilePere.trim()) errors.push("Le domicile du père est obligatoire");
                break;
            case 3:
                if (!formData.prenomMere.trim()) errors.push("Le prénom de la mère est obligatoire");
                if (!formData.nomMere.trim()) errors.push("Le nom de la mère est obligatoire");
                if (!formData.dateNaissanceMere) errors.push("La date de naissance de la mère est obligatoire");
                if (!formData.lieuNaissanceMere.trim()) errors.push("Le lieu de naissance de la mère est obligatoire");
                if (!formData.professionMere.trim()) errors.push("La profession de la mère est obligatoire");
                if (!formData.domicileMere.trim()) errors.push("Le domicile de la mère est obligatoire");
                break;
        }

        return errors;
    };

    const nextStep = () => {
        const errors = validateStep(step);

        if (errors.length > 0) {
            alert("⚠️ Veuillez remplir tous les champs obligatoires :\n\n" + errors.join("\n"));
            return;
        }

        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await demandeService.createDemande('naissance', formData);
            alert('Demande de naissance soumise avec succès !');
            // Forcer un rechargement complet pour éviter les erreurs DOM
            window.location.href = '/mes-demandes';
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la soumission de la demande");
            setLoading(false);
        }
    };

    const handleFileChange = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const base64 = await uploadService.uploadImage(file);
            setFormData(prev => ({
                ...prev,
                [key]: base64, // Stocke l'image dans le champ NNI original pour le backend
                [`${key}Image`]: base64 // Garde une trace pour l'aperçu local
            }));
        } catch (err) {
            alert(err.message || "Erreur lors du chargement de l'image");
        }
    };

    const removeImage = (key) => {
        setFormData(prev => ({
            ...prev,
            [key]: "",
            [`${key}Image`]: null
        }));
    };

    const NNIPicker = ({ label, name, value, image }) => (
        <div className="col-12 mb-3">
            <label className="form-label fw-bold small text-muted text-uppercase">{label}</label>
            {!image ? (
                <div className="upload-zone border-2 border-dashed rounded-4 p-4 text-center bg-light position-relative">
                    <input
                        type="file"
                        className="position-absolute w-100 h-100 top-0 start-0 opacity-0"
                        style={{ cursor: 'pointer' }}
                        onChange={(e) => handleFileChange(e, name)}
                        accept="image/*"
                    />
                    <i className="bi bi-card-image fs-2 text-primary d-block mb-2"></i>
                    <span className="fw-bold d-block small">Charger la carte NNI</span>
                    <small className="text-muted smaller">JPG, PNG - Max 700Ko</small>
                </div>
            ) : (
                <div className="position-relative bg-light rounded-4 p-2 border">
                    <img src={image} alt="Carte NNI" className="img-fluid rounded-3" style={{ maxHeight: '150px', width: '100%', objectFit: 'contain' }} />
                    <button
                        type="button"
                        className="btn btn-danger btn-sm rounded-circle position-absolute"
                        style={{ top: '-10px', right: '-10px', width: '30px', height: '30px', padding: 0 }}
                        onClick={() => removeImage(name)}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                    <div className="text-center mt-2 small text-success fw-bold">
                        <i className="bi bi-check-circle-fill me-1"></i> Carte jointe
                    </div>
                </div>
            )}
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-baby me-2"></i>Informations sur l'enfant</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom</label>
                                <input type="text" name="nomEnfant" className="form-control form-control-lg bg-light border-0" value={formData.nomEnfant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom(s)</label>
                                <input type="text" name="prenomEnfant" className="form-control form-control-lg bg-light border-0" value={formData.prenomEnfant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Sexe</label>
                                <select name="sexeEnfant" className="form-select form-select-lg bg-light border-0" value={formData.sexeEnfant} onChange={handleChange}>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Date de naissance</label>
                                <input type="date" name="dateNaissanceEnfant" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceEnfant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Heure de naissance</label>
                                <input type="time" name="heureNaissanceEnfant" className="form-control form-control-lg bg-light border-0" value={formData.heureNaissanceEnfant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lieu de naissance</label>
                                <input type="text" name="lieuNaissanceEnfant" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceEnfant} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-person-standing me-2"></i>Informations sur le père</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom(s) du père</label>
                                <input type="text" name="prenomPere" className="form-control form-control-lg bg-light border-0" value={formData.prenomPere} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom du père</label>
                                <input type="text" name="nomPere" className="form-control form-control-lg bg-light border-0" value={formData.nomPere} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Date de naissance du père</label>
                                <input type="date" name="dateNaissancePere" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissancePere} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lieu de naissance du père</label>
                                <input type="text" name="lieuNaissancePere" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissancePere} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nationalité du père</label>
                                <select name="nationalitePere" className="form-select form-select-lg bg-light border-0" value={formData.nationalitePere} onChange={handleChange} required>
                                    <option value="TCHADIENNE">TCHADIENNE</option>
                                    <option value="ETRANGER">ÉTRANGER</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Profession du père</label>
                                <input type="text" name="professionPere" className="form-control form-control-lg bg-light border-0" value={formData.professionPere} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold">Domicile du père</label>
                                <input type="text" name="domicilePere" className="form-control form-control-lg bg-light border-0" value={formData.domicilePere} onChange={handleChange} required />
                            </div>
                            <NNIPicker label="Carte NNI du père" name="nniPere" image={formData.nniPereImage} />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-person-standing-dress me-2"></i>Informations sur la mère</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom(s) de la mère</label>
                                <input type="text" name="prenomMere" className="form-control form-control-lg bg-light border-0" value={formData.prenomMere} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom de la mère</label>
                                <input type="text" name="nomMere" className="form-control form-control-lg bg-light border-0" value={formData.nomMere} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Date de naissance de la mère</label>
                                <input type="date" name="dateNaissanceMere" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceMere} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lieu de naissance de la mère</label>
                                <input type="text" name="lieuNaissanceMere" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceMere} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nationalité de la mère</label>
                                <select name="nationaliteMere" className="form-select form-select-lg bg-light border-0" value={formData.nationaliteMere} onChange={handleChange} required>
                                    <option value="TCHADIENNE">TCHADIENNE</option>
                                    <option value="ETRANGER">ÉTRANGER</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Profession de la mère</label>
                                <input type="text" name="professionMere" className="form-control form-control-lg bg-light border-0" value={formData.professionMere} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold">Domicile de la mère</label>
                                <input type="text" name="domicileMere" className="form-control form-control-lg bg-light border-0" value={formData.domicileMere} onChange={handleChange} required />
                            </div>
                            <NNIPicker label="Carte NNI de la mère" name="nniMere" image={formData.nniMereImage} />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-clipboard-check me-2"></i>Validation finale</h4>
                        <div className="alert alert-info border-0 shadow-sm rounded-4 p-4">
                            <h5 className="fw-bold mb-3 text-dark">Résumé de la déclaration</h5>
                            <div className="row g-2">
                                <div className="col-6 text-muted">Enfant:</div>
                                <div className="col-6 fw-bold">{formData.prenomEnfant} {formData.nomEnfant}</div>
                                <div className="col-6 text-muted">Né(e) le:</div>
                                <div className="col-6 fw-bold">{formData.dateNaissanceEnfant} à {formData.lieuNaissanceEnfant}</div>
                                <hr className="my-2 opacity-10" />
                                <div className="col-6 text-muted">Père:</div>
                                <div className="col-6 fw-bold">
                                    {formData.prenomPere} {formData.nomPere}
                                    {formData.nniPereImage && <span className="ms-2 badge bg-success smaller"><i className="bi bi-card-image me-1"></i>Carte jointe</span>}
                                </div>
                                <div className="col-6 text-muted">Mère:</div>
                                <div className="col-6 fw-bold">
                                    {formData.prenomMere} {formData.nomMere}
                                    {formData.nniMereImage && <span className="ms-2 badge bg-success smaller"><i className="bi bi-card-image me-1"></i>Carte jointe</span>}
                                </div>
                            </div>
                        </div>
                        <p className="text-muted small italic">
                            <i className="bi bi-info-circle me-1"></i> En soumettant ce formulaire, vous certifiez sur l'honneur l'exactitude des informations fournies.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fade-in px-lg-4 pb-5">
            {/* Top Fixed Progress Bar */}
            <div className="fixed-top-progress" style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: '4px', background: '#f8f9fa', zIndex: 9999
            }}>
                <div style={{
                    width: `${(step / steps.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #001a41 0%, #00338d 100%)', transition: 'width 0.6s cubic-bezier(0.1, 0.7, 0.1, 1)'
                }}></div>
            </div>

            {/* Header Section */}
            <div className="d-flex align-items-center mb-5 mt-3">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-outline-secondary rounded-circle p-2 me-4 shadow-sm d-flex align-items-center justify-content-center"
                    style={{ width: '45px', height: '45px' }}
                >
                    <i className="bi bi-arrow-left fs-5"></i>
                </button>
                <div>
                    <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>Demande d'acte de naissance</h1>
                    <p className="text-muted mb-0">Déclaration officielle - République du Tchad</p>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-12">
                    {/* Premium Stepper */}
                    <div className="card border-0 shadow-sm rounded-4 mb-5 p-4 bg-white">
                        <div className="stepper-horizontal d-flex justify-content-between position-relative">
                            <div className="stepper-progress-bar" style={{
                                position: 'absolute', top: '22px', left: '10%', right: '10%', height: '2px', background: '#e9ecef', zIndex: 0
                            }}>
                                <div className="progress-fill" style={{
                                    width: `${((step - 1) / (steps.length - 1)) * 100}%`, height: '100%', background: '#001a41', transition: 'width 0.4s ease'
                                }}></div>
                            </div>
                            {steps.map((s) => (
                                <div key={s.id} className={`stepper-point d-flex flex-column align-items-center position-relative`} style={{ zIndex: 1, width: '25%' }}>
                                    <div className={`stepper-circle d-flex align-items-center justify-content-center rounded-circle shadow-sm mb-3 transition-all ${step >= s.id ? 'active' : ''}`}
                                        style={{
                                            width: '45px',
                                            height: '45px',
                                            background: step > s.id ? '#059669' : (step === s.id ? '#001a41' : '#fff'),
                                            color: (step >= s.id) ? '#fff' : '#adb5bd',
                                            border: step >= s.id ? 'none' : '2px solid #dee2e6',
                                            fontSize: '1.2rem',
                                            fontWeight: '700'
                                        }}>
                                        {step > s.id ? <i className="bi bi-check-lg"></i> : s.id}
                                    </div>
                                    <span className={`small fw-bold text-uppercase d-none d-md-block ${step >= s.id ? 'text-primary-dark' : 'text-muted'}`} style={{ fontSize: '0.7rem', letterSpacing: '0.8px' }}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                        <div className="card-body p-4 p-md-5">
                            {error && (
                                <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4 d-flex align-items-center gap-3">
                                    <i className="bi bi-exclamation-octagon-fill fs-4"></i>
                                    <span className="fw-bold">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
                                <div className="form-content-area" style={{ minHeight: '350px' }}>
                                    {renderStepContent()}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                    {step > 1 ? (
                                        <button type="button" className="btn btn-light rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2" onClick={prevStep}>
                                            <i className="bi bi-arrow-left"></i> Précédent
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {step < 4 ? (
                                        <button type="button" className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                                            onClick={nextStep} style={{ background: '#001a41' }}>
                                            Continuer <i className="bi bi-arrow-right"></i>
                                        </button>
                                    ) : (
                                        <button type="submit" className="btn btn-success rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2" disabled={loading} style={{ background: '#059669' }}>
                                            {loading ? (
                                                <><span className="spinner-border spinner-border-sm"></span> Traitement...</>
                                            ) : (
                                                <><i className="bi bi-send-fill"></i> Soumettre la demande</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .stepper-circle.active {
                    transform: scale(1.1);
                    box-shadow: 0 0 0 5px rgba(0, 26, 65, 0.1) !important;
                }
                .text-primary-dark {
                    color: #001a41;
                }
                .form-control:focus, .form-select:focus {
                    background-color: #fff !important;
                    box-shadow: 0 0 0 4px rgba(0, 26, 65, 0.05) !important;
                    border: 1px solid rgba(0, 26, 65, 0.1) !important;
                }
                .form-label {
                    margin-bottom: 0.5rem;
                    color: #495057;
                }
                .input-group-text {
                    background-color: #f8f9fa;
                    border: 0;
                    color: #adb5bd;
                }
            `}} />
        </div>
    );
};
