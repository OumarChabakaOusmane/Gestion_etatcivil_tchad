import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import demandeService from "../../services/demandeService";
import TrackingTimeline from "../../components/TrackingTimeline";
import SkeletonLoader from "../../components/SkeletonLoader";
import { normalizeText } from "../../utils/textHelper";

export default function MesDemandes() {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: '', statut: '' });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    });
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [viewMode, setViewMode] = useState('tracking'); // 'tracking' or 'details'
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    useEffect(() => {
        loadDemandes(1);
    }, [filter]);

    const loadDemandes = async (page = 1) => {
        try {
            setLoading(true);
            const response = await demandeService.getMyDemandes({
                ...filter,
                page,
                limit: 10
            });

            const data = Array.isArray(response.data) ? response.data :
                (Array.isArray(response) ? response : []);

            setDemandes(data);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Erreur chargement demandes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            await demandeService.updateDemande(selectedDemande.id, editData);
            setIsEditing(false);
            loadDemandes(pagination.currentPage);
            setSelectedDemande(null);
            showToast('Demande mise à jour avec succès !', 'success');
        } catch (error) {
            showToast('Erreur lors de la mise à jour.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette demande ? Cette action est irréversible.')) return;

        try {
            setActionLoading(true);
            await demandeService.deleteDemande(id);
            setSelectedDemande(null);
            loadDemandes(pagination.currentPage);
            showToast('Demande annulée avec succès.', 'success');
        } catch (error) {
            showToast('Erreur lors de l\'annulation.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const startEditing = () => {
        setEditData(selectedDemande.donnees);
        setIsEditing(true);
    };

    const getStatutBadge = (statut) => {
        switch (statut) {
            case 'en_attente':
                return (
                    <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: 'rgba(255, 203, 0, 0.1)', color: '#9a7a00', border: '1px solid rgba(255, 203, 0, 0.2)', fontSize: '0.75rem' }}>
                        <i className="bi bi-hourglass-split me-1"></i> EN ATTENTE
                    </span>
                );
            case 'acceptee':
                return (
                    <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: 'rgba(5, 150, 105, 0.1)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.2)', fontSize: '0.75rem' }}>
                        <i className="bi bi-check2-circle me-1"></i> ACCEPTÉE
                    </span>
                );
            case 'rejetee':
                return (
                    <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)', fontSize: '0.75rem' }}>
                        <i className="bi bi-x-octagon me-1"></i> REJETÉE
                    </span>
                );
            default:
                return <span className="badge bg-secondary rounded-pill px-3 py-2">{statut.toUpperCase()}</span>;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'naissance': return <div className="icon-circle bg-primary-soft text-primary"><i className="bi bi-baby"></i></div>;
            case 'mariage': return <div className="icon-circle bg-danger-soft text-danger"><i className="bi bi-heart-fill"></i></div>;
            case 'deces': return <div className="icon-circle bg-secondary-soft text-secondary"><i className="bi bi-journal-text"></i></div>;
            default: return <div className="icon-circle bg-light text-dark"><i className="bi bi-file-earmark"></i></div>;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'naissance': return "Acte de Naissance";
            case 'mariage': return "Acte de Mariage";
            case 'deces': return "Acte de Décès";
            default: return type;
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return <span className="text-muted">N/A</span>;
        try {
            let date;
            if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
                date = new Date(timestamp._seconds * 1000);
            } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            } else {
                date = new Date(timestamp);
            }

            if (isNaN(date.getTime())) return 'Date invalide';

            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Date erreur';
        }
    };

    const formatSimpleDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('fr-FR');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="fade-in">
            <div className="dashboard-header-simple py-2 mb-4">
                <div>
                    <h1 className="user-welcome-text mb-1">Mes Demandes</h1>
                    <p className="text-muted mb-0 small">Suivez l'état de vos dossiers administratifs</p>
                </div>
                <div className="header-actions">
                    <Link to="/demande/naissance" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                        <i className="bi bi-plus-circle me-2"></i>
                        Nouvelle demande
                    </Link>
                </div>
            </div>

            {/* Filtres Modernisés */}
            <div className="modern-table-card mb-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-uppercase text-muted">Type de demande</label>
                        <select
                            className="form-select border-0 bg-light rounded-3 shadow-none py-2"
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        >
                            <option value="">Tous les types</option>
                            <option value="naissance">Naissance</option>
                            <option value="mariage">Mariage</option>
                            <option value="deces">Décès</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-uppercase text-muted">Statut du dossier</label>
                        <select
                            className="form-select border-0 bg-light rounded-3 shadow-none py-2"
                            value={filter.statut}
                            onChange={(e) => setFilter({ ...filter, statut: e.target.value })}
                        >
                            <option value="">Tous les statuts</option>
                            <option value="en_attente">En attente</option>
                            <option value="acceptee">Acceptée</option>
                            <option value="rejetee">Rejetée</option>
                        </select>
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                        <button
                            className="btn btn-light w-100 rounded-3 border fw-bold text-muted py-2"
                            onClick={() => setFilter({ type: '', statut: '' })}
                        >
                            <i className="bi bi-arrow-counterclockwise me-2"></i>
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste des demandes */}
            {loading ? (
                <div className="text-center my-5 p-5 modern-table-card">
                    <div className="d-flex flex-column gap-3">
                        <SkeletonLoader count={1} height="40px" width="100%" /> {/* Header */}
                        <SkeletonLoader count={5} height="60px" width="100%" /> {/* Rows */}
                    </div>
                    <p className="mt-3 text-muted fw-bold">Récupération de vos dossiers...</p>
                </div>
            ) : demandes.length === 0 ? (
                <div className="text-center py-5 modern-table-card">
                    <div className="mb-3">
                        <i className="bi bi-file-earmark-x" style={{ fontSize: '4rem', color: '#e2e8f0' }}></i>
                    </div>
                    <h5 className="fw-bold">Aucune demande trouvée</h5>
                    <p className="text-muted mb-4">
                        Vous n'avez pas encore soumis de dossier administratif pour le moment.
                    </p>
                    <Link to="/demande/naissance" className="btn btn-primary-custom px-5 py-3 rounded-pill shadow-sm">
                        <i className="bi bi-plus-circle me-2"></i>
                        Commencer ma première demande
                    </Link>
                </div>
            ) : (
                <>
                    <div className="modern-table-card border-0 rounded-4 overflow-hidden p-0">
                        <div className="table-responsive">
                            <table className="table table-hover modern-table align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">Type</th>
                                        <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">Date Dépôt</th>
                                        <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">État Actuel</th>
                                        <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demandes.map((demande) => (
                                        <tr key={demande.id}>
                                            <td className="px-4 py-3 fw-bold">
                                                {getTypeLabel(demande.type)}
                                            </td>
                                            <td className="px-4 py-3 text-muted">
                                                {formatDate(demande.dateDemande)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatutBadge(demande.statut)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-primary btn-sm rounded-pill px-3 py-2 shadow-sm"
                                                        onClick={() => { setSelectedDemande(demande); setViewMode('tracking'); setIsEditing(false); }}
                                                    >
                                                        <i className="bi bi-geo-alt me-1"></i> Suivre
                                                    </button>
                                                    {/* Le bouton de téléchargement est réservé à l'administration pour le moment */}
                                                    <button
                                                        className="btn btn-light btn-sm rounded-circle shadow-none"
                                                        title="Détails"
                                                        onClick={() => { setSelectedDemande(demande); setViewMode('details'); setIsEditing(false); }}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notification Toast style Maquette */}
                    {notification && (
                        <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 2000 }}>
                            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 shadow-lg fade-in rounded-4 d-flex align-items-center py-3 px-4`}
                                style={{ minWidth: '300px', borderLeft: notification.type === 'success' ? '5px solid #198754' : '5px solid #dc3545', backgroundColor: notification.type === 'success' ? '#d1e7dd' : '#f8d7da', color: notification.type === 'success' ? '#0f5132' : '#842029' }}>
                                <i className={`bi ${notification.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-3 fs-4`}></i>
                                <div className="fw-bold">{notification.message}</div>
                            </div>
                        </div>
                    )}

                    {/* Pagination Premium */}
                    {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4 px-2">
                            <div className="text-muted small">
                                Affichage de <strong>{demandes.length}</strong> sur <strong>{pagination.totalCount}</strong> demandes
                            </div>
                            <nav aria-label="Pagination des demandes">
                                <ul className="pagination mb-0 gap-1">
                                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link rounded-circle border-0 shadow-sm mx-1"
                                            onClick={() => loadDemandes(pagination.currentPage - 1)}
                                            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <li key={i + 1} className={`page-item ${pagination.currentPage === i + 1 ? 'active' : ''}`}>
                                            <button
                                                className="page-link rounded-circle border-0 shadow-sm mx-1 fw-bold"
                                                onClick={() => loadDemandes(i + 1)}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: pagination.currentPage === i + 1 ? 'var(--tchad-blue)' : 'white',
                                                    color: pagination.currentPage === i + 1 ? 'white' : 'var(--tchad-blue)'
                                                }}
                                            >
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link rounded-circle border-0 shadow-sm mx-1"
                                            onClick={() => loadDemandes(pagination.currentPage + 1)}
                                            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </>
            )
            }

            {/* Modal de Suivi / Détails / Edition */}
            {selectedDemande && (
                <div className="custom-modal-backdrop d-flex align-items-center justify-content-center animate__animated animate__fadeIn"
                    style={{ zIndex: 1060, backgroundColor: 'rgba(0, 26, 65, 0.7)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(4px)' }}>
                    <div className="card shadow-lg border-0 overflow-hidden animate__animated animate__zoomIn"
                        style={{ width: '95%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem' }}>

                        {/* Enhanced Header */}
                        <div className="p-4 d-flex justify-content-between align-items-center bg-white border-bottom">
                            <div className="d-flex align-items-center gap-3">
                                {getTypeIcon(selectedDemande.type)}
                                <div>
                                    <h4 className="fw-bold m-0 text-dark">
                                        {isEditing ? 'Modification du dossier' : 'Détails de la demande'}
                                    </h4>
                                    <span className="text-muted small fw-bold text-uppercase">Réf: {(selectedDemande?.id || selectedDemande?._id || '').substring(0, 8).toUpperCase()}</span>
                                </div>
                            </div>
                            <button className="btn-close shadow-none p-2 bg-light rounded-circle" onClick={() => setSelectedDemande(null)}></button>
                        </div>

                        {/* Tabs Navigation */}
                        {!isEditing && (
                            <div className="d-flex bg-white px-4 pt-2 border-bottom">
                                <button
                                    className={`btn px-4 py-2 fw-bold small text-uppercase transition-all border-bottom border-3 ${viewMode === 'tracking' ? 'text-primary border-primary' : 'text-muted border-transparent opacity-50'}`}
                                    onClick={() => setViewMode('tracking')}
                                >
                                    Suivi en temps réel
                                </button>
                                <button
                                    className={`btn px-4 py-2 fw-bold small text-uppercase transition-all border-bottom border-3 ${viewMode === 'details' ? 'text-primary border-primary' : 'text-muted border-transparent opacity-50'}`}
                                    onClick={() => setViewMode('details')}
                                >
                                    Fiche d'informations
                                </button>
                            </div>
                        )}

                        {/* Modal Body */}
                        <div className="p-4 overflow-auto bg-light" style={{ flex: 1 }}>
                            {viewMode === 'tracking' ? (
                                <div className="p-3 bg-white rounded-4 shadow-sm">
                                    <TrackingTimeline status={selectedDemande.statut} type={selectedDemande.type} />
                                </div>
                            ) : isEditing ? (
                                <form onSubmit={handleUpdate} className="bg-white p-4 rounded-4 shadow-sm">
                                    <div className="alert alert-info border-0 shadow-sm rounded-3 d-flex align-items-center gap-3 mb-4">
                                        <i className="bi bi-info-circle-fill fs-4"></i>
                                        <span className="fw-bold small">Vous modifiez actuellement les informations de votre demande. Assurez-vous de l'exactitude des nouvelles données.</span>
                                    </div>
                                    <div className="row g-4">
                                        {(() => {
                                            const labelMap = {
                                                nomEnfant: "Nom de l'enfant", prenomEnfant: "Prénoms de l'enfant", sexeEnfant: "Sexe de l'enfant",
                                                dateNaissanceEnfant: "Date naissance", heureNaissanceEnfant: "Heure naissance", lieuNaissanceEnfant: "Lieu naissance",
                                                nomPere: "Nom du Père", prenomPere: "Prénom du Père", professionPere: "Profession Père",
                                                nomMere: "Nom de la Mère", prenomMere: "Prénom de la Mère", professionMere: "Profession Mère",
                                                nomEpoux: "Nom Époux", prenomEpoux: "Prénom Époux", nomEpouse: "Nom Épouse",
                                                prenomEpouse: "Prénom Épouse", dateMariage: "Date Mariage", lieuMariage: "Lieu Mariage",
                                                nomDefunt: "Nom Défunt", prenomDefunt: "Prénom Défunt", dateDeces: "Date Décès", lieuDeces: "Lieu Décès"
                                            };

                                            const renderField = (key) => {
                                                const value = editData[key];
                                                if (value === undefined) return null;
                                                const isDate = key.toLowerCase().includes('date');
                                                const isTime = key.toLowerCase().includes('heure');
                                                const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase();

                                                return (
                                                    <div className="col-md-6" key={key}>
                                                        <label className="form-label small fw-bold text-muted text-uppercase">{label}</label>
                                                        <input
                                                            type={isDate ? "date" : (isTime ? "time" : "text")}
                                                            className="form-control bg-light border-0 py-2 px-3 fw-bold"
                                                            value={value || ''}
                                                            onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                );
                                            };

                                            const renderSection = (title, fields) => (
                                                <div className="col-12 mb-4">
                                                    <h6 className="fw-bold text-primary-dark mb-3 border-start border-3 border-primary ps-2">{title}</h6>
                                                    <div className="row g-3">
                                                        {fields.map(f => renderField(f))}
                                                    </div>
                                                </div>
                                            );

                                            if (selectedDemande.type === 'naissance') {
                                                return (
                                                    <>
                                                        {renderSection("Identité de l'enfant", ["nomEnfant", "prenomEnfant", "sexeEnfant", "dateNaissanceEnfant", "heureNaissanceEnfant", "lieuNaissanceEnfant"])}
                                                        {renderSection("Filiation", ["nomPere", "prenomPere", "nomMere", "prenomMere"])}
                                                    </>
                                                );
                                            } else if (selectedDemande.type === 'mariage') {
                                                return renderSection("Détails du Mariage", ["nomEpoux", "prenomEpoux", "nomEpouse", "prenomEpouse", "dateMariage", "lieuMariage"]);
                                            } else if (selectedDemande.type === 'deces') {
                                                return renderSection("Identité du Défunt", ["nomDefunt", "prenomDefunt", "dateDeces", "lieuDeces"]);
                                            }
                                        })()}
                                    </div>
                                    <div className="d-flex gap-3 mt-5 pt-4 border-top">
                                        <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setIsEditing(false)}>Abandonner</button>
                                        <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold ms-auto" style={{ background: '#001a41' }} disabled={actionLoading}>
                                            {actionLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Mettre à jour'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="details-view animate__animated animate__fadeIn">
                                    {/* Action Bar */}
                                    <div className="d-flex flex-wrap gap-3 mb-4 p-3 bg-white rounded-4 shadow-sm align-items-center">
                                        {(['en_attente', 'en attente'].includes(selectedDemande.statut?.toLowerCase())) && (
                                            <button className="btn btn-outline-primary border-2 rounded-pill px-4 fw-bold" onClick={startEditing}>
                                                <i className="bi bi-pencil-square me-2"></i>Modifier
                                            </button>
                                        )}
                                        <button className="btn btn-outline-secondary border-2 rounded-pill px-4 fw-bold" onClick={() => window.print()}>
                                            <i className="bi bi-printer me-2"></i>Imprimer
                                        </button>
                                        {(['en_attente', 'en attente'].includes(selectedDemande.statut?.toLowerCase())) && (
                                            <button className="btn btn-outline-danger border-2 rounded-pill px-4 fw-bold ms-auto" onClick={() => handleDelete(selectedDemande.id)}>
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        )}
                                    </div>

                                    {/* Information Grid */}
                                    <div className="bg-white p-4 rounded-4 shadow-sm">
                                        {selectedDemande.statut === 'rejetee' && (
                                            <div className="alert alert-danger border-0 rounded-4 p-4 mb-4">
                                                <h6 className="fw-bold d-flex align-items-center gap-2"><i className="bi bi-exclamation-triangle-fill fs-4"></i> Motif du rejet</h6>
                                                <p className="mb-0 fw-bold">{selectedDemande.motifRejet || "Informations incorrectes ou incomplètes."}</p>
                                            </div>
                                        )}

                                        <div className="row g-4">
                                            {Object.entries(selectedDemande.donnees).map(([key, value]) => {
                                                const labelMap = {
                                                    nomEnfant: "Nom", prenomEnfant: "Prénom", sexeEnfant: "Sexe",
                                                    dateNaissanceEnfant: "Date de naissance", lieuNaissanceEnfant: "Lieu de naissance",
                                                    nomPere: "Père", prenomPere: "Prénom Père", professionPere: "Profession Père",
                                                    nomMere: "Mère", prenomMere: "Prénom Mère", professionMere: "Profession Mère",
                                                    nomEpoux: "Époux", prenomEpoux: "Prénom Époux", nomEpouse: "Épouse",
                                                    prenomEpouse: "Prénom Épouse", dateMariage: "Date Mariage", lieuMariage: "Lieu Mariage",
                                                    nomDefunt: "Défunt", prenomDefunt: "Prénom Défunt", dateDeces: "Date Décès", lieuDeces: "Lieu Décès"
                                                };
                                                const label = labelMap[key] || key;

                                                // Sécurité : Ne pas tenter de rendre des objets imbriqués comme enfants React
                                                if (value && typeof value === 'object' && !value._seconds) {
                                                    return null;
                                                }

                                                return (
                                                    <div className="col-md-6" key={key}>
                                                        <div className="p-3 bg-light rounded-3 border-start border-4 border-primary">
                                                            <div className="text-muted small fw-bold text-uppercase">{label}</div>
                                                            <div className="fw-bold text-dark fs-5">{normalizeText(value) || "—"}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Centered Footer */}
                        <div className="p-4 bg-white border-top text-center">
                            <button className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm" style={{ background: '#001a41' }} onClick={() => setSelectedDemande(null)}>
                                Fermer cette vue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-primary-soft { background-color: rgba(0, 123, 255, 0.1); }
                .bg-danger-soft { background-color: rgba(220, 53, 69, 0.1); }
                .bg-secondary-soft { background-color: rgba(108, 117, 125, 0.1); }
                .icon-circle {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }
                .hover-bg-light:hover {
                    background-color: #f8f9fa !important;
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
                .text-primary-dark {
                    color: #001a41;
                }
            `}} />
        </div>
    );
}

// Composant interne pour une ligne de détail style maquette
const DetailRow = ({ label, value, valueColor = '#333' }) => (
    <div className="d-flex mb-2 pb-1" style={{ borderBottom: '1px solid #f1f1f1', alignItems: 'baseline' }}>
        <span className="fw-bold text-dark text-capitalize me-2" style={{ minWidth: '140px', fontSize: '0.8rem', color: '#666' }}>{label}:</span>
        <span style={{ color: valueColor, fontSize: '0.85rem', flex: 1, wordBreak: 'break-word' }}>{value}</span>
    </div>
);
