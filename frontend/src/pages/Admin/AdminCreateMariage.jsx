import { useState } from "react";
import { useNavigate } from "react-router-dom";
import demandeService from "../../services/demandeService";
import { normalizeText, formatName } from '../../utils/textHelper';

export default function AdminCreateMariage() {
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

        // Mariage
        dateMariage: "",
        lieuMariage: "",
        regimeMatrimonial: "monogamie",
        dotMontant: "",
        dotConditions: ""
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
        const { name, value } = e.target;

        // Auto-normalize specific fields
        let processedValue = value;
        if (name.toLowerCase().includes('profession') ||
            name.toLowerCase().includes('lieu') ||
            name.toLowerCase().includes('domicile')) {
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
                if (!formData.dotMontant.trim()) errors.push("Le montant de la dot est obligatoire");
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
            if (confirm('Demande de mariage enregistrée avec succès ! Voulez-vous consulter les demandes maintenant ?')) {
                navigate('/admin/demandes');
            } else {
                setStep(1);
                setFormData({
                    nomEpoux: "", prenomEpoux: "", dateNaissanceEpoux: "", lieuNaissanceEpoux: "", nationaliteEpoux: "TCHADIENNE", professionEpoux: "", domicileEpoux: "", temoin1Epoux: "", temoin2Epoux: "",
                    nomEpouse: "", prenomEpouse: "", dateNaissanceEpouse: "", lieuNaissanceEpouse: "", nationaliteEpouse: "TCHADIENNE", professionEpouse: "", domicileEpouse: "", temoin1Epouse: "", temoin2Epouse: "",
                    dateMariage: "", lieuMariage: "", regimeMatrimonial: "monogamie", dotMontant: "", dotConditions: ""
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
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-person me-2"></i>Informations sur l'époux</h4>
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
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Premier Témoin</label>
                                <input type="text" name="temoin1Epoux" className="form-control form-control-lg bg-light border-0" value={formData.temoin1Epoux} onChange={handleChange} placeholder="Nom complet" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Deuxième Témoin</label>
                                <input type="text" name="temoin2Epoux" className="form-control form-control-lg bg-light border-0" value={formData.temoin2Epoux} onChange={handleChange} placeholder="Nom complet" />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-person-dress me-2"></i>Informations sur l'épouse</h4>
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
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Premier Témoin</label>
                                <input type="text" name="temoin1Epouse" className="form-control form-control-lg bg-light border-0" value={formData.temoin1Epouse} onChange={handleChange} placeholder="Nom complet" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Deuxième Témoin</label>
                                <input type="text" name="temoin2Epouse" className="form-control form-control-lg bg-light border-0" value={formData.temoin2Epouse} onChange={handleChange} placeholder="Nom complet" />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-calendar-event me-2"></i>Détails du mariage</h4>
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
                                    <option value="monogamie">Monogamie / زوجة واحدة</option>
                                    <option value="polygamie">Polygamie / تعدد الزوجات</option>
                                    <option value="communaute_biens">Communauté de biens / اشتراك الأموال</option>
                                    <option value="separation_biens">Séparation de biens / فصل الأموال</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Montant de la Dot</label>
                                <input type="text" name="dotMontant" className="form-control form-control-lg bg-light border-0" value={formData.dotMontant} onChange={handleChange} required placeholder="Ex: 500,000 FCFA" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Conditions de la Dot</label>
                                <input type="text" name="dotConditions" className="form-control form-control-lg bg-light border-0" value={formData.dotConditions} onChange={handleChange} placeholder="Ex: Versée en totalité" />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-clipboard-check me-2"></i>Validation Agence / Guichet</h4>
                        <div className="alert alert-warning border-0 shadow-sm rounded-4 p-4">
                            <h5 className="fw-bold mb-3 text-dark">Résumé de l'union (Mode GUICHET)</h5>
                            <div className="row g-2">
                                <div className="col-6 text-muted">Époux:</div>
                                <div className="col-6 fw-bold">{formatName(formData.nomEpoux)} {formatName(formData.prenomEpoux)}</div>
                                <div className="col-6 text-muted ps-3 small italic">Témoin 1:</div>
                                <div className="col-6 small fw-bold">{formData.temoin1Epoux || "-"}</div>
                                <div className="col-6 text-muted ps-3 small italic">Témoin 2:</div>
                                <div className="col-6 small fw-bold">{formData.temoin2Epoux || "-"}</div>

                                <div className="col-6 text-muted mt-2">Épouse:</div>
                                <div className="col-6 fw-bold mt-2">{formatName(formData.nomEpouse)} {formatName(formData.prenomEpouse)}</div>
                                <div className="col-6 text-muted ps-3 small italic">Témoin 1:</div>
                                <div className="col-6 small fw-bold">{formData.temoin1Epouse || "-"}</div>
                                <div className="col-6 text-muted ps-3 small italic">Témoin 2:</div>
                                <div className="col-6 small fw-bold">{formData.temoin2Epouse || "-"}</div>

                                <hr className="my-2 opacity-10" />
                                <div className="col-6 text-muted">Mariés le:</div>
                                <div className="col-6 fw-bold">{formData.dateMariage} à {normalizeText(formData.lieuMariage)}</div>
                                <div className="col-6 text-muted">Régime:</div>
                                <div className="col-6 fw-bold text-capitalize">{formData.regimeMatrimonial.replace('_', ' ')}</div>
                                <div className="col-6 text-muted">Dot:</div>
                                <div className="col-6 fw-bold text-success">{formData.dotMontant}</div>
                            </div>
                        </div>
                        <p className="text-muted small italic">
                            <i className="bi bi-info-circle me-1"></i> Saisie manuelle effectuée par l'agent pour un couple présent.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fade-in p-4">
            {/* Top Fixed Progress Bar */}
            <div className="fixed-top-progress" style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: '4px', background: '#f8f9fa', zIndex: 9999
            }}>
                <div style={{
                    width: `${(step / steps.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #001a41 0%, #00338d 100%)', transition: 'width 0.6s cubic-bezier(0.1, 0.7, 0.1, 1)'
                }}></div>
            </div>
            <div className="dashboard-header-simple py-2 mb-4">
                <div className="d-flex align-items-center">
                    <button onClick={() => navigate('/admin/dashboard')} className="btn btn-link text-decoration-none text-muted p-0 me-3 hover-translate transition-all">
                        <i className="bi bi-arrow-left fs-4"></i>
                    </button>
                    <div>
                        <h2 className="fw-bold mb-0 text-primary">Mode Guichet : Nouveau Mariage</h2>
                        <p className="text-muted small mb-0">Saisie d'acte de mariage pour citoyen hors-ligne</p>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-10">
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

                    <div className="card p-4 p-md-5 border-0 shadow-lg rounded-4 overflow-hidden position-relative">

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
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                                        ) : (
                                            <><i className="bi bi-save-fill me-2"></i>Enregistrer le Mariage</>
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

const styles = `
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
    .btn-primary-custom {
        background: #001a41;
        color: white;
    }
    .btn-primary-custom:hover {
        background: #00338d;
        color: white;
    }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
