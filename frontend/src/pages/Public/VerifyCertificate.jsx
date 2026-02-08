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

    const getNomComplet = (data) => {
        if (!data) return '-';
        if (acte?.type === 'naissance') return `${data.prenomEnfant} ${data.nomEnfant?.toUpperCase()}`;
        if (acte?.type === 'mariage') return `${data.prenomEpoux} ${data.nomEpoux?.toUpperCase()} & ${data.prenomEpouse} ${data.nomEpouse?.toUpperCase()}`;
        if (acte?.type === 'deces') return `${data.prenomDefunt} ${data.nomDefunt?.toUpperCase()}`;
        return '-';
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
                                        <div className="mb-3">
                                            <img src="/logomairie.png" alt="Sceau Tchad" style={{ width: '65px' }} />
                                        </div>

                                        <div className="text-center mb-4">
                                            <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.5px' }}>{getTypeLabel(acte.type).fr}</h2>
                                            <h3 className="text-secondary opacity-75 mt-0 font-arabic" style={{ direction: 'rtl' }}>{getTypeLabel(acte.type).ar}</h3>
                                        </div>

                                        {/* Champs de données avec style bilingue */}
                                        <div className="space-y-4 text-center px-2">
                                            <div className="mb-4">
                                                <div className="small text-muted mb-0">Nom complet <span className="font-arabic">الاسم الكامل</span></div>
                                                <div className="h4 fw-bold text-dark m-0">{getNomComplet(acte.donnees)}</div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="small text-muted mb-0">Date de vérification <span className="font-arabic">تاريخ التحقق</span></div>
                                                <div className="h4 fw-bold text-dark m-0">{currentDate}</div>
                                            </div>

                                            <div className="py-2 px-3 bg-white bg-opacity-50 rounded-pill d-inline-flex align-items-center mb-4" style={{ fontSize: '0.85rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                <span className="text-muted me-2">REF-{acte.id.toUpperCase()}</span>
                                                <i className="bi bi-qr-code text-primary"></i>
                                            </div>
                                        </div>

                                        {/* Boutons d'action style image */}
                                        <div className="d-flex gap-3 mt-4">
                                            <button className="btn btn-primary flex-fill rounded-4 py-2 shadow-sm d-flex flex-column align-items-center transition-all hover-scale"
                                                style={{ background: 'linear-gradient(135deg, #004aad 0%, #00338d 100%)', border: 'none' }}>
                                                <span className="fw-bold small">Télécharger PDF</span>
                                                <span style={{ fontSize: '0.6rem' }}>تحميل PDF</span>
                                            </button>
                                            <Link to="/" className="btn btn-light flex-fill rounded-4 py-2 shadow-sm d-flex flex-column align-items-center text-decoration-none border"
                                                style={{ backgroundColor: '#f8f9fa' }}>
                                                <span className="fw-bold small text-dark">Nouvelle Vérification</span>
                                                <span className="text-muted" style={{ fontSize: '0.6rem' }}>تحقق جديد</span>
                                            </Link>
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
