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

        // Épouse
        nomEpouse: "",
        prenomEpouse: "",
        dateNaissanceEpouse: "",
        lieuNaissanceEpouse: "",
        nationaliteEpouse: "TCHADIENNE",
        professionEpouse: "",
        domicileEpouse: "",

        // Mariage
        dateMariage: "",
        lieuMariage: "",
        regimeMatrimonial: "monogamie"
    });

    const [error, setError] = useState("");
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
                break;
            case 2:
                if (!formData.nomEpouse.trim()) errors.push("Le nom de l'épouse est obligatoire");
                if (!formData.prenomEpouse.trim()) errors.push("Le prénom de l'épouse est obligatoire");
                if (!formData.dateNaissanceEpouse) errors.push("La date de naissance de l'épouse est obligatoire");
                if (!formData.lieuNaissanceEpouse.trim()) errors.push("Le lieu de naissance de l'épouse est obligatoire");
                if (!formData.professionEpouse.trim()) errors.push("La profession de l'épouse est obligatoire");
                if (!formData.domicileEpouse.trim()) errors.push("Le domicile de l'épouse est obligatoire");
                break;
            case 3:
                if (!formData.dateMariage) errors.push("La date du mariage est obligatoire");
                if (!formData.lieuMariage.trim()) errors.push("Le lieu du mariage est obligatoire");
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
            await demandeService.createDemande('mariage', formData);
            alert('Demande de mariage soumise avec succès !');
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
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-person-fill me-2"></i>Informations sur l'époux</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom</label>
                                <input type="text" name="nomEpoux" className="form-control form-control-lg bg-light border-0" value={formData.nomEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom(s)</label>
                                <input type="text" name="prenomEpoux" className="form-control form-control-lg bg-light border-0" value={formData.prenomEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Date de naissance</label>
                                <input type="date" name="dateNaissanceEpoux" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lieu de naissance</label>
                                <input type="text" name="lieuNaissanceEpoux" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nationalité</label>
                                <select name="nationaliteEpoux" className="form-select form-select-lg bg-light border-0" value={formData.nationaliteEpoux} onChange={handleChange} required>
                                    <option value="TCHADIENNE">TCHADIENNE</option>
                                    <option value="ETRANGER">ÉTRANGER</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Profession</label>
                                <input type="text" name="professionEpoux" className="form-control form-control-lg bg-light border-0" value={formData.professionEpoux} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold">Domicile</label>
                                <input type="text" name="domicileEpoux" className="form-control form-control-lg bg-light border-0" value={formData.domicileEpoux} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-danger"><i className="bi bi-person-fill-lock me-2"></i>Informations sur l'épouse</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom</label>
                                <input type="text" name="nomEpouse" className="form-control form-control-lg bg-light border-0" value={formData.nomEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom(s)</label>
                                <input type="text" name="prenomEpouse" className="form-control form-control-lg bg-light border-0" value={formData.prenomEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Date de naissance</label>
                                <input type="date" name="dateNaissanceEpouse" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lieu de naissance</label>
                                <input type="text" name="lieuNaissanceEpouse" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nationalité</label>
                                <select name="nationaliteEpouse" className="form-select form-select-lg bg-light border-0" value={formData.nationaliteEpouse} onChange={handleChange} required>
                                    <option value="TCHADIENNE">TCHADIENNE</option>
                                    <option value="ETRANGER">ÉTRANGER</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Profession</label>
                                <input type="text" name="professionEpouse" className="form-control form-control-lg bg-light border-0" value={formData.professionEpouse} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold">Domicile</label>
                                <input type="text" name="domicileEpouse" className="form-control form-control-lg bg-light border-0" value={formData.domicileEpouse} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-warning"><i className="bi bi-heart-fill me-2"></i>Informations sur le mariage</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Date du mariage</label>
                                <input type="date" name="dateMariage" className="form-control form-control-lg bg-light border-0" value={formData.dateMariage} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lieu du mariage</label>
                                <input type="text" name="lieuMariage" className="form-control form-control-lg bg-light border-0" value={formData.lieuMariage} onChange={handleChange} required />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label fw-bold">Régime matrimonial</label>
                                <select name="regimeMatrimonial" className="form-select form-select-lg bg-light border-0" value={formData.regimeMatrimonial} onChange={handleChange}>
                                    <option value="monogamie">Monogamie</option>
                                    <option value="polygamie">Polygamie</option>
                                    <option value="communaute_biens">Communauté de biens</option>
                                    <option value="separation_biens">Séparation de biens</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-clipboard-check me-2"></i>Validation finale</h4>
                        <div className="alert alert-info border-0 shadow-sm rounded-4 p-4">
                            <h5 className="fw-bold mb-3 text-dark">Résumé de l'union</h5>
                            <div className="row g-2">
                                <div className="col-6 text-muted">Époux:</div>
                                <div className="col-6 fw-bold">{formData.prenomEpoux} {formData.nomEpoux}</div>
                                <div className="col-6 text-muted">Épouse:</div>
                                <div className="col-6 fw-bold">{formData.prenomEpouse} {formData.nomEpouse}</div>
                                <hr className="my-2 opacity-10" />
                                <div className="col-6 text-muted">Célébré le:</div>
                                <div className="col-6 fw-bold">{formData.dateMariage} à {formData.lieuMariage}</div>
                                <div className="col-6 text-muted">Régime:</div>
                                <div className="col-6 fw-bold text-capitalize">{formData.regimeMatrimonial.replace('_', ' ')}</div>
                            </div>
                        </div>
                        <p className="text-muted small italic mt-4">
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
                        <h2 className="fw-bold mb-0">Demande d'acte de mariage</h2>
                        <p className="text-muted small mb-0">Mariage Civil - République du Tchad</p>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-10">

                    <div className="glass-card p-4 p-md-5 border-0 shadow-lg rounded-4 overflow-hidden position-relative">
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
