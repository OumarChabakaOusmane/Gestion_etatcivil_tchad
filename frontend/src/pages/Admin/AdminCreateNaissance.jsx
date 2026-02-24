import { useState } from "react";
import { useNavigate } from "react-router-dom";
import demandeService from "../../services/demandeService";
import { normalizeText, formatName } from '../../utils/textHelper';
import Tesseract from 'tesseract.js';
import { toast } from 'react-hot-toast';

export default function AdminCreateNaissance() {
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
        nniMere: ""
    });

    const [ocrLoading, setOcrLoading] = useState({});

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
        const { name, value } = e.target;

        // Auto-normalize specific fields (profession, lieu, nationalite)
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

    const handleOCR = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        setOcrLoading(prev => ({ ...prev, [key]: true }));
        try {
            // Créer une URL temporaire pour l'image
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const { data: { text } } = await Tesseract.recognize(reader.result, 'fra+eng');

                    // Regex pour trouver une séquence de 10 à 15 chiffres (format NNI)
                    const nniMatch = text.match(/\b\d{10,15}\b/);

                    if (nniMatch) {
                        setFormData(prev => ({ ...prev, [key]: nniMatch[0] }));
                        toast.success(`Numéro détecté : ${nniMatch[0]}`);
                    } else {
                        toast.error("Impossible de détecter un numéro NNI. Veuillez le saisir manuellement.");
                    }
                } catch (err) {
                    console.error("OCR Error inner:", err);
                    toast.error("Erreur lors de la lecture de l'image");
                } finally {
                    setOcrLoading(prev => ({ ...prev, [key]: false }));
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Erreur OCR:", error);
            toast.error("Erreur lors de l'ouverture du fichier");
            setOcrLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await demandeService.createDemande('naissance', formData);
            if (confirm('Demande enregistrée avec succès ! Voulez-vous consuler les demandes maintenant ?')) {
                navigate('/admin/demandes');
            } else {
                // Reset form for next entry
                setStep(1);
                setFormData({
                    prenomEnfant: "", nomEnfant: "", sexeEnfant: "M", dateNaissanceEnfant: "", heureNaissanceEnfant: "", lieuNaissanceEnfant: "",
                    prenomPere: "", nomPere: "", dateNaissancePere: "", lieuNaissancePere: "", nationalitePere: "TCHADIENNE", professionPere: "", domicilePere: "", nniPere: "",
                    prenomMere: "", nomMere: "", dateNaissanceMere: "", lieuNaissanceMere: "", nationaliteMere: "TCHADIENNE", professionMere: "", domicileMere: "", nniMere: ""
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
                            <div className="col-md-12">
                                <label className="form-label fw-bold">NNI du père (Optionnel)</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="nniPere"
                                        className="form-control form-control-lg bg-light border-0"
                                        value={formData.nniPere}
                                        onChange={handleChange}
                                        placeholder="Numéro National d'Identité"
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center bg-white border-0 shadow-sm" style={{ cursor: 'pointer' }}>
                                        {ocrLoading['nniPere'] ? (
                                            <span className="spinner-border spinner-border-sm mx-2"></span>
                                        ) : (
                                            <i className="bi bi-camera-fill mx-2"></i>
                                        )}
                                        {ocrLoading['nniPere'] ? "Scan..." : "Scanner Carte"}
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleOCR(e, 'nniPere')} />
                                    </label>
                                </div>
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
                            <div className="col-md-12">
                                <label className="form-label fw-bold">NNI de la mère (Optionnel)</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="nniMere"
                                        className="form-control form-control-lg bg-light border-0"
                                        value={formData.nniMere}
                                        onChange={handleChange}
                                        placeholder="Numéro National d'Identité"
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center bg-white border-0 shadow-sm" style={{ cursor: 'pointer' }}>
                                        {ocrLoading['nniMere'] ? (
                                            <span className="spinner-border spinner-border-sm mx-2"></span>
                                        ) : (
                                            <i className="bi bi-camera-fill mx-2"></i>
                                        )}
                                        {ocrLoading['nniMere'] ? "Scan..." : "Scanner Carte"}
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleOCR(e, 'nniMere')} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="form-step-content">
                        <h4 className="fw-bold mb-4 text-primary"><i className="bi bi-clipboard-check me-2"></i>Validation Agence / Guichet</h4>
                        <div className="alert alert-warning border-0 shadow-sm rounded-4 p-4">
                            <h5 className="fw-bold mb-3 text-dark">Résumé de la déclaration (Mode GUICHET)</h5>
                            <div className="row g-2">
                                <div className="col-6 text-muted">Enfant:</div>
                                <div className="col-6 fw-bold">{formatName(formData.nomEnfant)} {formatName(formData.prenomEnfant)}</div>
                                <div className="col-6 text-muted">Né(e) le:</div>
                                <div className="col-6 fw-bold">{normalizeText(formData.dateNaissanceEnfant)} à {normalizeText(formData.lieuNaissanceEnfant)}</div>
                                <hr className="my-2 opacity-10" />
                                <div className="col-6 text-muted">Père:</div>
                                <div className="col-6 fw-bold">{formatName(formData.nomPere)} {formatName(formData.prenomPere)} {formData.nniPere && `(NNI: ${formData.nniPere})`}</div>
                                <div className="col-6 text-muted">Mère:</div>
                                <div className="col-6 fw-bold">{formatName(formData.nomMere)} {formatName(formData.prenomMere)} {formData.nniMere && `(NNI: ${formData.nniMere})`}</div>
                            </div>
                        </div>
                        <p className="text-muted small italic">
                            <i className="bi bi-info-circle me-1"></i> Vous saisissez cet acte en tant qu'administrateur/agent pour un citoyen présent.
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
                        <h2 className="fw-bold mb-0 text-primary">Mode Guichet : Nouvelle Naissance</h2>
                        <p className="text-muted small mb-0">Saisie manuelle d'acte de naissance pour citoyen hors-ligne</p>
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
                                            <><i className="bi bi-save-fill me-2"></i>Enregistrer la Demande</>
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
