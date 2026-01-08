import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import authService from '../../services/authService';
import exportHelper from '../../utils/exportHelper';

const AdminUtilisateurs = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        loadUsers();
        const interval = setInterval(loadUsers, 2000);
        return () => clearInterval(interval);
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userService.getAllUsers();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRole = async (user) => {
        const userId = user.id || user._id;
        if (!userId) {
            alert('Erreur: ID utilisateur manquant');
            return;
        }

        if (!window.confirm(`Changer le rôle de ${user.nom} ${user.prenom} en ${user.role === 'admin' ? 'Citoyen' : 'Administrateur'} ?`)) return;

        try {
            setActionLoading(true);
            const newRole = user.role === 'admin' ? 'user' : 'admin';
            await userService.updateRole(userId, newRole);
            await loadUsers();
        } catch (error) {
            alert('Erreur: ' + (error.message || 'Impossible de changer le rôle'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        const userId = user.id || user._id;
        if (!userId) {
            alert('Erreur: ID utilisateur manquant');
            return;
        }

        if (!window.confirm(`Supprimer définitivement l'utilisateur ${user.nom} ${user.prenom} ? Cette action est irréversible.`)) return;

        try {
            setActionLoading(true);
            await userService.deleteUser(userId);
            await loadUsers();
        } catch (error) {
            alert('Erreur: ' + (error.message || 'Impossible de supprimer l\'utilisateur'));
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 p-lg-5 animate__animated animate__fadeIn">
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden mb-5"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' }}>
                <div className="card-body p-5 text-white position-relative">
                    <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                        <div className="col-lg-8">
                            <h1 className="fw-bold mb-3 display-5">Annuaire des Utilisateurs</h1>
                            <p className="text-white-50 mb-0 fs-5">Gérez les comptes citoyens et les privilèges administratifs du système.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-3 rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center border">
                <div className="position-relative w-50">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, prénom ou email..."
                        className="form-control border-0 bg-light rounded-pill ps-5 py-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                </div>
                <div className="d-flex gap-2">
                    <button
                        onClick={handleExport}
                        className="btn btn-outline-success rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                    >
                        <i className="bi bi-file-earmark-excel-fill"></i>
                        Exporter (.xlsx)
                    </button>
                    <button
                        className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                        onClick={() => alert('Fonctionnalité de création manuelle bientôt disponible.')}
                    >
                        <i className="bi bi-person-plus-fill"></i>
                        Ajouter un utilisateur
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden border">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-4 border-0 text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Utilisateur</th>
                                <th className="py-4 border-0 text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>E-mail</th>
                                <th className="py-4 border-0 text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Rôle</th>
                                <th className="py-4 border-0 text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Date d'inscription</th>
                                <th className="px-4 py-4 border-0 text-end text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Chargement...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">Aucun utilisateur trouvé</td>
                                </tr>
                            ) : filteredUsers.map(user => {
                                const userId = user.id || user._id;
                                const currentId = currentUser?.id || currentUser?._id;
                                const isSameUser = userId && currentId && userId === currentId;

                                return (
                                    <tr key={userId || Math.random()} className="border-bottom">
                                        <td className="px-4 py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: '45px', height: '45px' }}>
                                                    {user.nom?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{user.prenom} {user.nom}</div>
                                                    <div className="text-muted small">{user.telephone || 'Aucun téléphone'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-muted">{user.email}</td>
                                        <td className="py-4">
                                            <span className={`badge rounded-pill px-3 py-2 fw-bold ${user.role === 'admin' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-info bg-opacity-10 text-info'}`}>
                                                {user.role === 'admin' ? 'ADMINISTRATEUR' : 'CITOYEN'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-muted small">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    className="btn btn-outline-primary btn-sm rounded-pill p-2 px-3 d-flex align-items-center gap-2"
                                                    title="Changer le rôle"
                                                    onClick={() => handleToggleRole(user)}
                                                    disabled={actionLoading || isSameUser}
                                                >
                                                    <i className="bi bi-shield-lock-fill"></i>
                                                    <small className="fw-bold">RÔLE</small>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm rounded-pill p-2 px-3 d-flex align-items-center gap-2"
                                                    title="Supprimer l' utilisateur"
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={actionLoading || isSameUser}
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                    <small className="fw-bold">SUPPRIMER</small>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUtilisateurs;
