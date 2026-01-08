import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FamilyCenter = () => {
    const [familyMembers, setFamilyMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newMember, setNewMember] = useState({
        prenom: '',
        nom: '',
        lien: 'enfant',
        dateNaissance: ''
    });

    useEffect(() => {
        const savedMembers = localStorage.getItem('family_members');
        if (savedMembers) {
            setFamilyMembers(JSON.parse(savedMembers));
        } else {
            // Data de démonstration pour le PFE
            const demoData = [
                { id: 1, prenom: 'Moussa', nom: 'Oumar', lien: 'enfant', dateNaissance: '2020-05-12' },
                { id: 2, prenom: 'Fatima', nom: 'Oumar', lien: 'enfant', dateNaissance: '2022-11-30' }
            ];
            setFamilyMembers(demoData);
            localStorage.setItem('family_members', JSON.stringify(demoData));
        }
    }, []);

    const handleAddMember = (e) => {
        e.preventDefault();
        const memberToAdd = {
            ...newMember,
            id: Date.now()
        };
        const updatedList = [...familyMembers, memberToAdd];
        setFamilyMembers(updatedList);
        localStorage.setItem('family_members', JSON.stringify(updatedList));
        setShowModal(false);
        setNewMember({ prenom: '', nom: '', lien: 'enfant', dateNaissance: '' });
    };

    const removeMember = (id) => {
        if (window.confirm('Supprimer ce membre de votre liste ?')) {
            const updatedList = familyMembers.filter(m => m.id !== id);
            setFamilyMembers(updatedList);
            localStorage.setItem('family_members', JSON.stringify(updatedList));
        }
    };

    return (
        <div className="fade-in">
            <div className="dashboard-header-simple py-2 mb-4">
                <div>
                    <h1 className="user-welcome-text mb-1">Espace Famille</h1>
                    <p className="text-muted mb-0 small">Gérez les dossiers administratifs de vos proches</p>
                </div>
                <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-person-plus-fill me-2"></i> Ajouter un membre
                </button>
            </div>

            <div className="row g-4">
                {familyMembers.length > 0 ? (
                    familyMembers.map(member => (
                        <div className="col-md-6 col-lg-4" key={member.id}>
                            <div className="modern-table-card p-4 hover-translate transition-all">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                        <i className="bi bi-person-heart fs-3"></i>
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0">{member.prenom} {member.nom}</h5>
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary text-capitalize small">
                                            {member.lien}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4 small text-muted">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Né(e) le:</span>
                                        <span className="fw-bold text-dark">{new Date(member.dateNaissance).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Dossiers:</span>
                                        <span className="fw-bold text-primary">1 acte de naissance</span>
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <button className="btn btn-light btn-sm flex-grow-1 border rounded-pill py-2 small fw-bold">
                                        Détails
                                    </button>
                                    <button
                                        className="btn btn-outline-danger btn-sm rounded-circle p-2"
                                        onClick={() => removeMember(member.id)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="modern-table-card py-5">
                            <i className="bi bi-people text-muted opacity-25" style={{ fontSize: '5rem' }}></i>
                            <h4 className="mt-4 fw-bold">Votre cercle familial est vide</h4>
                            <p className="text-muted">Ajoutez vos proches pour simplifier leurs démarches administratives.</p>
                            <button className="btn btn-primary rounded-pill px-5 mt-3" onClick={() => setShowModal(true)}>
                                Ajouter mon premier proche
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Ajout Membre */}
            {showModal && (
                <div className="custom-modal-backdrop d-flex align-items-center justify-content-center" style={{ zIndex: 1060 }}>
                    <div className="modern-table-card p-0 overflow-hidden shadow-lg border-0 fade-in" style={{ width: '95%', maxWidth: '500px' }}>
                        <div className="bg-primary text-white p-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Nouveau membre de la famille</h5>
                            <button className="btn btn-link text-white p-0" onClick={() => setShowModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form className="p-4" onSubmit={handleAddMember}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Prénom</label>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 py-2"
                                        required
                                        value={newMember.prenom}
                                        onChange={e => setNewMember({ ...newMember, prenom: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Nom</label>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 py-2"
                                        required
                                        value={newMember.nom}
                                        onChange={e => setNewMember({ ...newMember, nom: e.target.value })}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">Lien de parenté</label>
                                    <select
                                        className="form-select bg-light border-0 py-2"
                                        value={newMember.lien}
                                        onChange={e => setNewMember({ ...newMember, lien: e.target.value })}
                                    >
                                        <option value="enfant">Enfant</option>
                                        <option value="conjoint">Conjoint(e)</option>
                                        <option value="parent">Parent</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">Date de naissance</label>
                                    <input
                                        type="date"
                                        className="form-control bg-light border-0 py-2"
                                        required
                                        value={newMember.dateNaissance}
                                        onChange={e => setNewMember({ ...newMember, dateNaissance: e.target.value })}
                                    />
                                </div>
                                <div className="col-12 mt-4 text-center">
                                    <button type="submit" className="btn btn-primary rounded-pill px-5 py-2 fw-bold">
                                        Enregistrer le membre
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyCenter;
