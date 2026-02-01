import { useState } from "react";
import { useNavigate } from "react-router-dom";
import demandeService from "../../services/demandeService";

export default function DemandeDeces() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Défunt
        nomDefunt: "",
        prenomDefunt: "",
        dateDeces: "",
        lieuDeces: "",
        causeDeces: "",
        dateNaissanceDefunt: "",
        lieuNaissanceDefunt: "",
        nationaliteDefunt: "TCHADIENNE",

        // Déclarant
        nomDeclarant: "",
        prenomDeclarant: "",
        lienParente: "",
        domicileDeclarant: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const steps = [
        { id: 1, label: "Le Défunt", icon: "bi-person-x" },
        { id: 2, label: "Le Déclarant", icon: "bi-person-check" },
        { id: 3, label: "Validation", icon: "bi-check-all" }
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
                if (!formData.nomDefunt.trim()) errors.push("Le nom du défunt est obligatoire");
                if (!formData.prenomDefunt.trim()) errors.push("Le prénom du défunt est obligatoire");
                if (!formData.dateDeces) errors.push("La date du décès est obligatoire");
                if (!formData.lieuDeces.trim()) errors.push("Le lieu du décès est obligatoire");
                if (!formData.dateNaissanceDefunt) errors.push("La date de naissance du défunt est obligatoire");
                if (!formData.lieuNaissanceDefunt.trim()) errors.push("Le lieu de naissance du défunt est obligatoire");
                break;
            case 2:
                if (!formData.nomDeclarant.trim()) errors.push("Le nom du déclarant est obligatoire");
                if (!formData.prenomDeclarant.trim()) errors.push("Le prénom du déclarant est obligatoire");
                if (!formData.lienParente.trim()) errors.push("Le lien de parenté est obligatoire");
                if (!formData.domicileDeclarant.trim()) errors.push("Le domicile du déclarant est obligatoire");
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
            await demandeService.createDemande('deces', formData);
            alert('Déclaration de décès soumise avec succès !');
            window.location.href = '/mes-demandes';
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
                            <i className="bi bi-person-x-fill fs-3 text-secondary"></i>
                            Informations sur le défunt
                        </h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Nom du défunt</label>
                                <input type="text" name="nomDefunt" className="form-control form-control-lg bg-light border-0" value={formData.nomDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Prénom(s) du défunt</label>
                                <input type="text" name="prenomDefunt" className="form-control form-control-lg bg-light border-0" value={formData.prenomDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Date du décès</label>
                                <input type="date" name="dateDeces" className="form-control form-control-lg bg-light border-0" value={formData.dateDeces} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Lieu du décès</label>
                                <input type="text" name="lieuDeces" className="form-control form-control-lg bg-light border-0" value={formData.lieuDeces} onChange={handleChange} required />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label fw-bold small text-muted text-uppercase">Cause du décès (si connue)</label>
                                <input type="text" name="causeDeces" className="form-control form-control-lg bg-light border-0" value={formData.causeDeces} onChange={handleChange} placeholder="Ex: Naturelle, Maladie..." />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Date de naissance</label>
                                <input type="date" name="dateNaissanceDefunt" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Lieu de naissance</label>
                                <input type="text" name="lieuNaissanceDefunt" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Nationalité</label>
                                <select name="nationaliteDefunt" className="form-select form-select-lg bg-light border-0" value={formData.nationaliteDefunt} onChange={handleChange} required>
                                    <option value="TCHADIENNE">TCHADIENNE</option>
                                    <option value="ETRANGER">ÉTRANGER</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="form-step-content animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4 text-primary-dark d-flex align-items-center gap-2">
                            <i className="bi bi-person-check-fill fs-3 text-info"></i>
                            Informations sur le déclarant
                        </h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Nom du déclarant</label>
                                <input type="text" name="nomDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.nomDeclarant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Prénom(s) du déclarant</label>
                                <input type="text" name="prenomDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.prenomDeclarant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Lien de parenté</label>
                                <select name="lienParente" className="form-select form-select-lg bg-light border-0" value={formData.lienParente} onChange={handleChange} required>
                                    <option value="">Sélectionnez le lien...</option>
                                    <option value="Pere">Père</option>
                                    <option value="Mere">Mère</option>
                                    <option value="Fils">Fils</option>
                                    <option value="Fille">Fille</option>
                                    <option value="Frere">Frère</option>
                                    <option value="Soeur">Sœur</option>
                                    <option value="Conjoint">Conjoint(e)</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">Domicile du déclarant</label>
                                <input type="text" name="domicileDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.domicileDeclarant} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="form-step-content animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4 text-primary-dark d-flex align-items-center gap-2">
                            <i className="bi bi-clipboard-check fs-3 text-primary"></i>
                            Validation finale
                        </h4>
                        <div className="alert alert-secondary border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                                <i className="bi bi-info-circle-fill"></i> Résumé de la déclaration
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <div className="p-3 bg-white rounded-3 shadow-xs border border-light mb-3">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Le Défunt</div>
                                        <div className="fw-bold text-dark fs-5">{formData.prenomDefunt} {formData.nomDefunt}</div>
                                        <div className="text-muted small mt-1">Décédé le {formData.dateDeces} à {formData.lieuDeces}</div>
                                    </div>
                                    <div className="p-3 bg-white rounded-3 shadow-xs border border-light">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Le Déclarant</div>
                                        <div className="fw-bold text-dark fs-5">{formData.prenomDeclarant} {formData.nomDeclarant}</div>
                                        <div className="text-muted small mt-1">Lien: {formData.lienParente} | Domicile: {formData.domicileDeclarant}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-muted small italic">
                            <i className="bi bi-shield-exclamation me-1"></i> La déclaration de décès est une obligation légale devant être effectuée dans les plus brefs délais au service d'état civil compétent.
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
                    <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>Déclaration de décès</h1>
                    <p className="text-muted mb-0">Service d'État Civil - République du Tchad</p>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-12">
                    {/* Premium Stepper */}
                    <div className="card border-0 shadow-sm rounded-4 mb-5 p-4 bg-white">
                        <div className="stepper-horizontal d-flex justify-content-between position-relative">
                            <div className="stepper-progress-bar" style={{
                                position: 'absolute', top: '22px', left: '15%', right: '15%', height: '2px', background: '#e9ecef', zIndex: 0
                            }}>
                                <div className="progress-fill" style={{
                                    width: `${((step - 1) / (steps.length - 1)) * 100}%`, height: '100%', background: '#001a41', transition: 'width 0.4s ease'
                                }}></div>
                            </div>
                            {steps.map((s) => (
                                <div key={s.id} className={`stepper-point d-flex flex-column align-items-center position-relative`} style={{ zIndex: 1, width: '33.33%' }}>
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

                                    {step < 3 ? (
                                        <button type="button" className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                                            onClick={nextStep} style={{ background: '#001a41' }}>
                                            Continuer <i className="bi bi-arrow-right"></i>
                                        </button>
                                    ) : (
                                        <button type="submit" className="btn btn-success rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2" disabled={loading} style={{ background: '#059669' }}>
                                            {loading ? (
                                                <><span className="spinner-border spinner-border-sm"></span> Traitement...</>
                                            ) : (
                                                <><i className="bi bi-send-fill"></i> Soumettre la déclaration</>
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
