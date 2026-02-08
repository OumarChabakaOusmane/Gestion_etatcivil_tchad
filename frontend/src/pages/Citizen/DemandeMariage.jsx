import { useState } from "react";
import { useNavigate } from "react-router-dom";
import demandeService from "../../services/demandeService";

export default function DemandeMariage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Époux
        nomEpoux: "",
        prenomEpoux: "",
        dateNaissanceEpoux: "",
        lieuNaissanceEpoux: "",
        nationaliteEpoux: "TCHADIENNE",
        professionEpoux: "",
        domicileEpoux: "",
        temoin1Epoux: "",
        temoin2Epoux: "",
        signatureEpoux: false,

        // Épouse
        nomEpouse: "",
        prenomEpouse: "",
        dateNaissanceEpouse: "",
        lieuNaissanceEpouse: "",
        nationaliteEpouse: "TCHADIENNE",
        professionEpouse: "",
        domicileEpouse: "",
        temoin1Epouse: "",
        temoin2Epouse: "",
        signatureEpouse: false,

        // Mariage
        dateMariage: "",
        lieuMariage: "",
        regimeMatrimonial: "monogamie",
        dotMontant: "",
        dotConditions: ""
    });

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const steps = [
        { id: 1, label: "L'Époux", icon: "bi-person" },
        { id: 2, label: "L'Épouse", icon: "bi-person-dress" },
        { id: 3, label: "Mariage", icon: "bi-calendar-event" },
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
                if (!formData.nomEpoux.trim()) errors.push("Le nom de l'époux est obligatoire");
                if (!formData.prenomEpoux.trim()) errors.push("Le prénom de l'époux est obligatoire");
                if (!formData.dateNaissanceEpoux) errors.push("La date de naissance de l'époux est obligatoire");
                if (!formData.lieuNaissanceEpoux.trim()) errors.push("Le lieu de naissance de l'époux est obligatoire");
                if (!formData.professionEpoux.trim()) errors.push("La profession de l'époux est obligatoire");
                if (!formData.domicileEpoux.trim()) errors.push("Le domicile de l'époux est obligatoire");
                if (!formData.temoin1Epoux.trim()) errors.push("Le premier témoin de l'époux est obligatoire");
                if (!formData.temoin2Epoux.trim()) errors.push("Le deuxième témoin de l'époux est obligatoire");
                break;
            case 2:
                if (!formData.nomEpouse.trim()) errors.push("Le nom de l'épouse est obligatoire");
                if (!formData.prenomEpouse.trim()) errors.push("Le prénom de l'épouse est obligatoire");
                if (!formData.dateNaissanceEpouse) errors.push("La date de naissance de l'épouse est obligatoire");
                if (!formData.lieuNaissanceEpouse.trim()) errors.push("Le lieu de naissance de l'épouse est obligatoire");
                if (!formData.professionEpouse.trim()) errors.push("La profession de l'épouse est obligatoire");
                if (!formData.domicileEpouse.trim()) errors.push("Le domicile de l'épouse est obligatoire");
                if (!formData.temoin1Epouse.trim()) errors.push("Le premier témoin de l'épouse est obligatoire");
                if (!formData.temoin2Epouse.trim()) errors.push("Le deuxième témoin de l'épouse est obligatoire");
                break;
            case 3:
                if (!formData.dateMariage) errors.push("La date du mariage est obligatoire");
                if (!formData.lieuMariage.trim()) errors.push("Le lieu du mariage est obligatoire");
                if (!formData.dotMontant.trim()) errors.push("Le montant de la dot est obligatoire");
                break;
            case 4:
                if (!formData.signatureEpoux) errors.push("La signature de l'époux est obligatoire");
                if (!formData.signatureEpouse) errors.push("La signature de l'épouse est obligatoire");
        }

        return errors;
    };

    const nextStep = () => {
        const errors = validateStep(step);

        if (errors.length > 0) {
            setError("Veuillez remplir tous les champs obligatoires avant de continuer.");
            window.scrollTo(0, 0);
            return;
        }

        setStep(prev => prev + 1);
        setError(""); // Clear error on successful step change
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
            await demandeService.createDemande('mariage', formData);
            setSuccessMessage('Demande de mariage soumise avec succès ! Redirection...');
            setTimeout(() => {
                navigate('/mes-demandes');
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la soumission de la demande");
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="form-step-content animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4 text-primary-dark d-flex align-items-center gap-2">
                            <i className="bi bi-person-fill fs-3 text-primary"></i>
                            Informations sur l'époux
                        </h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Nom</label>
                                <input type="text" name="nomEpoux" className="form-control form-control-lg bg-light border-0" value={formData.nomEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Prénom(s)</label>
                                <input type="text" name="prenomEpoux" className="form-control form-control-lg bg-light border-0" value={formData.prenomEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Date de naissance</label>
                                <input type="date" name="dateNaissanceEpoux" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Lieu de naissance</label>
                                <input type="text" name="lieuNaissanceEpoux" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Nationalité</label>
                                <select name="nationaliteEpoux" className="form-select form-select-lg bg-light border-0" value={formData.nationaliteEpoux} onChange={handleChange} required>
                                    <option value="TCHADIENNE">TCHADIENNE</option>
                                    <option value="ETRANGER">ÉTRANGER</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Profession</label>
                                <input type="text" name="professionEpoux" className="form-control form-control-lg bg-light border-0" value={formData.professionEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold small text-muted text-uppercase">Domicile</label>
                                <input type="text" name="domicileEpoux" className="form-control form-control-lg bg-light border-0" value={formData.domicileEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Premier Témoin de l'Époux</label>
                                <input type="text" name="temoin1Epoux" className="form-control form-control-lg bg-light border-0" value={formData.temoin1Epoux} onChange={handleChange} required placeholder="Nom complet" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Deuxième Témoin de l'Époux</label>
                                <input type="text" name="temoin2Epoux" className="form-control form-control-lg bg-light border-0" value={formData.temoin2Epoux} onChange={handleChange} required placeholder="Nom complet" />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="form-step-content animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4 text-primary-dark d-flex align-items-center gap-2">
                            <i className="bi bi-person-fill-lock fs-3 text-danger"></i>
                            Informations sur l'épouse
                        </h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Nom</label>
                                <input type="text" name="nomEpouse" className="form-control form-control-lg bg-light border-0" value={formData.nomEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Prénom(s)</label>
                                <input type="text" name="prenomEpouse" className="form-control form-control-lg bg-light border-0" value={formData.prenomEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Date de naissance</label>
                                <input type="date" name="dateNaissanceEpouse" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Lieu de naissance</label>
                                <input type="text" name="lieuNaissanceEpouse" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Nationalité</label>
                                <select name="nationaliteEpouse" className="form-select form-select-lg bg-light border-0" value={formData.nationaliteEpouse} onChange={handleChange} required>
                                    <option value="TCHADIENNE">TCHADIENNE</option>
                                    <option value="ETRANGER">ÉTRANGER</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Profession</label>
                                <input type="text" name="professionEpouse" className="form-control form-control-lg bg-light border-0" value={formData.professionEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold small text-muted text-uppercase">Domicile</label>
                                <input type="text" name="domicileEpouse" className="form-control form-control-lg bg-light border-0" value={formData.domicileEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Premier Témoin de l'Épouse</label>
                                <input type="text" name="temoin1Epouse" className="form-control form-control-lg bg-light border-0" value={formData.temoin1Epouse} onChange={handleChange} required placeholder="Nom complet" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Deuxième Témoin de l'Épouse</label>
                                <input type="text" name="temoin2Epouse" className="form-control form-control-lg bg-light border-0" value={formData.temoin2Epouse} onChange={handleChange} required placeholder="Nom complet" />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="form-step-content animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4 text-primary-dark d-flex align-items-center gap-2">
                            <i className="bi bi-heart-fill fs-3 text-warning"></i>
                            Informations sur le mariage
                        </h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Date du mariage</label>
                                <input type="date" name="dateMariage" className="form-control form-control-lg bg-light border-0" value={formData.dateMariage} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Lieu du mariage</label>
                                <input type="text" name="lieuMariage" className="form-control form-control-lg bg-light border-0" value={formData.lieuMariage} onChange={handleChange} required />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label fw-bold small text-muted text-uppercase">Régime matrimonial</label>
                                <select name="regimeMatrimonial" className="form-select form-select-lg bg-light border-0" value={formData.regimeMatrimonial} onChange={handleChange}>
                                    <option value="monogamie">Monogamie</option>
                                    <option value="polygamie">Polygamie</option>
                                    <option value="communaute_biens">Communauté de biens</option>
                                    <option value="separation_biens">Séparation de biens</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Montant de la Dot</label>
                                <input type="text" name="dotMontant" className="form-control form-control-lg bg-light border-0" value={formData.dotMontant} onChange={handleChange} required placeholder="Ex: 500,000 FCFA" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Conditions de la Dot</label>
                                <input type="text" name="dotConditions" className="form-control form-control-lg bg-light border-0" value={formData.dotConditions} onChange={handleChange} placeholder="Ex: Versée en totalité" />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="form-step-content animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4 text-primary-dark d-flex align-items-center gap-2">
                            <i className="bi bi-clipboard-check fs-3 text-primary"></i>
                            Validation finale
                        </h4>
                        <div className="alert alert-info border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                                <i className="bi bi-info-circle-fill"></i> Résumé de l'union
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="p-3 bg-white rounded-3 shadow-xs border border-light">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Époux</div>
                                        <div className="fw-bold text-dark fs-5">{formData.prenomEpoux} {formData.nomEpoux}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 bg-white rounded-3 shadow-xs border border-light">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Épouse</div>
                                        <div className="fw-bold text-dark fs-5">{formData.prenomEpouse} {formData.nomEpouse}</div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="p-3 bg-white rounded-3 shadow-xs border border-light">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Détails de la cérémonie & Dot</div>
                                        <div className="fw-bold text-dark">Le {formData.dateMariage} à {formData.lieuMariage}</div>
                                        <div className="text-muted mt-2 small text-capitalize"><i className="bi bi-shield-check me-1"></i>Régime: {formData.regimeMatrimonial.replace('_', ' ')}</div>
                                        <div className="text-success mt-1 fw-bold"><i className="bi bi-cash-stack me-1"></i>Dot: {formData.dotMontant}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="form-check p-3 bg-light rounded-3 border">
                                    <input className="form-check-input ms-0 me-3" type="checkbox" name="signatureEpoux" id="signedEpoux" checked={formData.signatureEpoux} onChange={(e) => setFormData({ ...formData, signatureEpoux: e.target.checked })} required />
                                    <label className="form-check-label fw-bold text-dark" htmlFor="signedEpoux">
                                        Signature de l'Époux (Consentement)
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-check p-3 bg-light rounded-3 border">
                                    <input className="form-check-input ms-0 me-3" type="checkbox" name="signatureEpouse" id="signedEpouse" checked={formData.signatureEpouse} onChange={(e) => setFormData({ ...formData, signatureEpouse: e.target.checked })} required />
                                    <label className="form-check-label fw-bold text-dark" htmlFor="signedEpouse">
                                        Signature de l'Épouse (Consentement)
                                    </label>
                                </div>
                            </div>
                        </div>
                        <p className="text-muted small italic">
                            <i className="bi bi-shield-lock me-1"></i> En cochant ces cases, les futurs époux certifient leur consentement mutuel et l'exactitude des informations fournies.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fade-in px-lg-4 pb-5">
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
                    <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>Demande d'acte de mariage</h1>
                    <p className="text-muted mb-0">Déclaration officielle d'union - République du Tchad</p>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-12">
                    {/* Premium Stepper */}
                    <div className="card border-0 shadow-sm rounded-4 mb-5 p-4 bg-white">
                        <div className="stepper-horizontal d-flex justify-content-between position-relative">
                            <div className="stepper-progress-bar" style={{
                                position: 'absolute', top: '22px', left: '12%', right: '12%', height: '2px', background: '#e9ecef', zIndex: 0
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

                            {successMessage && (
                                <div className="alert alert-success rounded-3 border-0 shadow-sm mb-4 d-flex align-items-center gap-3">
                                    <i className="bi bi-check-circle-fill fs-4 text-success"></i>
                                    <span className="fw-bold">{successMessage}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
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
                .shadow-xs {
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
            `}} />
        </div>
    );
}
