import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import demandeService from '../../services/demandeService';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

export default function VerifyCertificate() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [acte, setActe] = useState(null);
    const [error, setError] = useState(null);
    const { language } = useLanguage();
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        // Formater la date actuelle
        const now = new Date();
        const formattedDate = now.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        setCurrentDate(formattedDate);

        const verify = async () => {
            try {
                const response = await demandeService.verifyDemandePublique(id);
                setActe(response.data);
            } catch (err) {
                console.error('Verification error:', err);
                setError(err.message || "Impossible de vérifier ce document.");
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [id]);

    const getTypeLabel = (type) => {
        switch (type) {
            case 'naissance': return { fr: 'Acte de Naissance', ar: 'شهادة ميلاد' };
            case 'mariage': return { fr: 'Acte de Mariage', ar: 'شهادة زواج' };
            case 'deces': return { fr: 'Acte de Décès', ar: 'شهادة وفاة' };
            default: return { fr: 'Document', ar: 'وثيقة' };
        }
    };



    return (
        <div style={{
            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
            minHeight: '100vh',
            fontFamily: 'Inter, system-ui, sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Éléments de fond décoratifs pour l'effet premium */}
            <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'rgba(0, 74, 173, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(210, 16, 52, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>

            <PublicNavbar />

            <div className="container py-4 mt-5 position-relative">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-5">

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-3 text-muted">Authentification en cours...</p>
                            </div>
                        ) : error ? (
                            <div className="card border-0 shadow-lg rounded-4 text-center p-5 bg-white">
                                <i className="bi bi-exclamation-triangle-fill text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                                <h4 className="fw-bold">Référence Invalide</h4>
                                <p className="text-muted small">{error}</p>
                                <Link to="/" className="btn btn-outline-primary rounded-pill mt-3 px-4">Réessayer</Link>
                            </div>
                        ) : (
                            <div className="animate__animated animate__fadeInUp">
                                {/* BANNIÈRE VERTE RÉFÉRENCE */}
                                <div className="text-center mb-4">
                                    <div className="d-inline-flex align-items-center bg-success text-white py-2 px-4 rounded-4 shadow-lg mb-2"
                                        style={{ background: '#1e7e34', border: '2px solid rgba(255,255,255,0.2)' }}>
                                        <div className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
                                            <i className="bi bi-check-lg fw-bold"></i>
                                        </div>
                                        <div className="text-start">
                                            <h6 className="m-0 fw-bold">Document Officiel Vérifié</h6>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>وثيقة رسمية موثقة</div>
                                        </div>
                                    </div>
                                </div>

                                {/* CARTE GLASSMORPHISM */}
                                <div className="card border-0 shadow-2xl rounded-5 overflow-hidden position-relative"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.7)',
                                        backdropFilter: 'blur(15px)',
                                        border: '1px solid rgba(255, 255, 255, 0.5)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                                    }}>

                                    {/* Barre tricolore décorative */}
                                    <div style={{ height: '4px', display: 'flex' }}>
                                        <div style={{ flex: 1, backgroundColor: '#002664' }}></div>
                                        <div style={{ flex: 1, backgroundColor: '#FECB00' }}></div>
                                        <div style={{ flex: 1, backgroundColor: '#C60C30' }}></div>
                                    </div>

                                    <div className="card-body p-4 pt-3">
                                        {/* Sceau Officiel */}
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <img src="/logomairie.png" alt="Sceau Tchad" style={{ width: '50px' }} />
                                            <div className="text-end">
                                                <div className="fw-bold text-primary small">SIGEC TCHAD</div>
                                                <div className="text-muted" style={{ fontSize: '0.6rem' }}>Document Authentifié</div>
                                            </div>
                                        </div>

                                        <div className="text-center mb-4">
                                            <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>{getTypeLabel(acte.type).fr}</h2>
                                            <h4 className="text-secondary opacity-75 mt-0 font-arabic" style={{ direction: 'rtl' }}>{getTypeLabel(acte.type).ar}</h4>
                                        </div>

                                        {/* Détails de l'acte */}
                                        <div className="bg-white bg-opacity-40 rounded-4 p-3 mb-4 border border-white">
                                            {acte.type === 'naissance' && (
                                                <div className="space-y-3">
                                                    <VerifyRow labelFr="Enfant" labelAr="الطفل" value={`${acte.donnees.nomEnfant?.toUpperCase()} ${acte.donnees.prenomEnfant}`} isMain />
                                                    <VerifyRow labelFr="Né(e) le" labelAr="تاريخ الميلاد" value={`${new Date(acte.donnees.dateNaissanceEnfant).toLocaleDateString('fr-FR')} à ${acte.donnees.heureNaissanceEnfant || '-'}`} />
                                                    <VerifyRow labelFr="Lieu" labelAr="في" value={acte.donnees.lieuNaissanceEnfant} />
                                                    <hr className="my-2 opacity-10" />
                                                    <VerifyRow labelFr="Père" labelAr="الأب" value={`${acte.donnees.nomPere?.toUpperCase()} ${acte.donnees.prenomPere}`} />
                                                    <VerifyRow labelFr="NNI Père" labelAr="الرقم الوطني للأب" value={acte.donnees.nniPere || "-"} />
                                                    <VerifyRow labelFr="Mère" labelAr="الأم" value={`${acte.donnees.nomMere?.toUpperCase()} ${acte.donnees.prenomMere}`} />
                                                    <VerifyRow labelFr="NNI Mère" labelAr="الالرقم الوطني للأم" value={acte.donnees.nniMere || "-"} />
                                                </div>
                                            )}

                                            {acte.type === 'mariage' && (
                                                <div className="space-y-3">
                                                    <VerifyRow labelFr="Époux" labelAr="الزوج" value={`${acte.donnees.nomEpoux?.toUpperCase()} ${acte.donnees.prenomEpoux}`} isMain />
                                                    <VerifyRow labelFr="Épouse" labelAr="الزوجة" value={`${acte.donnees.nomEpouse?.toUpperCase()} ${acte.donnees.prenomEpouse}`} isMain />
                                                    <hr className="my-2 opacity-10" />
                                                    <VerifyRow labelFr="Mariage le" labelAr="تاريخ الزواج" value={new Date(acte.donnees.dateMariage).toLocaleDateString('fr-FR')} />
                                                    <VerifyRow labelFr="Lieu" labelAr="المكان" value={acte.donnees.lieuMariage} />
                                                    <VerifyRow labelFr="Dot" labelAr="المهر" value={acte.donnees.dotMontant} />
                                                    <hr className="my-2 opacity-10" />
                                                    <VerifyRow labelFr="Témoins Époux" labelAr="شهود الزوج" value={`${acte.donnees.temoin1Epoux || '-'} & ${acte.donnees.temoin2Epoux || '-'}`} />
                                                    <VerifyRow labelFr="Témoins Épouse" labelAr="شهود الزوجة" value={`${acte.donnees.temoin1Epouse || '-'} & ${acte.donnees.temoin2Epouse || '-'}`} />
                                                </div>
                                            )}

                                            {acte.type === 'deces' && (
                                                <div className="space-y-3">
                                                    <VerifyRow labelFr="Défunt" labelAr="المتوفى" value={`${acte.donnees.nomDefunt?.toUpperCase()} ${acte.donnees.prenomDefunt}`} isMain />
                                                    <VerifyRow labelFr="NNI Défunt" labelAr="الرقم الوطني" value={acte.donnees.nniDefunt || "-"} />
                                                    <VerifyRow labelFr="Décédé le" labelAr="تاريخ الوفاة" value={new Date(acte.donnees.dateDeces).toLocaleDateString('fr-FR')} />
                                                    <VerifyRow labelFr="Lieu" labelAr="مكان الوفاة" value={acte.donnees.lieuDeces} />
                                                    <hr className="my-2 opacity-10" />
                                                    <VerifyRow labelFr="Père" labelAr="الأب" value={acte.donnees.pereDefunt || "-"} />
                                                    <VerifyRow labelFr="Mère" labelAr="الأم" value={acte.donnees.mereDefunt || "-"} />
                                                    <VerifyRow labelFr="Profession" labelAr="المهنة" value={acte.donnees.professionDefunt || "-"} />
                                                    <VerifyRow labelFr="Cause" labelAr="السبب" value={acte.donnees.causeDeces || "Non spécifiée"} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center">
                                            <div className="mb-2">
                                                <div className="small text-muted mb-0">Date de vérification <span className="font-arabic">تاريخ التحقق</span></div>
                                                <div className="fw-bold text-dark m-0">{currentDate}</div>
                                            </div>

                                            <div className="py-2 px-3 bg-white bg-opacity-50 rounded-pill d-inline-flex align-items-center mb-3" style={{ fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                <span className="text-muted me-2">REF-{acte.id.toUpperCase()}</span>
                                                <i className="bi bi-shield-check text-success"></i>
                                            </div>
                                        </div>

                                        {/* Boutons d'action style image */}
                                        <div className="d-flex gap-2">
                                            <Link to="/" className="btn btn-primary flex-fill rounded-4 py-2 shadow-sm d-flex flex-column align-items-center text-decoration-none"
                                                style={{ background: 'linear-gradient(135deg, #004aad 0%, #00338d 100%)', border: 'none' }}>
                                                <span className="fw-bold small">Nouveau Scan</span>
                                                <span style={{ fontSize: '0.6rem' }}>تحقق جديد</span>
                                            </Link>
                                            <button onClick={() => window.print()} className="btn btn-light flex-fill rounded-4 py-2 shadow-sm d-flex flex-column align-items-center border"
                                                style={{ backgroundColor: '#fff' }}>
                                                <span className="fw-bold small text-dark">Imprimer</span>
                                                <span className="text-muted" style={{ fontSize: '0.6rem' }}>طباعة</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mt-4 text-muted" style={{ fontSize: '0.65rem' }}>
                                    Document certifié par le Système National d'État Civil du Tchad
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
                .font-arabic { font-family: 'Amiri', serif; }
                .hover-scale:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                .transition-all { transition: all 0.3s ease; }
            `}</style>
        </div>
    );
}

const VerifyRow = ({ labelFr, labelAr, value, isMain = false }) => (
    <div className={`d-flex justify-content-between align-items-center ${isMain ? 'mb-2' : 'mb-1'}`}>
        <div className="text-start" style={{ width: '40%' }}>
            <div className={`text-muted ${isMain ? 'small fw-bold' : ''}`} style={{ fontSize: isMain ? '0.75rem' : '0.65rem' }}>{labelFr}</div>
            <div className="text-secondary opacity-50 font-arabic" style={{ fontSize: '0.75rem' }}>{labelAr}</div>
        </div>
        <div className={`text-end flex-grow-1 ${isMain ? 'h5 fw-bold text-primary mb-0' : 'fw-bold text-dark mb-0'}`} style={{ fontSize: isMain ? '1.1rem' : '0.9rem' }}>
            {value || '-'}
        </div>
    </div>
);
