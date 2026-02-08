import { useState } from "react";
import { useNavigate } from "react-router-dom";
import demandeService from "../../services/demandeService";
import { normalizeText, formatName } from '../../utils/textHelper';

export default function AdminCreateDeces() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Défunt
        nomDefunt: "",
        prenomDefunt: "",
        sexeDefunt: "M",
        dateDeces: "",
        lieuDeces: "",
        causeDeces: "",
        dateNaissanceDefunt: "",
        lieuNaissanceDefunt: "",
        nationaliteDefunt: "TCHADIENNE",
        professionDefunt: "",
        pereDefunt: "",
        mereDefunt: "",
        nniDefunt: "",

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
        const { name, value } = e.target;

        // Auto-normalize specific fields
        let processedValue = value;
        if (name.toLowerCase().includes('profession') ||
            name.toLowerCase().includes('lieu') ||
            name.toLowerCase().includes('domicile') ||
            name.toLowerCase().includes('cause')) {
            processedValue = normalizeText(value);
        }

        setFormData({
            ...formData,
            [name]: processedValue
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
                if (!formData.pereDefunt.trim()) errors.push("Le nom du père est obligatoire");
                if (!formData.mereDefunt.trim()) errors.push("Le nom de la mère est obligatoire");
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
            if (confirm('Déclaration de décès enregistrée avec succès ! Voulez-vous consulter les demandes maintenant ?')) {
                navigate('/admin/demandes');
            } else {
                setStep(1);
                setFormData({
                    nomDefunt: "", prenomDefunt: "", sexeDefunt: "M", dateDeces: "", lieuDeces: "", causeDeces: "", dateNaissanceDefunt: "", lieuNaissanceDefunt: "", nationaliteDefunt: "TCHADIENNE", professionDefunt: "", pereDefunt: "", mereDefunt: "", nniDefunt: "",
                    nomDeclarant: "", prenomDeclarant: "", lienParente: "", domicileDeclarant: ""
                });
                setLoading(false);
            }
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
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-person-x me-2"></i>Informations sur le défunt</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom</label>
                                <input type="text" name="nomDefunt" className="form-control form-control-lg bg-light border-0" value={formData.nomDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom(s)</label>
                                <input type="text" name="prenomDefunt" className="form-control form-control-lg bg-light border-0" value={formData.prenomDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Sexe</label>
                                <select name="sexeDefunt" className="form-select form-select-lg bg-light border-0" value={formData.sexeDefunt} onChange={handleChange}>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-bold">Numéro NNI (si disponible)</label>
                                <input type="text" name="nniDefunt" className="form-control form-control-lg bg-light border-0" value={formData.nniDefunt} onChange={handleChange} placeholder="NNI du défunt" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Date du décès</label>
                                <input type="date" name="dateDeces" className="form-control form-control-lg bg-light border-0" value={formData.dateDeces} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lieu du décès</label>
                                <input type="text" name="lieuDeces" className="form-control form-control-lg bg-light border-0" value={formData.lieuDeces} onChange={handleChange} required />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label fw-bold">Cause du décès</label>
                                <input type="text" name="causeDeces" className="form-control form-control-lg bg-light border-0" value={formData.causeDeces} onChange={handleChange} placeholder="Ex: Naturelle, Maladie..." />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Père du défunt</label>
                                <input type="text" name="pereDefunt" className="form-control form-control-lg bg-light border-0" value={formData.pereDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Mère du défunt</label>
                                <input type="text" name="mereDefunt" className="form-control form-control-lg bg-light border-0" value={formData.mereDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Date de naissance</label>
                                <input type="date" name="dateNaissanceDefunt" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lieu de naissance</label>
                                <input type="text" name="lieuNaissanceDefunt" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceDefunt} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-person-check me-2"></i>Informations sur le déclarant</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom du déclarant</label>
                                <input type="text" name="nomDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.nomDeclarant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom(s) du déclarant</label>
                                <input type="text" name="prenomDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.prenomDeclarant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Lien de parenté</label>
                                <select name="lienParente" className="form-select form-select-lg bg-light border-0" value={formData.lienParente} onChange={handleChange} required>
                                    <option value="">Sélectionnez le lien...</option>
                                    <option value="Pere">Père</option>
                                    <option value="Mere">Mère</option>
                                    <option value="Conjoint">Conjoint(e)</option>
                                    <option value="Enfant">Enfant</option>
                                    <option value="Frere/Soeur">Frère / Sœur</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Domicile du déclarant</label>
                                <input type="text" name="domicileDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.domicileDeclarant} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-clipboard-check me-2"></i>Validation Agence / Guichet</h4>
                        <div className="alert alert-secondary border-0 shadow-sm rounded-4 p-4">
                            <h5 className="fw-bold mb-3 text-dark">Résumé du décès (Mode GUICHET)</h5>
                            <div className="row g-2">
                                <div className="col-6 text-muted">Défunt:</div>
                                <div className="col-6 fw-bold">{formatName(formData.nomDefunt)} {formatName(formData.prenomDefunt)}</div>
                                <div className="col-6 text-muted">Décédé le:</div>
                                <div className="col-6 fw-bold">{formData.dateDeces} à {normalizeText(formData.lieuDeces)}</div>
                                <hr className="my-2 opacity-10" />
                                <div className="col-6 text-muted">Déclarant:</div>
                                <div className="col-6 fw-bold">{formatName(formData.nomDeclarant)} {formatName(formData.prenomDeclarant)}</div>
                                <div className="col-6 text-muted">Lien:</div>
                                <div className="col-6 fw-bold">{formData.lienParente}</div>
                            </div>
                        </div>
                        <p className="text-muted small italic">
                            <i className="bi bi-info-circle me-1"></i> Saisie manuelle effectuée par l'agent pour un citoyen déclarant un décès.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fade-in p-4">
            <div className="dashboard-header-simple py-2 mb-4">
                <div className="d-flex align-items-center">
                    <button onClick={() => navigate('/admin/dashboard')} className="btn btn-link text-decoration-none text-muted p-0 me-3 hover-translate transition-all">
                        <i className="bi bi-arrow-left fs-4"></i>
                    </button>
                    <div>
                        <h2 className="fw-bold mb-0 text-primary">Mode Guichet : Nouveau Décès</h2>
                        <p className="text-muted small mb-0">Saisie d'acte de décès pour citoyen hors-ligne</p>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card p-4 p-md-5 border-0 shadow-lg rounded-4 overflow-hidden position-relative">
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

                                {step < 3 ? (
                                    <button type="button" className="btn btn-primary-custom btn-lg rounded-pill px-5 shadow-sm" onClick={nextStep}>
                                        Suivant<i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                ) : (
                                    <button type="submit" className="btn btn-success btn-lg rounded-pill px-5 shadow-sm" disabled={loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                                        ) : (
                                            <><i className="bi bi-save-fill me-2"></i>Enregistrer le Décès</>
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
