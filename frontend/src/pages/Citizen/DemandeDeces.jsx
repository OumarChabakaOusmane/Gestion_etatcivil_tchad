import { useState } from "react";
import { useNavigate } from "react-router-dom";
import demandeService from "../../services/demandeService";
import { useLanguage } from "../../context/LanguageContext";
// [NEW] Import de l'upload service
import uploadService from "../../services/uploadService";

export default function DemandeDeces() {
    const { t, language } = useLanguage();
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

    const [piecesJointes, setPiecesJointes] = useState([]); // [NEW] Stockage des documents (base64)
    const [filesLoading, setFilesLoading] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const steps = [
        { id: 1, label: t('deceasedInfo'), icon: "bi-person-x" },
        { id: 2, label: t('declarantInfo'), icon: "bi-person-check" },
        { id: 3, label: t('labelDocuments'), icon: "bi-file-earmark-arrow-up" },
        { id: 4, label: t('finalValidation'), icon: "bi-check-all" }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // [NEW] Gestion du téléversement
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFilesLoading(true);
        setError("");

        try {
            const base64 = await uploadService.uploadImage(file);
            setPiecesJointes(prev => [...prev, {
                id: Date.now(),
                name: file.name,
                data: base64
            }]);
        } catch (err) {
            setError(err.message || "Erreur lors du chargement du fichier");
        } finally {
            setFilesLoading(false);
        }
    };

    const removeFile = (id) => {
        setPiecesJointes(prev => prev.filter(f => f.id !== id));
    };

    const validateStep = (currentStep) => {
        const errors = [];

        switch (currentStep) {
            case 1:
                if (!formData.nomDefunt.trim()) errors.push(t('labelNomDefunt'));
                if (!formData.prenomDefunt.trim()) errors.push(t('labelPrenomDefunt'));
                if (!formData.sexeDefunt) errors.push(t('labelSexe'));
                if (!formData.dateDeces) errors.push(t('labelDateDeces'));
                if (!formData.lieuDeces.trim()) errors.push(t('labelLieuDeces'));
                if (!formData.dateNaissanceDefunt) errors.push(t('labelDateNaisDefunt'));
                if (!formData.lieuNaissanceDefunt.trim()) errors.push(t('labelLieuNaisDefunt'));
                if (!formData.pereDefunt.trim()) errors.push(t('labelPereDefunt'));
                if (!formData.mereDefunt.trim()) errors.push(t('labelMereDefunt'));
                break;
            case 2:
                if (!formData.nomDeclarant.trim()) errors.push(t('labelNomDeclarant'));
                if (!formData.prenomDeclarant.trim()) errors.push(t('labelPrenomDeclarant'));
                if (!formData.lienParente.trim()) errors.push(t('labelLienParente'));
                if (!formData.domicileDeclarant.trim()) errors.push(t('labelDomicileDeclarant'));
                break;
        }

        return errors;
    };

    const nextStep = () => {
        const errors = validateStep(step);

        if (errors.length > 0) {
            setError(t('msgErrorRequired') + " " + errors.join(", "));
            window.scrollTo(0, 0);
            return;
        }

        setError("");
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
            // On inclut les pièces jointes dans les données envoyées
            const finalData = {
                ...formData,
                piecesJointes: piecesJointes.map(p => p.data)
            };

            await demandeService.createDemande('deces', finalData);
            setIsSuccess(true);
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
                            <i className="bi bi-person-x-fill fs-3 text-secondary"></i>
                            {t('deceasedInfo')}
                        </h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelNomDefunt')}</label>
                                <input type="text" name="nomDefunt" className="form-control form-control-lg bg-light border-0" value={formData.nomDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelPrenomDefunt')}</label>
                                <input type="text" name="prenomDefunt" className="form-control form-control-lg bg-light border-0" value={formData.prenomDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelSexe')}</label>
                                <select name="sexeDefunt" className="form-select form-select-lg bg-light border-0" value={formData.sexeDefunt} onChange={handleChange} required>
                                    <option value="M">Masculin / ذكر</option>
                                    <option value="F">Féminin / أنثى</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelNNI')}</label>
                                <input type="text" name="nniDefunt" className="form-control form-control-lg bg-light border-0" value={formData.nniDefunt} onChange={handleChange} placeholder="NNI" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelDateDeces')}</label>
                                <input type="date" name="dateDeces" className="form-control form-control-lg bg-light border-0" value={formData.dateDeces} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelLieuDeces')}</label>
                                <input type="text" name="lieuDeces" className="form-control form-control-lg bg-light border-0" value={formData.lieuDeces} onChange={handleChange} required />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelCauseDeces')}</label>
                                <input type="text" name="causeDeces" className="form-control form-control-lg bg-light border-0" value={formData.causeDeces} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelProfession')}</label>
                                <input type="text" name="professionDefunt" className="form-control form-control-lg bg-light border-0" value={formData.professionDefunt} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelPereDefunt')}</label>
                                <input type="text" name="pereDefunt" className="form-control form-control-lg bg-light border-0" value={formData.pereDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelMereDefunt')}</label>
                                <input type="text" name="mereDefunt" className="form-control form-control-lg bg-light border-0" value={formData.mereDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelDateNaisDefunt')}</label>
                                <input type="date" name="dateNaissanceDefunt" className="form-control form-control-lg bg-light border-0" value={formData.dateNaissanceDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelLieuNaisDefunt')}</label>
                                <input type="text" name="lieuNaissanceDefunt" className="form-control form-control-lg bg-light border-0" value={formData.lieuNaissanceDefunt} onChange={handleChange} required />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelNationalite')}</label>
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
                            {t('declarantInfo')}
                        </h4>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelNomDeclarant')}</label>
                                <input type="text" name="nomDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.nomDeclarant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelPrenomDeclarant')}</label>
                                <input type="text" name="prenomDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.prenomDeclarant} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelLienParente')}</label>
                                <select name="lienParente" className="form-select form-select-lg bg-light border-0" value={formData.lienParente} onChange={handleChange} required>
                                    <option value="">{t('labelLienParente')}...</option>
                                    <option value="Pere">Père / أب</option>
                                    <option value="Mere">Mère / أم</option>
                                    <option value="Fils">Fils / ابن</option>
                                    <option value="Fille">Fille / ابنة</option>
                                    <option value="Frere">Frère / أخ</option>
                                    <option value="Soeur">Sœur / أخت</option>
                                    <option value="Conjoint">Conjoint(e) / زوج</option>
                                    <option value="Autre">Autre / آخر</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted text-uppercase">{t('labelDomicileDeclarant')}</label>
                                <input type="text" name="domicileDeclarant" className="form-control form-control-lg bg-light border-0" value={formData.domicileDeclarant} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="form-step-content animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4 text-primary-dark d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-arrow-up-fill fs-3 text-warning"></i>
                            {t('labelDocuments')}
                        </h4>
                        <p className="text-muted mb-4">{t('labelDocsDesc')}</p>

                        <div className="mb-4">
                            <div className="upload-zone border-2 border-dashed rounded-4 p-5 text-center bg-light position-relative">
                                <input
                                    type="file"
                                    className="position-absolute w-100 h-100 top-0 start-0 opacity-0"
                                    style={{ cursor: 'pointer' }}
                                    onChange={handleFileChange}
                                    disabled={filesLoading || piecesJointes.length >= 3}
                                    accept="image/*,application/pdf"
                                />
                                <i className="bi bi-cloud-arrow-up fs-1 text-primary-dark mb-3 d-block"></i>
                                <span className="fw-bold d-block">{t('labelUploadDoc')}</span>
                                <small className="text-muted">Image (JPG, PNG) ou PDF - Max 700Ko</small>

                                {filesLoading && (
                                    <div className="mt-3">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {piecesJointes.length > 0 && (
                            <div className="file-list row g-3">
                                {piecesJointes.map(file => (
                                    <div key={file.id} className="col-md-6">
                                        <div className="d-flex align-items-center p-3 bg-white border rounded-3 shadow-sm">
                                            <i className="bi bi-file-earmark-image fs-4 me-3 text-info"></i>
                                            <div className="flex-grow-1 text-truncate pe-3">
                                                <div className="fw-bold small">{file.name}</div>
                                                <div className="text-muted smaller">Chargé avec succès</div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                                                onClick={() => removeFile(file.id)}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {piecesJointes.length === 0 && (
                            <div className="alert alert-info border-0 shadow-sm rounded-3">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                Cette étape est optionnelle. Vous pouvez passer à l'étape suivante si vous n'avez pas de documents.
                            </div>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="form-step-content animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4 text-primary-dark d-flex align-items-center gap-2">
                            <i className="bi bi-clipboard-check fs-3 text-primary"></i>
                            {t('finalValidation')}
                        </h4>
                        <div className="alert alert-secondary border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                                <i className="bi bi-info-circle-fill"></i> {t('labelSummaryTitle')}
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <div className="p-3 bg-white rounded-3 shadow-xs border border-light mb-3 text-start">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">{t('deceasedInfo')}</div>
                                        <div className="fw-bold text-dark fs-5">{formData.prenomDefunt} {formData.nomDefunt} ({formData.sexeDefunt})</div>
                                        <div className="text-muted small mt-1">
                                            Décédé le {formData.dateDeces} à {formData.lieuDeces}<br />
                                            {formData.professionDefunt && `${t('labelProfession')}: ${formData.professionDefunt}`} {formData.nniDefunt && `| NNI: ${formData.nniDefunt}`}<br />
                                            {t('labelPereDefunt')} {formData.pereDefunt} {t('labelMereDefunt')} {formData.mereDefunt}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white rounded-3 shadow-xs border border-light text-start">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">{t('declarantInfo')}</div>
                                        <div className="fw-bold text-dark fs-5">{formData.prenomDeclarant} {formData.nomDeclarant}</div>
                                        <div className="text-muted small mt-1">{t('labelLienParente')}: {formData.lienParente} | {t('labelDomicileDeclarant')}: {formData.domicileDeclarant}</div>
                                    </div>
                                    {piecesJointes.length > 0 && (
                                        <div className="mt-3 p-2 bg-success bg-opacity-10 rounded border border-success border-opacity-25 text-success small">
                                            <i className="bi bi-paperclip me-1"></i> {piecesJointes.length} document(s) joint(s)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-muted small italic">
                            <i className="bi bi-shield-exclamation me-1"></i> {t('labelLegalNotice')}
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`fade-in px-lg-4 pb-5 ${language === 'ar' ? 'rtl' : ''}`} translate="no">
            {/* Header Section */}
            <div className="d-flex align-items-center mb-5 mt-3">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-outline-secondary rounded-circle p-2 me-4 shadow-sm d-flex align-items-center justify-content-center"
                    style={{ width: '45px', height: '45px' }}
                >
                    <i className={`bi ${language === 'ar' ? 'bi-arrow-right' : 'bi-arrow-left'} fs-5`}></i>
                </button>
                <div className="text-start">
                    <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>{t('deathDeclTitle')}</h1>
                    <p className="text-muted mb-0">{t('deathDeclSubtitle')}</p>
                </div>
            </div>

            <div className="row justify-content-center text-start">
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
                                    <i className="bi bi-exclamation-octagon-fill fs-4 text-start"></i>
                                    <span className="fw-bold">{error}</span>
                                </div>
                            )}

                            {isSuccess && (
                                <div className="alert alert-success rounded-3 border-0 shadow-sm mb-4 d-flex align-items-center gap-3">
                                    <i className="bi bi-check-circle-fill fs-4"></i>
                                    <span className="fw-bold">{t('msgSuccessDeces')}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-content-area" style={{ minHeight: '350px' }}>
                                    {renderStepContent()}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                    {step > 1 ? (
                                        <button type="button" className="btn btn-light rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 border" onClick={prevStep}>
                                            <i className={`bi ${language === 'ar' ? 'bi-arrow-right' : 'bi-arrow-left'}`}></i> {t('labelStepPrev')}
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {step < 4 ? (
                                        <button type="button" className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                                            onClick={nextStep} style={{ background: '#001a41' }}>
                                            {t('labelStepNext')} <i className={`bi ${language === 'ar' ? 'bi-arrow-left' : 'bi-arrow-right'}`}></i>
                                        </button>
                                    ) : (
                                        <button type="submit" className="btn btn-success rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2" disabled={loading || isSuccess} style={{ background: '#059669' }}>
                                            {loading ? (
                                                <><span className="spinner-border spinner-border-sm"></span> {t('labelProcessing')}</>
                                            ) : (
                                                <><i className="bi bi-send-fill"></i> {t('labelStepSubmit')}</>
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
                .shadow-xs {
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .rtl {
                    direction: rtl;
                }
                .rtl .text-start {
                    text-align: right !important;
                }
            `}} />
        </div>
    );
}
