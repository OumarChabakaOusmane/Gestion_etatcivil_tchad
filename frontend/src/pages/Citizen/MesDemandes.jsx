import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import demandeService from "../../services/demandeService";
import TrackingTimeline from "../../components/TrackingTimeline";

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
                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(255, 207, 0, 0.1)', color: '#b45309', border: '1px solid rgba(255, 207, 0, 0.2)' }}>
                        <i className="bi bi-clock-history me-1"></i> En attente
                    </span>
                );
            case 'acceptee':
                return (
                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <i className="bi bi-check-circle me-1"></i> Acceptée
                    </span>
                );
            case 'rejetee':
                return (
                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(210, 16, 52, 0.1)', color: 'var(--tchad-red)', border: '1px solid rgba(210, 16, 52, 0.2)' }}>
                        <i className="bi bi-x-circle me-1"></i> Rejetée
                    </span>
                );
            default:
                return <span className="badge bg-secondary rounded-pill">{statut}</span>;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'naissance':
                return <><i className="bi bi-file-earmark-person me-2 text-primary"></i>Naissance</>;
            case 'mariage':
                return <><i className="bi bi-heart-fill me-2 text-danger"></i>Mariage</>;
            case 'deces':
                return <><i className="bi bi-journal-text me-2 text-secondary"></i>Décès</>;
            default:
                return type;
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

            return date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: 'long',
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
                    <div className="spinner-grow text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
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
            {
                selectedDemande && (
                    <div className="custom-modal-backdrop d-flex align-items-center justify-content-center" style={{ zIndex: 1060, backgroundColor: 'rgba(0,0,0,0.6)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <div className="bg-white shadow-lg overflow-hidden fade-in" style={{ width: '95%', maxWidth: '900px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', borderRadius: '0', borderTop: '5px solid #f27405' }}>

                            {/* Header Modal style Maquette */}
                            <div className="p-4 d-flex justify-content-between align-items-center bg-white border-bottom">
                                <h2 className="fw-bold m-0 text-dark" style={{ fontSize: '1.8rem' }}>
                                    {isEditing ? 'Modifier ma demande' : 'Détails Demande'}
                                </h2>
                                <span className="text-muted small">Détails Demande</span>
                            </div>

                            {/* Tabs Navigation (if not editing) */}
                            {!isEditing && (
                                <div className="d-flex border-bottom bg-light">
                                    <button
                                        className={`flex-fill py-3 border-0 bg-transparent fw-bold small text-uppercase ${viewMode === 'tracking' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                                        onClick={() => setViewMode('tracking')}
                                    >
                                        <i className="bi bi-geo-alt me-2"></i>Suivi
                                    </button>
                                    <button
                                        className={`flex-fill py-3 border-0 bg-transparent fw-bold small text-uppercase ${viewMode === 'details' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                                        onClick={() => setViewMode('details')}
                                    >
                                        <i className="bi bi-info-circle me-2"></i>Détails
                                    </button>
                                </div>
                            )}

                            {/* Modal Body */}
                            <div className="p-4 overflow-auto" style={{ flex: 1 }}>
                                {viewMode === 'tracking' ? (
                                    <TrackingTimeline status={selectedDemande.statut} type={selectedDemande.type} />
                                ) : isEditing ? (
                                    <form onSubmit={handleUpdate}>
                                        <div className="alert alert-success small mb-4 rounded-4 border-0 shadow-sm" style={{ backgroundColor: '#d1e7dd', color: '#0f5132', borderLeft: '5px solid #198754' }}>
                                            <i className="bi bi-check-circle-fill me-2 text-success"></i>
                                            Vérifiez vos informations avant de valider les modifications.
                                        </div>
                                        <div className="row g-4">
                                            {(() => {
                                                const labelMap = {
                                                    // Naissance
                                                    nomEnfant: "Nom de l'enfant",
                                                    prenomEnfant: "Prénom de l'enfant",
                                                    sexeEnfant: "Sexe de l'enfant",
                                                    dateNaissanceEnfant: "Date de naissance l'enfant",
                                                    lieuNaissanceEnfant: "Lieu de naissance l'enfant",
                                                    nomPere: "Nom du Père",
                                                    prenomPere: "Prénom du Père",
                                                    dateNaissancePere: "Date naissance Père",
                                                    professionPere: "Profession du Père",
                                                    domicilePere: "Domicile du Père",
                                                    nomMere: "Nom de la Mère",
                                                    prenomMere: "Prénom de la Mère",
                                                    dateNaissanceMere: "Date naissance Mère",
                                                    professionMere: "Profession de la Mère",
                                                    domicileMere: "Domicile de la Mère",
                                                    // Mariage
                                                    nomEpoux: "Nom de l'époux",
                                                    prenomEpoux: "Prénom de l'époux",
                                                    professionEpoux: "Profession de l'époux",
                                                    domicileEpoux: "Domicile de l'époux",
                                                    nomEpouse: "Nom de l'épouse",
                                                    prenomEpouse: "Prénom de l'épouse",
                                                    dateMariage: "Date du mariage",
                                                    lieuMariage: "Lieu du mariage",
                                                    regimeMatrimonial: "Régime matrimonial",
                                                    // Décès
                                                    nomDefunt: "Nom du défunt",
                                                    prenomDefunt: "Prénom du défunt",
                                                    dateDeces: "Date du décès",
                                                    lieuDeces: "Lieu du décès",
                                                    causeDeces: "Cause du décès",
                                                    nomDeclarant: "Nom du déclarant",
                                                    prenomDeclarant: "Prénom du déclarant",
                                                    lienParente: "Lien de parenté",
                                                    domicileDeclarant: "Domicile du déclarant"
                                                };

                                                const renderField = (key) => {
                                                    const value = editData[key];
                                                    if (value === undefined) return null;
                                                    const isDate = key.toLowerCase().includes('date');
                                                    const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase();

                                                    return (
                                                        <div className="col-md-6 mb-2" key={key}>
                                                            <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{label}</label>
                                                            {key === 'sexeEnfant' ? (
                                                                <select
                                                                    className="form-select form-select-sm bg-light border-0"
                                                                    style={{ borderRadius: '4px' }}
                                                                    value={value}
                                                                    onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                                                    required
                                                                >
                                                                    <option value="M">Masculin</option>
                                                                    <option value="F">Féminin</option>
                                                                </select>
                                                            ) : key === 'regimeMatrimonial' ? (
                                                                <select
                                                                    className="form-select form-select-sm bg-light border-0"
                                                                    style={{ borderRadius: '4px' }}
                                                                    value={value}
                                                                    onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                                                    required
                                                                >
                                                                    <option value="monogamie">Monogamie</option>
                                                                    <option value="polygamie">Polygamie</option>
                                                                    <option value="communaute_biens">Communauté de biens</option>
                                                                    <option value="separation_biens">Séparation de biens</option>
                                                                </select>
                                                            ) : key === 'lienParente' ? (
                                                                <select
                                                                    className="form-select form-select-sm bg-light border-0"
                                                                    style={{ borderRadius: '4px' }}
                                                                    value={value}
                                                                    onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                                                    required
                                                                >
                                                                    <option value="">Sélectionnez le lien...</option>
                                                                    <option value="Pere">Père</option>
                                                                    <option value="Mere">Mère</option>
                                                                    <option value="Fils">Fils</option>
                                                                    <option value="Fille">Fille</option>
                                                                    <option value="Frere">Frère</option>
                                                                    <option value="Soeur">Sœur</option>
                                                                    <option value="Conjoint">Conjoint(e)</option>
                                                                    <option value="Autre">Autre</option>
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type={isDate ? "date" : "text"}
                                                                    className="form-control form-control-sm bg-light border-0"
                                                                    style={{ borderRadius: '4px' }}
                                                                    value={value}
                                                                    onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                                                    required
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                };

                                                const renderSection = (title, fields) => (
                                                    <div className="col-12 mt-3 mb-2">
                                                        <h6 className="fw-bold text-primary text-uppercase small border-bottom pb-2 mb-3" style={{ letterSpacing: '1px' }}>{title}</h6>
                                                        <div className="row g-3">
                                                            {fields.map(f => renderField(f))}
                                                        </div>
                                                    </div>
                                                );

                                                if (selectedDemande.type === 'naissance') {
                                                    return (
                                                        <>
                                                            {renderSection("L'Enfant", ["nomEnfant", "prenomEnfant", "sexeEnfant", "dateNaissanceEnfant", "lieuNaissanceEnfant"])}
                                                            {renderSection("Le Père", ["nomPere", "prenomPere", "dateNaissancePere", "professionPere", "domicilePere"])}
                                                            {renderSection("La Mère", ["nomMere", "prenomMere", "dateNaissanceMere", "professionMere", "domicileMere"])}
                                                        </>
                                                    );
                                                } else if (selectedDemande.type === 'mariage') {
                                                    return (
                                                        <>
                                                            {renderSection("L'Époux", ["nomEpoux", "prenomEpoux", "professionEpoux", "domicileEpoux"])}
                                                            {renderSection("L'Épouse", ["nomEpouse", "prenomEpouse", "dateMariage", "lieuMariage", "regimeMatrimonial"])}
                                                        </>
                                                    );
                                                } else if (selectedDemande.type === 'deces') {
                                                    return (
                                                        <>
                                                            {renderSection("Le Défunt", ["nomDefunt", "prenomDefunt", "dateDeces", "lieuDeces", "causeDeces"])}
                                                            {renderSection("Le Déclarant", ["nomDeclarant", "prenomDeclarant", "lienParente", "domicileDeclarant"])}
                                                        </>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        <div className="d-flex gap-2 mt-5 pt-3 border-top justify-content-end">
                                            <button type="button" className="btn btn-light border px-4" onClick={() => setIsEditing(false)}>Annuler</button>
                                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={actionLoading}>
                                                {actionLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'ENREGISTRER LES MODIFICATIONS'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="details-view">
                                        {/* Barre d'outils style Maquette */}
                                        <div className="d-flex flex-wrap gap-2 mb-4 align-items-center justify-content-between border-bottom pb-4">
                                            <div className="d-flex flex-wrap gap-2">
                                                <button className="btn d-flex flex-column align-items-center justify-content-center text-white p-2"
                                                    style={{ backgroundColor: '#8b4513', width: '90px', height: '70px', borderRadius: '4px' }}
                                                    onClick={() => showToast("Affichage des pièces justificatives (Bientôt disponible)", "info")}>
                                                    <i className="bi bi-image mb-1 fs-5"></i>
                                                    <span style={{ fontSize: '0.75rem' }}>Pièce</span>
                                                </button>

                                                {selectedDemande.statut === 'en_attente' && (
                                                    <button className="btn d-flex flex-column align-items-center justify-content-center text-white p-2"
                                                        style={{ backgroundColor: '#0d6efd', width: '90px', height: '70px', borderRadius: '4px' }}
                                                        onClick={startEditing}>
                                                        <i className="bi bi-pencil-square mb-1 fs-5"></i>
                                                        <span style={{ fontSize: '0.75rem' }}>Modifier</span>
                                                    </button>
                                                )}

                                                <button className="btn d-flex flex-column align-items-center justify-content-center text-white p-2"
                                                    style={{ backgroundColor: '#6f42c1', width: '90px', height: '70px', borderRadius: '4px' }}
                                                    onClick={() => window.print()}>
                                                    <i className="bi bi-printer mb-1 fs-5"></i>
                                                    <span style={{ fontSize: '0.75rem' }}>Imprimer</span>
                                                </button>

                                                {selectedDemande.statut === 'en_attente' && (
                                                    <button className="btn d-flex flex-column align-items-center justify-content-center text-white p-2"
                                                        style={{ backgroundColor: '#dc3545', width: '90px', height: '70px', borderRadius: '4px' }}
                                                        onClick={() => handleDelete(selectedDemande.id)}>
                                                        <i className="bi bi-x-circle mb-1 fs-5"></i>
                                                        <span style={{ fontSize: '0.75rem' }}>Annuler</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Bloc de Statut */}
                                            <div className={`text-white d-flex flex-column align-items-center justify-content-center p-2 rounded-2 shadow-sm ${selectedDemande.statut === 'en_attente' ? 'bg-primary' : (selectedDemande.statut === 'acceptee' ? 'bg-success' : 'bg-danger')}`}
                                                style={{ width: '100px', height: '80px' }}>
                                                <i className={`bi ${selectedDemande.statut === 'en_attente' ? 'bi-eye-slash-fill' : 'bi-check-circle-fill'} fs-4 mb-1`}></i>
                                                <span className="fw-bold text-center" style={{ fontSize: '0.65rem' }}>
                                                    {selectedDemande.statut === 'en_attente' ? 'NON TRAITÉE' : selectedDemande.statut.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Grille d'informations dynamique par type d'acte */}
                                        <div className="row g-4">
                                            {selectedDemande.type === 'naissance' && (
                                                <>
                                                    <div className="col-md-6 border-end">
                                                        <h6 className="fw-bold text-primary mb-3 text-uppercase small">L'Enfant</h6>
                                                        <DetailRow label="Nom" value={selectedDemande.donnees.nomEnfant} />
                                                        <DetailRow label="Prénom" value={selectedDemande.donnees.prenomEnfant} />
                                                        <DetailRow label="Sexe" value={selectedDemande.donnees.sexeEnfant === 'M' ? 'Masculin' : 'Féminin'} />
                                                        <DetailRow label="Date naissance" value={formatSimpleDate(selectedDemande.donnees.dateNaissanceEnfant)} />

                                                        <h6 className="fw-bold text-primary mt-4 mb-3 text-uppercase small">Le Père</h6>
                                                        <DetailRow label="Nom du Père" value={selectedDemande.donnees.nomPere} />
                                                        <DetailRow label="Profession" value={selectedDemande.donnees.professionPere} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <h6 className="fw-bold text-primary mb-3 text-uppercase small">La Mère</h6>
                                                        <DetailRow label="Nom de la Mère" value={selectedDemande.donnees.nomMere} />
                                                        <DetailRow label="Prénom de la Mère" value={selectedDemande.donnees.prenomMere} />
                                                        <DetailRow label="Profession" value={selectedDemande.donnees.professionMere} />

                                                        <h6 className="fw-bold text-primary mt-4 mb-3 text-uppercase small">Infos Demande</h6>
                                                        <DetailRow label="Type" value="Acte de Naissance" />
                                                        <DetailRow label="Soumis le" value={formatDate(selectedDemande.dateDemande)} />
                                                    </div>
                                                </>
                                            )}

                                            {selectedDemande.type === 'mariage' && (
                                                <>
                                                    <div className="col-md-6 border-end">
                                                        <h6 className="fw-bold text-primary mb-3 text-uppercase small">L'Époux</h6>
                                                        <DetailRow label="Nom" value={selectedDemande.donnees.nomEpoux} />
                                                        <DetailRow label="Prénom" value={selectedDemande.donnees.prenomEpoux} />
                                                        <DetailRow label="Profession" value={selectedDemande.donnees.professionEpoux} />

                                                        <h6 className="fw-bold text-primary mt-4 mb-3 text-uppercase small">L'Épouse</h6>
                                                        <DetailRow label="Nom" value={selectedDemande.donnees.nomEpouse} />
                                                        <DetailRow label="Prénom" value={selectedDemande.donnees.prenomEpouse} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <h6 className="fw-bold text-primary mb-3 text-uppercase small">Le Mariage</h6>
                                                        <DetailRow label="Date Mariage" value={formatSimpleDate(selectedDemande.donnees.dateMariage)} />
                                                        <DetailRow label="Lieu Mariage" value={selectedDemande.donnees.lieuMariage} />
                                                        <DetailRow label="Régime" value={selectedDemande.donnees.regimeMatrimonial} />

                                                        <h6 className="fw-bold text-primary mt-4 mb-3 text-uppercase small">Infos Demande</h6>
                                                        <DetailRow label="Type" value="Acte de Mariage" />
                                                        <DetailRow label="Soumis le" value={formatDate(selectedDemande.dateDemande)} />
                                                    </div>
                                                </>
                                            )}

                                            {selectedDemande.type === 'deces' && (
                                                <>
                                                    <div className="col-md-6 border-end">
                                                        <h6 className="fw-bold text-primary mb-3 text-uppercase small">Le Défunt</h6>
                                                        <DetailRow label="Nom" value={selectedDemande.donnees.nomDefunt} />
                                                        <DetailRow label="Prénom" value={selectedDemande.donnees.prenomDefunt} />
                                                        <DetailRow label="Date Décès" value={formatSimpleDate(selectedDemande.donnees.dateDeces)} />
                                                        <DetailRow label="Lieu Décès" value={selectedDemande.donnees.lieuDeces} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <h6 className="fw-bold text-primary mb-3 text-uppercase small">Le Déclarant</h6>
                                                        <DetailRow label="Nom Déclarant" value={selectedDemande.donnees.nomDeclarant} />
                                                        <DetailRow label="Lien Parenté" value={selectedDemande.donnees.lienParente} />

                                                        <h6 className="fw-bold text-primary mt-4 mb-3 text-uppercase small">Infos Demande</h6>
                                                        <DetailRow label="Type" value="Acte de Décès" />
                                                        <DetailRow label="Soumis le" value={formatDate(selectedDemande.dateDemande)} />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {selectedDemande.statut === 'rejetee' && selectedDemande.motifRejet && (
                                            <div className="alert alert-danger mt-4 rounded-4 border-0 shadow-sm" style={{ borderLeft: '5px solid #dc3545' }}>
                                                <h6 className="fw-bold text-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>Motif du rejet :</h6>
                                                <p className="mb-0 small">{selectedDemande.motifRejet}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer style Maquette */}
                            {!isEditing && (
                                <div className="p-3 bg-light border-top text-center">
                                    <button className="btn btn-secondary px-5 fw-bold" style={{ borderRadius: '4px' }} onClick={() => setSelectedDemande(null)}>
                                        FERMER
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}

// Composant interne pour une ligne de détail style maquette
const DetailRow = ({ label, value, valueColor = '#333' }) => (
    <div className="d-flex mb-2 pb-1" style={{ borderBottom: '1px solid #f1f1f1', alignItems: 'baseline' }}>
        <span className="fw-bold text-dark text-capitalize me-2" style={{ minWidth: '140px', fontSize: '0.8rem', color: '#666' }}>{label}:</span>
        <span style={{ color: valueColor, fontSize: '0.85rem', flex: 1, wordBreak: 'break-word' }}>{value}</span>
    </div>
);
