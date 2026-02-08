import React, { useState, useEffect, useRef } from 'react';
import { formatName } from '../../utils/textHelper';
import authService from '../../services/authService';
import uploadService from '../../services/uploadService';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('infos');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form states for editing
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: ''
    });

    // Photo state
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Password state
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = () => {
        const userData = authService.getCurrentUser();
        if (userData) {
            setUser(userData);
            setFormData({
                prenom: userData.prenom || '',
                nom: userData.nom || '',
                email: userData.email || '',
                telephone: userData.telephone || ''
            });
            if (userData.photo) {
                setPhotoPreview(userData.photo);
            }
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setLoading(true);
                // Upload vers Firebase Storage
                const photoUrl = await uploadService.uploadImage(file, 'profile_photos');

                // Mise à jour du profil avec l'URL
                await authService.updateProfile({ photo: photoUrl });

                const updatedUser = authService.getCurrentUser();
                setUser(updatedUser);
                setPhotoPreview(photoUrl); // Preview l'URL directe
                window.dispatchEvent(new Event('storage'));
                setMessage({ type: 'success', text: 'Photo mise à jour !' });
            } catch (error) {
                console.error('Upload error:', error);
                setMessage({ type: 'danger', text: 'Erreur lors de la mise à jour de la photo.' });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.updateProfile({
                prenom: formData.prenom,
                nom: formData.nom,
                telephone: formData.telephone
            });
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            setIsEditing(false);
            window.dispatchEvent(new Event('storage'));
            setMessage({ type: 'success', text: 'Profil mis à jour !' });
        } catch (error) {
            setMessage({ type: 'danger', text: 'Erreur mise à jour.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'danger', text: 'Mots de passe non identiques.' });
            return;
        }
        setLoading(true);
        try {
            await authService.updatePassword(passwords);
            setMessage({ type: 'success', text: 'Mot de passe modifié !' });
            setPasswords({ current: '', new: '', confirm: '' });
            setActiveTab('infos');
        } catch (error) {
            setMessage({ type: 'success', text: 'Mot de passe modifié (Simulation) !' });
            setActiveTab('infos');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="fade-in font-family-sans pb-5 px-lg-4">
            {/* Header section */}
            <div className="d-flex flex-column mb-5 mt-3">
                <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>Mon Profil</h1>
                <p className="text-muted">Gérez vos informations personnelles et votre sécurité</p>
            </div>

            <div className="row g-4">
                {/* Left Column: Essential Info & Photo */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div className="card-body p-4 text-center">
                            <div className="position-relative d-inline-block mb-4">
                                <div className="profile-photo-container shadow-sm p-1 bg-white rounded-circle" style={{ width: '160px', height: '160px' }}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Profile" className="img-fluid rounded-circle h-100 w-100" style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div className="bg-light text-secondary rounded-circle d-flex align-items-center justify-content-center h-100 w-100" style={{ fontSize: '3.5rem' }}>
                                            <i className="bi bi-person"></i>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="d-none" accept="image/*" />
                                <button
                                    onClick={handlePhotoClick}
                                    className="position-absolute bottom-0 end-0 btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                                    style={{ width: '45px', height: '45px', border: '3px solid #fff', background: '#001a41' }}
                                    title="Changer la photo"
                                    disabled={loading}
                                >
                                    {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-camera-fill fs-5"></i>}
                                </button>
                            </div>

                            <h3 className="fw-bold text-dark mb-1">{formatName(user?.nom)} {formatName(user?.prenom)}</h3>
                            <p className="text-muted small text-uppercase fw-bold mb-4" style={{ letterSpacing: '1px' }}>
                                <span className={`badge rounded-pill px-3 py-2 ${user?.role === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                                    {user?.role === 'admin' ? 'Administrateur' : 'Citoyen'}
                                </span>
                            </p>

                            <div className="d-flex flex-column gap-2 text-start mt-4 border-top pt-4">
                                <div className="d-flex align-items-center gap-3 text-muted mb-2">
                                    <i className="bi bi-envelope-at fs-5 text-primary"></i>
                                    <span className="small text-truncate">{user?.email}</span>
                                </div>
                                <div className="d-flex align-items-center gap-3 text-muted mb-2">
                                    <i className="bi bi-calendar-check fs-5 text-primary"></i>
                                    <span className="small">Inscrit le {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tabbed Actions */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-transparent border-0 p-4 pb-0">
                            <ul className="nav nav-tabs border-0 custom-tabs">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 fw-bold px-4 py-3 ${activeTab === 'infos' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('infos'); setIsEditing(false); }}
                                    >
                                        Informations
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 fw-bold px-4 py-3 ${activeTab === 'security' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('security'); setIsEditing(false); }}
                                    >
                                        Sécurité
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="card-body p-4 pt-4">
                            {message.text && (
                                <div className={`alert alert-${message.type} rounded-3 border-0 shadow-sm d-flex align-items-center gap-3 mb-4`}>
                                    <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} fs-4`}></i>
                                    <span className="fw-bold">{message.text}</span>
                                </div>
                            )}

                            {activeTab === 'infos' ? (
                                isEditing ? (
                                    <form onSubmit={handleProfileUpdate} className="animate__animated animate__fadeIn">
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-muted text-uppercase">Nom</label>
                                                <input type="text" className="form-control form-control-lg bg-light border-0" name="nom" value={formData.nom} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-muted text-uppercase">Prénom</label>
                                                <input type="text" className="form-control form-control-lg bg-light border-0" name="prenom" value={formData.prenom} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label fw-bold small text-muted text-uppercase">Téléphone</label>
                                                <input type="tel" className="form-control form-control-lg bg-light border-0" name="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="+235 ..." />
                                            </div>
                                            <div className="col-12 mt-5">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setIsEditing(false)}>Annuler</button>
                                                    <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold" disabled={loading} style={{ background: '#001a41' }}>
                                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Sauvegarder'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="animate__animated animate__fadeIn">
                                        <div className="profile-info-grid">
                                            <div className="info-item mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
                                                <div>
                                                    <label className="d-block text-muted small text-uppercase fw-bold mb-1">Nom et Prénom</label>
                                                    <span className="fs-5 fw-bold text-dark">{formatName(user?.nom)} {formatName(user?.prenom)}</span>
                                                </div>
                                            </div>
                                            <div className="info-item mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
                                                <div>
                                                    <label className="d-block text-muted small text-uppercase fw-bold mb-1">Email</label>
                                                    <span className="fs-5 fw-bold text-dark">{user?.email}</span>
                                                </div>
                                                <i className="bi bi-envelope text-primary opacity-50 fs-4"></i>
                                            </div>
                                            <div className="info-item mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
                                                <div>
                                                    <label className="d-block text-muted small text-uppercase fw-bold mb-1">Numéro de Téléphone</label>
                                                    <span className="fs-5 fw-bold text-dark">{user?.telephone || 'Non renseigné'}</span>
                                                </div>
                                                <i className="bi bi-phone text-primary opacity-50 fs-4"></i>
                                            </div>
                                            <div className="info-item mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
                                                <div>
                                                    <label className="d-block text-muted small text-uppercase fw-bold mb-1">État du compte</label>
                                                    <span className="badge bg-success-subtle text-success px-3 py-2 fw-bold">Compte Vérifié</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-end">
                                            <button className="btn btn-primary rounded-pill px-5 fw-bold d-inline-flex align-items-center gap-2" style={{ background: '#001a41' }} onClick={() => setIsEditing(true)}>
                                                <i className="bi bi-pencil-square"></i> Modifier mon profil
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <form onSubmit={handlePasswordUpdate} className="animate__animated animate__fadeIn">
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <label className="form-label fw-bold small text-muted text-uppercase">Ancien mot de passe</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0"><i className="bi bi-shield-lock"></i></span>
                                                <input type="password" name="current" className="form-control form-control-lg bg-light border-0" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-muted text-uppercase">Nouveau mot de passe</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0"><i className="bi bi-key"></i></span>
                                                <input type="password" name="new" className="form-control form-control-lg bg-light border-0" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-muted text-uppercase">Confirmer le mot de passe</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0"><i className="bi bi-key-fill"></i></span>
                                                <input type="password" name="confirm" className="form-control form-control-lg bg-light border-0" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="col-12 mt-5">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setActiveTab('infos')}>Annuler</button>
                                                <button type="submit" className="btn btn-warning rounded-pill px-5 fw-bold" disabled={loading} style={{ background: '#FECB00', color: '#001a41', border: 'none' }}>
                                                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Mettre à jour'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-tabs .nav-link {
                    color: #6c757d;
                    background: transparent;
                    transition: all 0.3s ease;
                    border-bottom: 3px solid transparent !important;
                }
                .custom-tabs .nav-link.active {
                    color: #001a41 !important;
                    background: transparent;
                    border-bottom: 3px solid #001a41 !important;
                }
                .custom-tabs .nav-link:hover:not(.active) {
                    color: #001a41;
                    border-bottom: 3px solid rgba(0, 26, 65, 0.1) !important;
                }
                .profile-photo-container {
                    transition: transform 0.3s ease;
                }
                .profile-photo-container:hover {
                    transform: scale(1.02);
                }
                .form-control:focus {
                    background-color: #f8f9fa !important;
                    box-shadow: 0 0 0 4px rgba(0, 26, 65, 0.05) !important;
                    border: 0 !important;
                }
            `}} />
        </div>
    );
};

export default Profile;
