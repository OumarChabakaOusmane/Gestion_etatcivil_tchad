import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import demandeService from '../../services/demandeService';
import { useLanguage } from '../../context/LanguageContext';
import html2pdf from 'html2pdf.js';
import exportHelper from '../../utils/exportHelper';

export default function AdminDemandes() {
    const location = useLocation();
    const [demandes, setDemandes] = useState([]);
    const [filteredDemandes, setFilteredDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('tous');
    const [filterStatut, setFilterStatut] = useState('tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { t } = useLanguage();

    const [showRejetModal, setShowRejetModal] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [motifRejet, setMotifRejet] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [notification, setNotification] = useState(null);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return "-";
        let date;
        if (dateInput && typeof dateInput === 'object' && dateInput._seconds) {
            date = new Date(dateInput._seconds * 1000);
        } else {
            date = new Date(dateInput);
        }
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filterParam = params.get('filter');
        if (filterParam && ['en_attente', 'acceptee', 'rejetee'].includes(filterParam)) {
            setFilterStatut(filterParam);
        }
        loadData();
        const interval = setInterval(loadData, 2000);
        return () => clearInterval(interval);
    }, [location.search]);

    useEffect(() => {
        let result = demandes;
        if (filterType !== 'tous') result = result.filter(d => d.type === filterType);
        if (filterStatut !== 'tous') result = result.filter(d => d.statut === filterStatut);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(d =>
                (d.donnees?.nomEnfant && d.donnees.nomEnfant.toLowerCase().includes(term)) ||
                (d.donnees?.nomEpoux && d.donnees.nomEpoux.toLowerCase().includes(term)) ||
                (d.donnees?.nomDefunt && d.donnees.nomDefunt.toLowerCase().includes(term)) ||
                ((d.id || d._id) && (d.id || d._id).toLowerCase().includes(term))
            );
        }

        if (startDate) {
            const start = new Date(startDate);
            result = result.filter(d => {
                const date = d.createdAt?._seconds ? new Date(d.createdAt._seconds * 1000) : new Date(d.createdAt);
                return date >= start;
            });
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            result = result.filter(d => {
                const date = d.createdAt?._seconds ? new Date(d.createdAt._seconds * 1000) : new Date(d.createdAt);
                return date <= end;
            });
        }

        setFilteredDemandes(result);
    }, [demandes, filterType, filterStatut, searchTerm, startDate, endDate]);

    const loadData = async () => {
        try {
            const response = await demandeService.getAllDemandes();
            const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            setDemandes(data);
            if (loading) setLoading(false);
        } catch (error) {
            console.error('Erreur chargement:', error);
        }
    };

    const handleApprove = async (demande) => {
        if (!window.confirm('Voulez-vous vraiment valider cet acte ?')) return;
        try {
            setActionLoading(true);
            await demandeService.updateStatut(demande.id || demande._id, 'acceptee');
            await loadData();
            showToast('Acte validé avec succès !', 'success');
        } catch (error) {
            showToast('Erreur: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openRejetModal = (demande) => {
        setSelectedDemande(demande);
        setMotifRejet("");
        setShowRejetModal(true);
    };

    const handleRejet = async () => {
        if (!motifRejet) return showToast('Le motif est requis', 'error');
        try {
            setActionLoading(true);
            await demandeService.updateStatut(selectedDemande.id || selectedDemande._id, 'rejetee', motifRejet);
            setShowRejetModal(false);
            loadData();
            showToast('Demande rejetée.', 'success');
        } catch (error) {
            showToast('Erreur: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDetails = (demande) => {
        setSelectedDemande(demande);
        setShowDetailsModal(true);
    };

    const handleDownloadPDF = (demande) => {
        const themeColor = d => d.type === 'naissance' ? '#0d6efd' : d.type === 'mariage' ? '#198754' : '#dc3545';
        const element = document.createElement('div');

        const content = d => {
            if (d.type === 'naissance') return `
                <p>L'enfant de sexe ${d.donnees.sexeEnfant === 'M' ? 'Masculin' : 'Féminin'} nommé :</p>
                <h3 style="text-align:center; margin: 20px 0;">${d.donnees.prenomEnfant.toUpperCase()} ${d.donnees.nomEnfant.toUpperCase()}</h3>
                <p>Est né le : ${new Date(d.donnees.dateNaissanceEnfant).toLocaleDateString('fr-FR')}</p>
                <p>À : ${d.donnees.lieuNaissanceEnfant}</p>
                <p>De : ${d.donnees.prenomPere} ${d.donnees.nomPere}</p>
                <p>Et de : ${d.donnees.prenomMere} ${d.donnees.nomMere}</p>
            `;
            if (d.type === 'mariage') return `
                <p>Entre : <strong>${d.donnees.prenomEpoux.toUpperCase()} ${d.donnees.nomEpoux}</strong></p>
                <p>Et : <strong>${d.donnees.prenomEpouse.toUpperCase()} ${d.donnees.nomEpouse}</strong></p>
                <p>Célébré le : ${new Date(d.donnees.dateMariage).toLocaleDateString('fr-FR')}</p>
                <p>Lieu : ${d.donnees.lieuMariage}</p>
            `;
            if (d.type === 'deces') return `
                <p>Le décès de : <strong>${d.donnees.prenomDefunt.toUpperCase()} ${d.donnees.nomDefunt}</strong></p>
                <p>Survenu le : ${new Date(d.donnees.dateDeces).toLocaleDateString('fr-FR')}</p>
                <p>À : ${d.donnees.lieuDeces}</p>
            `;
            return '';
        };

        element.innerHTML = `
            <div style="padding: 40px; border: 10px double ${themeColor(demande)}; font-family: sans-serif;">
                <div style="text-align:center;">
                    <h2>RÉPUBLIQUE DU TCHAD</h2>
                    <p>Unité - Travail - Progrès</p>
                    <hr/>
                    <h1>EXTRAIT D'ACTE DE ${demande.type.toUpperCase()}</h1>
                </div>
                <div style="margin-top: 30px; line-height: 1.6;">
                    ${content(demande)}
                </div>
                <div style="margin-top: 50px; text-align: right;">
                    <p>Fait à N'Djamena, le ${new Date().toLocaleDateString('fr-FR')}</p>
                    <p><strong>L'Officier d'État Civil</strong></p>
                </div>
            </div>
        `;

        const opt = {
            margin: 1,
            filename: `ACTE_${demande.type.toUpperCase()}_${demande.id.slice(-6)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

    };

    const handleExport = () => {
        const formattedData = exportHelper.formatDemandesForExport(filteredDemandes);
        const success = exportHelper.exportToExcel(formattedData, 'Demandes_SIGEC', 'Demandes');
        if (success) showToast('Export réussi !', 'success');
        else showToast('Erreur lors de l\'export', 'error');
    };

    return (
        <div className="p-4 p-lg-5 animate__animated animate__fadeIn">
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden mb-5"
                style={{ background: 'linear-gradient(135deg, #004aad 0%, #002d6a 100%)' }}>
                <div className="card-body p-5 text-white position-relative">
                    <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                        <div className="col-lg-8">
                            <h1 className="fw-bold mb-3 display-5">Gestion des Demandes</h1>
                            <p className="text-white-50 mb-0 fs-5">Examen et validation officielle des actes d'état civil.</p>
                        </div>
                    </div>
                </div>
            </div>

            {notification && (
                <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} border-0 shadow-sm rounded-4 mb-4 fade show d-flex align-items-center`}>
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div className="fw-bold">{notification.message}</div>
                </div>
            )}

            <div className="bg-white p-3 rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center">
                <div className="btn-group">
                    {['tous', 'naissance', 'mariage', 'deces'].map(t => (
                        <button key={t} onClick={() => setFilterType(t)} className={`btn btn-sm px-3 rounded-3 fw-bold text-capitalize ${filterType === t ? 'btn-primary shadow-sm' : 'text-muted border-0 bg-transparent'}`}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="d-flex align-items-center gap-3">
                    <button onClick={handleExport} className="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center gap-2 fw-bold">
                        <i className="bi bi-file-earmark-excel-fill"></i>
                        Exporter (.xlsx)
                    </button>
                    <div className="position-relative" style={{ width: '250px' }}>
                        <input type="text" placeholder="Rechercher..." className="form-control form-control-sm border-0 bg-light rounded-pill ps-4" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small"></i>
                    </div>
                </div>
            </div>

            <div className="bg-white p-3 rounded-4 shadow-sm mb-4 border d-flex flex-wrap gap-4 align-items-center animate__animated animate__fadeIn">
                <div className="d-flex align-items-center gap-2">
                    <label className="small fw-bold text-muted">Du :</label>
                    <input type="date" className="form-control form-control-sm border-0 bg-light rounded-pill px-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="d-flex align-items-center gap-2">
                    <label className="small fw-bold text-muted">Au :</label>
                    <input type="date" className="form-control form-control-sm border-0 bg-light rounded-pill px-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                {(startDate || endDate) && (
                    <button className="btn btn-sm btn-link text-danger p-0 fw-bold text-decoration-none" onClick={() => { setStartDate(''); setEndDate(''); }}>
                        Effacer les dates
                    </button>
                )}
                <div className="ms-auto stats-pill bg-light px-3 py-1 rounded-pill small fw-bold text-primary border">
                    <i className="bi bi-funnel-fill me-1"></i>
                    {filteredDemandes.length} résultat(s)
                </div>
            </div>

            <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 border-0">
                        <thead className="bg-light">
                            <tr className="small text-muted fw-bold text-uppercase border-bottom">
                                <th className="ps-4 py-4">RÉF</th>
                                <th className="py-4">TYPE</th>
                                <th className="py-4">CITOYEN</th>
                                <th className="py-4">DATE</th>
                                <th className="py-4">STATUT</th>
                                <th className="text-end pe-4 py-4">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filteredDemandes.map(d => (
                                <tr key={d.id || d._id} className="border-bottom">
                                    <td className="ps-4 py-4 fw-bold text-dark font-monospace" style={{ fontSize: '0.9rem' }}>
                                        #{(d.id || d._id).slice(-8).toUpperCase()}
                                    </td>
                                    <td className="py-4">
                                        <span className={`badge px-3 py-2 bg-opacity-10 text-capitalize fw-bold rounded-3 ${d.type === 'naissance' ? 'bg-primary text-primary' : d.type === 'mariage' ? 'bg-success text-success' : 'bg-danger text-danger'}`}>
                                            {d.type === 'deces' ? 'Décès' : d.type}
                                        </span>
                                    </td>
                                    <td className="py-4 fw-bold">
                                        {d.userId?.prenom || "-"} {d.userId?.nom || ""}
                                    </td>
                                    <td className="py-4 text-muted fw-semibold">{formatDate(d.dateDemande)}</td>
                                    <td className="py-4">
                                        <span className={`badge rounded-pill px-3 py-2 ${d.statut === 'en_attente' ? 'bg-warning text-dark' : d.statut === 'acceptee' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                            {d.statut === 'en_attente' ? 'En attente' : d.statut === 'acceptee' ? 'Acceptée' : 'Rejetée'}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4 py-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button className="btn btn-sm btn-outline-secondary border-0 bg-light rounded-3 px-3" onClick={() => handleDetails(d)} title="Détails">
                                                <i className="bi bi-eye fs-6"></i>
                                            </button>
                                            {d.statut === 'en_attente' && (
                                                <button className="btn btn-sm btn-primary rounded-3 px-3 shadow-sm" onClick={() => handleApprove(d)} disabled={actionLoading} title="Approuver">
                                                    <i className="bi bi-check-lg fs-6"></i>
                                                </button>
                                            )}
                                            {d.statut === 'acceptee' && (
                                                <button className="btn btn-sm btn-success rounded-3 px-3 shadow-sm" onClick={() => handleDownloadPDF(d)} title="Télécharger">
                                                    <i className="bi bi-download fs-6"></i>
                                                </button>
                                            )}
                                            {d.statut === 'en_attente' && (
                                                <button className="btn btn-sm btn-danger rounded-3 px-3 shadow-sm" onClick={() => openRejetModal(d)} title="Rejeter">
                                                    <i className="bi bi-x-lg fs-6"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredDemandes.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Aucune demande</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals... (Gardés identiques mais simplifiés) */}
            {showRejetModal && (
                <div className="modal show d-block shadow-lg animate__animated animate__zoomIn" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 bg-danger text-white rounded-top-4">
                                <h5 className="modal-title fw-bold">Rejeter la demande</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRejetModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <label className="fw-bold mb-2">Motif du rejet</label>
                                <textarea className="form-control border-0 bg-light" rows="4" value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)} placeholder="Précisez la raison du rejet..."></textarea>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-light rounded-3" onClick={() => setShowRejetModal(false)}>Annuler</button>
                                <button className="btn btn-danger rounded-3 px-4 shadow-sm" onClick={handleRejet} disabled={actionLoading}>Confirmer le Rejet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedDemande && (
                <div className="modal show d-block animate__animated animate__fadeInUp" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-bottom p-4 bg-light">
                                <h4 className="fw-bold m-0 text-primary">Extrait de Demande</h4>
                                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-4 h-100">
                                            <h6 className="text-primary fw-bold text-uppercase small mb-3">Métadonnées</h6>
                                            <DetailRow label="Référence" value={selectedDemande.id.toUpperCase()} />
                                            <DetailRow label="Type d'acte" value={selectedDemande.type.toUpperCase()} />
                                            <DetailRow label="Date de demande" value={formatDate(selectedDemande.dateDemande)} />
                                            <DetailRow label="Statut actuel" value={selectedDemande.statut.replace('_', ' ')} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-white border rounded-4 h-100 shadow-sm text-center d-flex flex-column justify-content-center">
                                            <i className="bi bi-person-badge-fill text-primary display-4 mb-2"></i>
                                            <h5 className="fw-bold mb-0">{selectedDemande.donnees.nomEnfant || selectedDemande.donnees.nomEpoux || selectedDemande.donnees.nomDefunt || "Citoyen"}</h5>
                                            <p className="text-muted small">Demandeur Principal</p>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <h6 className="text-primary fw-bold text-uppercase small mb-3">Données du formulaire</h6>
                                        <div className="bg-light p-4 rounded-4 shadow-inner">
                                            <div className="row g-3">
                                                {Object.entries(selectedDemande.donnees).map(([k, v]) => (
                                                    <div key={k} className="col-md-6 border-bottom py-2 d-flex justify-content-between">
                                                        <span className="text-muted text-capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                                        <span className="fw-bold text-dark">{String(v)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 bg-light">
                                <button className="btn btn-primary rounded-pill px-5 fw-bold" onClick={() => setShowDetailsModal(false)}>Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const DetailRow = ({ label, value }) => (
    <div className="mb-3">
        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">{label}</label>
        <div className="fw-bold text-dark">{value}</div>
    </div>
);
