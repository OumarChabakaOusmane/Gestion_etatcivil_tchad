import React, { useState, useEffect } from 'react';
import { formatName } from '../../utils/textHelper';
import userService from '../../services/userService';
import authService from '../../services/authService';
import exportHelper from '../../utils/exportHelper';

const AdminUtilisateurs = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const currentUser = authService.getCurrentUser();

    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        loadUsers();
        const interval = setInterval(loadUsers, 30000); // Reload every 30s for better performance
        return () => clearInterval(interval);
    }, []);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const loadUsers = async () => {
        try {
            const response = await userService.getAllUsers();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
        } finally {
            if (loading) setLoading(false);
        }
    };

    const handleToggleRole = async (user) => {
        const userId = user.id || user._id;

        let newRole = 'user';
        if (user.role === 'user') newRole = 'agent';
        else if (user.role === 'agent') newRole = 'admin';
        else newRole = 'user';

        if (!window.confirm(`Changer le rôle de ${formatName(user.nom)} ${formatName(user.prenom)} de ${user.role} à ${newRole} ?`)) return;

        try {
            setActionLoading(true);
            await userService.updateRole(userId, newRole);
            showToast(`Rôle mis à jour: ${newRole.toUpperCase()}`);
            await loadUsers();
        } catch (error) {
            showToast(error.message || 'Action impossible', 'danger');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        const userId = user.id || user._id;
        if (!window.confirm(`Supprimer définitivement l'utilisateur ${formatName(user.nom)} ${formatName(user.prenom)} ? Cette action est irréversible.`)) return;

        try {
            setActionLoading(true);
            await userService.deleteUser(userId);
            showToast('Utilisateur supprimé');
            await loadUsers();
        } catch (error) {
            showToast(error.message || 'Action impossible', 'danger');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExport = () => {
        const dataToExport = exportHelper.formatUsersForExport(users);
        exportHelper.exportToExcel(dataToExport, 'Annuaire_Utilisateurs', 'Utilisateurs');
        showToast('Export réussi');
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            await userService.createUser(newUser);
            showToast('Utilisateur créé avec succès');
            setShowModal(false);
            setNewUser({ nom: '', prenom: '', email: '', telephone: '', password: '', role: 'user' });
            await loadUsers();
        } catch (error) {
            showToast(error.message || 'Erreur lors de la création', 'danger');
        } finally {
            setActionLoading(false);
        }
    };


    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || u.role === filterRole;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="p-4 p-lg-5 animate__animated animate__fadeIn">
            {/* Header Hero Section */}
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden mb-5"
                style={{ background: 'linear-gradient(135deg, #001a41 0%, #00338d 100%)' }}>
                <div className="card-body p-5 text-white position-relative">
                    <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                        <div className="col-lg-8">
                            <h1 className="fw-bold mb-2 display-6">Annuaire des Utilisateurs</h1>
                            <p className="text-white opacity-50 mb-0 fs-5">Gestion centralisée des citoyens et de l'administration.</p>
                        </div>
                        <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                            <div className="d-inline-flex flex-column align-items-lg-end">
                                <span className="fs-2 fw-bold">{users.length}</span>
                                <span className="text-uppercase small opacity-50 fw-bold tracking-wider">Membres inscrits</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {notification && (
                <div className={`alert alert-${notification.type} border-0 shadow-sm rounded-4 mb-4 fade show animate__animated animate__slideInDown`}>
                    <div className="d-flex align-items-center gap-2 fw-bold">
                        <i className={`bi bi-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}-fill`}></i>
                        {notification.message}
                    </div>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-3 rounded-4 shadow-sm mb-4 d-flex flex-wrap gap-3 justify-content-between align-items-center border border-light">
                <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email..."
                        className="form-control border-0 bg-light rounded-pill ps-5 py-2 fw-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                </div>

                <div className="d-flex gap-2">
                    <select
                        className="form-select rounded-pill border-light bg-light shadow-none px-4"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="all">Tous les rôles</option>
                        <option value="user">Citoyens</option>
                        <option value="agent">Agents</option>
                        <option value="admin">Administrateurs</option>
                    </select>
                </div>

                <div className="ms-auto d-flex gap-2">
                    <button onClick={handleExport} className="btn btn-outline-success rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 transition-all">
                        <i className="bi bi-file-earmark-excel-fill"></i> Exporter
                    </button>
                    <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 transition-all"
                        style={{ backgroundColor: '#001a41', border: 'none' }}
                        onClick={() => setShowModal(true)}>
                        <i className="bi bi-person-plus-fill"></i> Ajouter
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden border border-light">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="border-bottom text-secondary fw-bold text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                                <th className="px-4 py-4">Identification</th>
                                <th className="py-4">Coordonnées</th>
                                <th className="py-4">Rôle & Privilèges</th>
                                <th className="py-4">Arrivée</th>
                                <th className="px-4 py-4 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="spinner-grow text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted fw-medium">Aucun membre ne correspond à votre recherche.</td>
                                </tr>
                            ) : filteredUsers.map(user => {
                                const userId = user.id || user._id;
                                const isMe = (currentUser?.id === userId || currentUser?._id === userId);

                                return (
                                    <tr key={userId} className="border-bottom transition-all">
                                        <td className="px-4 py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="position-relative">
                                                    {user.photo ? (
                                                        <img src={user.photo} alt="Avatar" className="rounded-circle border border-2 border-white shadow-sm" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="bg-primary-soft text-primary rounded-circle d-flex align-items-center justify-content-center fw-black shadow-sm" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                                                            {user.prenom?.[0]}{user.nom?.[0]}
                                                        </div>
                                                    )}
                                                    {isMe && <div className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle" style={{ width: '12px', height: '12px' }}></div>}
                                                </div>
                                                <div>
                                                    <div className="fw-black text-dark" style={{ fontSize: '1rem', letterSpacing: '-0.2px' }}>
                                                        {formatName(user.prenom, user.nom)}
                                                        {isMe && <span className="badge bg-secondary-soft text-secondary ms-2 small fw-bold px-2 py-1" style={{ fontSize: '0.65rem' }}>VOUS</span>}
                                                    </div>
                                                    <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>ID: {userId?.slice(-8).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="d-flex flex-column gap-1">
                                                <span className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                        <i className="bi bi-envelope-fill text-primary" style={{ fontSize: '0.75rem' }}></i>
                                                    </div>
                                                    {user.email}
                                                </span>
                                                <span className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                                                    <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                        <i className="bi bi-telephone-fill text-success" style={{ fontSize: '0.75rem' }}></i>
                                                    </div>
                                                    {user.telephone || 'Non renseigné'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`badge rounded-pill px-3 py-2 fw-bold tracking-wider ${user.role === 'admin' ? 'bg-warning-soft text-warning' :
                                                user.role === 'agent' ? 'bg-success-soft text-success' :
                                                    'bg-primary-soft text-primary'
                                                }`} style={{ fontSize: '0.75rem' }}>
                                                {user.role === 'admin' ? 'ADMINISTRATEUR' : user.role === 'agent' ? 'AGENT MAIRIE' : 'CITOYEN'}
                                            </span>
                                        </td>
                                        <td className="py-4 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Indéfinie'}
                                        </td>
                                        <td className="px-4 py-4 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${user.role === 'admin' ? 'btn-outline-dark' :
                                                        user.role === 'agent' ? 'btn-outline-success' : 'btn-outline-warning'
                                                        }`}
                                                    onClick={() => handleToggleRole(user)}
                                                    disabled={actionLoading || isMe}
                                                >
                                                    <i className={`bi bi-shield-${user.role === 'user' ? 'check' : 'lock'} me-1`}></i>
                                                    {user.role === 'user' ? 'Promouvoir' : 'Changer Rôle'}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold transition-all shadow-hover"
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={actionLoading || isMe}
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
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

            {/* Modal Ajout Utilisateur */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Nouveau Compte</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleCreateUser}>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <input type="text" className="form-control rounded-3 py-2" placeholder="Nom"
                                                value={newUser.nom} onChange={e => setNewUser({ ...newUser, nom: e.target.value })} required />
                                        </div>
                                        <div className="col-6">
                                            <input type="text" className="form-control rounded-3 py-2" placeholder="Prénom"
                                                value={newUser.prenom} onChange={e => setNewUser({ ...newUser, prenom: e.target.value })} required />
                                        </div>
                                        <div className="col-12">
                                            <input type="email" className="form-control rounded-3 py-2" placeholder="Email"
                                                value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                        </div>
                                        <div className="col-6">
                                            <input type="tel" className="form-control rounded-3 py-2" placeholder="Téléphone"
                                                value={newUser.telephone} onChange={e => setNewUser({ ...newUser, telephone: e.target.value })} />
                                        </div>
                                        <div className="col-6">
                                            <select className="form-select rounded-3 py-2"
                                                value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                                <option value="user">Citoyen</option>
                                                <option value="agent">Agent Mairie</option>
                                                <option value="admin">Administrateur</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <input type="password" className="form-control rounded-3 py-2" placeholder="Mot de passe"
                                                value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                                        </div>
                                        <div className="col-12 mt-4">
                                            <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold" disabled={actionLoading}>
                                                {actionLoading ? 'Création...' : 'Créer le compte'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-primary-soft { background: rgba(0, 26, 65, 0.1); }
                .bg-warning-soft { background: rgba(254, 203, 0, 0.15); }
                .bg-secondary-soft { background: rgba(108, 117, 125, 0.15); }
                
                .tracking-wider { letter-spacing: 0.5px; }
                .shadow-hover:hover { box-shadow: 0 5px 15px rgba(220, 53, 69, 0.2) !important; }
                
                .table-hover tbody tr:hover {
                    background-color: rgba(0, 26, 65, 0.01) !important;
                    transform: scale(1.002);
                }
                
                .btn-outline-warning { 
                    color: #856404; 
                    border-color: #ffeeba;
                }
                .btn-outline-warning:hover {
                    background-color: #FECB00;
                    border-color: #FECB00;
                    color: #000;
                }
            `}} />
        </div >
    );
};

export default AdminUtilisateurs;
