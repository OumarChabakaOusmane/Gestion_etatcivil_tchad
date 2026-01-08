import { useState } from "react";
import { useNavigate } from "react-router-dom";
import demandeService from "../../services/demandeService";

export default function DemandeNaissance() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Enfant
        prenomEnfant: "",
        nomEnfant: "",
        sexeEnfant: "M",
        dateNaissanceEnfant: "",
        lieuNaissanceEnfant: "",

        // Père
        prenomPere: "",
        nomPere: "",
        dateNaissancePere: "",
        lieuNaissancePere: "",
        nationalitePere: "TCHADIENNE",
        professionPere: "",
        domicilePere: "",

        // Mère
        prenomMere: "",
        nomMere: "",
        dateNaissanceMere: "",
        lieuNaissanceMere: "",
        nationaliteMere: "TCHADIENNE",
        professionMere: "",
        domicileMere: ""
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
            navigate('/mes-demandes');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la soumission de la demande");
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-baby me-2"></i>Informations sur l'enfant</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom(s)</label>
                                <input type="text" name="prenomEnfant" className="form-control form-control-lg bg-light border-0" value={formData.prenomEnfant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom</label>
                                <input type="text" name="nomEnfant" className="form-control form-control-lg bg-light border-0" value={formData.nomEnfant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Sexe</label>
                                <select name="sexeEnfant" className="form-select form-select-lg bg-light border-0" value={formData.sexeEnfant} onChange={handleChange}>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Date de naissance</label>
                                <input type="date" name="dateNaissanceEnfant" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceEnfant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
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
                                <div className="col-6 fw-bold">{formData.prenomPere} {formData.nomPere}</div>
                                <div className="col-6 text-muted">Mère:</div>
                                <div className="col-6 fw-bold">{formData.prenomMere} {formData.nomMere}</div>
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
        <div className="fade-in">
            <div className="dashboard-header-simple py-2 mb-4">
                <div className="d-flex align-items-center">
                    <button onClick={() => navigate('/demander-acte')} className="btn btn-link text-decoration-none text-muted p-0 me-3 hover-translate transition-all">
                        <i className="bi bi-arrow-left fs-4"></i>
                    </button>
                    <div>
                        <h2 className="fw-bold mb-0">Demande d'acte de naissance</h2>
                        <p className="text-muted small mb-0">Déclaration de Naissance - République du Tchad</p>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-10">

                    <div className="glass-card p-4 p-md-5 border-0 shadow-lg rounded-4 overflow-hidden position-relative">
                        {/* Stepper Header */}
                        <div className="stepper-container">
                            {steps.map((s) => (
                                <div key={s.id} className={`stepper-item ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
                                    <div className="stepper-dot shadow-sm">
                                        {step > s.id ? <i className="bi bi-check-lg"></i> : s.id}
                                    </div>
                                    <span className="stepper-label d-none d-md-block">{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4">
                                <i className="bi bi-exclamation-triangle me-2"></i>{error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {renderStepContent()}

                            <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                {step > 1 ? (
                                    <button type="button" className="btn btn-light btn-lg rounded-pill px-4 shadow-none" onClick={prevStep}>
                                        <i className="bi bi-arrow-left me-2"></i>Précédent
                                    </button>
                                ) : (
                                    <div></div>
                                )}

                                {step < 4 ? (
                                    <button type="button" className="btn btn-primary-custom btn-lg rounded-pill px-5 shadow-sm" onClick={nextStep}>
                                        Suivant<i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                ) : (
                                    <button type="submit" className="btn btn-success btn-lg rounded-pill px-5 shadow-sm" disabled={loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Envoi...</>
                                        ) : (
                                            <><i className="bi bi-send-check me-2"></i>Soumettre la demande</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
