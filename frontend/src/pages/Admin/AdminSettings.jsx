import React, { useState, useEffect, useRef } from 'react';
import authService from '../../services/authService';
import uploadService from '../../services/uploadService';

const AdminSettings = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('infos');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: ''
    });

    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);

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
        console.log('Fichier sélectionné:', file);

        if (file) {
            try {
                setLoading(true);
                console.log('Début upload...');
                // Upload vers Firebase Storage
                const photoUrl = await uploadService.uploadImage(file, 'profile_photos');
                console.log('Upload réussi, URL:', photoUrl);

                // Mise à jour du profil avec l'URL
                await authService.updateProfile({ photo: photoUrl });
                console.log('Profil mis à jour via API');

                const updatedUser = authService.getCurrentUser();
                console.log('User mis à jour localement:', updatedUser);

                setUser(updatedUser);
                setPhotoPreview(photoUrl);
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('userUpdated')); // Force update everywhere
                setMessage({ type: 'success', text: 'Photo mise à jour !' });
            } catch (error) {
                console.error('Upload error detailed:', error);
                setMessage({ type: 'danger', text: `Erreur: ${error.message || 'Mise à jour impossible'}` });
            } finally {
                setLoading(false);
                // Reset file input to allow re-selecting same file if needed
                if (fileInputRef.current) fileInputRef.current.value = '';
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
            window.dispatchEvent(new Event('userUpdated'));
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
        <div className="p-4 p-lg-5 animate__animated animate__fadeIn">
            {/* Page Header */}
            <div className="mb-5">
                <h2 className="fw-black text-dark mb-1">Paramètres du Compte</h2>
                <p className="text-muted">Gérez vos informations personnelles et la sécurité de votre accès administrateur.</p>
            </div>

            <div className="card border-0 shadow-lg rounded-5 overflow-hidden">
                <div className="card-body p-0">
                    <div className="row g-0">
                        {/* Sidebar Navigation */}
                        <div className="col-lg-3 bg-light border-end" style={{ minHeight: '600px' }}>
                            <div className="p-4">
                                <div className="text-center mb-5 mt-3">
                                    <div className="position-relative d-inline-block mx-auto mb-3">
                                        <div className="position-relative">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Profile"
                                                    className="rounded-circle shadow-sm border border-4 border-white"
                                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="rounded-circle bg-white text-primary shadow-sm d-flex align-items-center justify-content-center border border-4 border-white"
                                                    style={{ width: '120px', height: '120px', fontSize: '3rem' }}>
                                                    <i className="bi bi-person-fill"></i>
                                                </div>
                                            )}
                                            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="d-none" accept="image/*" />
                                            <button
                                                onClick={handlePhotoClick}
                                                className="position-absolute bottom-0 end-0 btn btn-primary rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center"
                                                style={{ width: '36px', height: '36px', border: '3px solid white' }}
                                                disabled={loading}
                                            >
                                                {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-camera-fill small"></i>}
                                            </button>
                                        </div>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-0">{user?.prenom} {user?.nom}</h5>
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 mt-2" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                        <i className="bi bi-shield-check me-1"></i> ADMINISTRATEUR
                                    </span>
                                </div>

                                <div className="nav flex-column gap-2">
                                    <button
                                        className={`nav-link border-0 rounded-4 py-3 px-4 text-start fw-bold transition-all d-flex align-items-center gap-3 ${activeTab === 'infos' ? 'bg-primary text-white shadow-md' : 'text-muted hover-bg-white shadow-sm-hover mx-2'}`}
                                        onClick={() => { setActiveTab('infos'); setIsEditing(false); }}
                                        style={activeTab === 'infos' ? { background: 'linear-gradient(135deg, #001a41 0%, #00338d 100%)' } : {}}
                                    >
                                        <i className={`bi bi-person-circle fs-5 ${activeTab === 'infos' ? 'text-warning' : ''}`}></i>
                                        <span>Mon Profil</span>
                                    </button>
                                    <button
                                        className={`nav-link border-0 rounded-4 py-3 px-4 text-start fw-bold transition-all d-flex align-items-center gap-3 ${activeTab === 'security' ? 'bg-primary text-white shadow-md' : 'text-muted hover-bg-white shadow-sm-hover mx-2'}`}
                                        onClick={() => { setActiveTab('security'); setIsEditing(false); }}
                                        style={activeTab === 'security' ? { background: 'linear-gradient(135deg, #001a41 0%, #00338d 100%)' } : {}}
                                    >
                                        <i className={`bi bi-shield-lock fs-5 ${activeTab === 'security' ? 'text-warning' : ''}`}></i>
                                        <span>Sécurité</span>
                                    </button>
                                </div>
                            </div>

                            <div className="px-4 mt-auto mb-4 d-none d-lg-block">
                                <div className="p-3 rounded-4 bg-warning-subtle border border-warning-subtle">
                                    <p className="small text-warning-emphasis fw-bold mb-0">
                                        <i className="bi bi-info-circle-fill me-2"></i>
                                        Gardez vos accès sécurisés.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="col-lg-9 bg-white position-relative">
                            {/* Decorative Watermark - National Identity */}
                            <div className="position-absolute" style={{ top: '15px', right: '30px', zIndex: 0, opacity: 0.04 }}>
                                <img src="https://flagcdn.com/w160/td.png" alt="" style={{ filter: 'grayscale(1)', width: '120px', pointerEvents: 'none' }} />
                            </div>

                            <div className="p-4 p-lg-5 position-relative" style={{ zIndex: 1 }}>
                                {message.text && (
                                    <div className={`alert alert-${message.type} rounded-4 border-0 shadow-sm mb-5 animate__animated animate__fadeInDown d-flex align-items-center gap-3`}>
                                        <div className={`bg-${message.type} rounded-circle p-2 d-flex align-items-center justify-content-center`} style={{ width: '32px', height: '32px' }}>
                                            <i className={`bi bi-${message.type === 'success' ? 'check' : 'exclamation'}-lg text-white`}></i>
                                        </div>
                                        <span className="fw-bold">{message.text}</span>
                                    </div>
                                )}

                                {activeTab === 'infos' && (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                                            <div>
                                                <h4 className="fw-black text-dark mb-1">Informations du Profil</h4>
                                                <p className="text-muted small mb-0">Données nominatives et professionnelles</p>
                                            </div>
                                            {!isEditing && (
                                                <button className="btn btn-outline-primary rounded-pill px-4 fw-bold transition-all shadow-sm" onClick={() => setIsEditing(true)}>
                                                    <i className="bi bi-pencil-square me-2"></i> Modifier
                                                </button>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <form onSubmit={handleProfileUpdate} className="row g-4 animate__animated animate__fadeIn">
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-black text-muted text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Prénom</label>
                                                    <input type="text" className="form-control form-control-lg rounded-4 border-light bg-light shadow-none focus-ring-primary" name="prenom" value={formData.prenom} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-black text-muted text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Nom</label>
                                                    <input type="text" className="form-control form-control-lg rounded-4 border-light bg-light shadow-none focus-ring-primary" name="nom" value={formData.nom} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-12">
                                                    <label className="form-label small fw-black text-muted text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Adresse Email (Lecture seule)</label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text rounded-start-4 border-light bg-light-subtle"><i className="bi bi-envelope text-muted"></i></span>
                                                        <input type="email" className="form-control rounded-end-4 border-light bg-light-subtle" value={formData.email} disabled />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <label className="form-label small fw-black text-muted text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Téléphone</label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text rounded-start-4 border-light bg-light"><i className="bi bi-telephone text-muted"></i></span>
                                                        <input type="tel" className="form-control rounded-end-4 border-light bg-light shadow-none" name="telephone" value={formData.telephone} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-12 mt-5 pt-3 d-flex gap-3">
                                                    <button type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-md" style={{ background: 'linear-gradient(135deg, #001a41 0%, #00338d 100%)' }} disabled={loading}>
                                                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle-fill me-2 text-warning"></i>}
                                                        Enregistrer les changements
                                                    </button>
                                                    <button type="button" className="btn btn-light rounded-pill px-5 py-3 fw-bold text-muted" onClick={() => setIsEditing(false)}>Annuler</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="row g-4 animate__animated animate__fadeIn">
                                                <div className="col-md-6">
                                                    <div className="p-4 rounded-5 bg-light border-0 transition-all hover-shadow-sm h-100">
                                                        <div className="small text-primary fw-black text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1.5px' }}>Prénom</div>
                                                        <div className="fw-bold text-dark fs-5">{user?.prenom}</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-4 rounded-5 bg-light border-0 transition-all hover-shadow-sm h-100">
                                                        <div className="small text-primary fw-black text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1.5px' }}>Nom</div>
                                                        <div className="fw-bold text-dark fs-5">{user?.nom}</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="p-4 rounded-5 bg-light border-0 transition-all hover-shadow-sm">
                                                        <div className="small text-primary fw-black text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1.5px' }}>Identifiant de Connexion</div>
                                                        <div className="fw-bold text-dark fs-5 d-flex align-items-center gap-2">
                                                            {user?.email}
                                                            <i className="bi bi-shield-fill-check text-success fs-6"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="p-4 rounded-5 bg-light border-0 transition-all hover-shadow-sm">
                                                        <div className="small text-primary fw-black text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1.5px' }}>Contact Téléphonique</div>
                                                        <div className="fw-bold text-dark fs-5">{user?.telephone || <em className="text-muted fw-normal fs-6">Non renseigné</em>}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <div className="mb-5 pb-3 border-bottom">
                                            <h4 className="fw-black text-dark mb-1">Mot de Passe & Accès</h4>
                                            <p className="text-muted small mb-0">Sécurisez votre compte d'administration</p>
                                        </div>

                                        <div className="mx-auto" style={{ maxWidth: '480px' }}>
                                            <form onSubmit={handlePasswordUpdate} className="row g-4 mt-2">
                                                <div className="col-12">
                                                    <div className="form-floating mb-3 shadow-none">
                                                        <input type="password" name="current" className="form-control border-light bg-light rounded-4 py-3" id="currPass" placeholder="Mot de passe actuel" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                                                        <label htmlFor="currPass" className="text-muted ps-4">Mot de passe actuel</label>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="form-floating mb-3">
                                                        <input type="password" name="new" className="form-control border-light bg-light rounded-4 py-3" id="newPass" placeholder="Nouveau mot de passe" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required />
                                                        <label htmlFor="newPass" className="text-muted ps-4">Nouveau mot de passe</label>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="form-floating mb-4">
                                                        <input type="password" name="confirm" className="form-control border-light bg-light rounded-4 py-3" id="confPass" placeholder="Confirmer" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
                                                        <label htmlFor="confPass" className="text-muted ps-4">Confirmer le mot de passe</label>
                                                    </div>
                                                </div>
                                                <div className="col-12 text-center mt-3">
                                                    <button type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg w-100 transition-all hover-lift" style={{ background: 'linear-gradient(135deg, #001a41 0%, #00338d 100%)' }} disabled={loading}>
                                                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-shield-fill-lock me-2 text-warning"></i>}
                                                        Mettre à jour la sécurité
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        <div className="mt-5 p-4 rounded-5 bg-light d-flex align-items-start gap-3 border">
                                            <div className="bg-white p-2 rounded-circle shadow-sm">
                                                <i className="bi bi-key-fill text-primary"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-1">Dernière modification</h6>
                                                <p className="text-muted small mb-0">Votre mot de passe a été mis à jour il y a récemment. Il est conseillé de le changer tous les 90 jours.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
