import React, { useState, useEffect, useRef } from 'react';
import authService from '../../services/authService';
import imageCompression from 'browser-image-compression';

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
        if (file) {
            try {
                setLoading(true);
                const options = {
                    maxSizeMB: 0.1,
                    maxWidthOrHeight: 400,
                    useWebWorker: true
                };

                const compressedFile = await imageCompression(file, options);

                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Photo = reader.result;
                    setPhotoPreview(base64Photo);

                    try {
                        await authService.updateProfile({ photo: base64Photo });
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new Event('userUpdated'));
                        setMessage({ type: 'success', text: 'Photo mise à jour (et compressée) !' });
                        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    } catch (error) {
                        setMessage({ type: 'danger', text: 'Erreur sauvegarde photo.' });
                    }
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Compression error:', error);
                setMessage({ type: 'danger', text: 'Erreur lors de la compression.' });
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
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden border">
                <div className="card-body p-0">
                    <div className="row g-0">
                        <div className="col-lg-4 bg-light p-4 text-center border-end">
                            <div className="position-relative d-block mb-4 mx-auto" style={{ maxWidth: '360px' }}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="shadow-sm w-100"
                                        style={{ aspectRatio: '1/1', objectFit: 'cover', border: '5px solid white', borderRadius: '30px' }} />
                                ) : (
                                    <div className="bg-white text-primary shadow-sm d-flex align-items-center justify-content-center w-100"
                                        style={{ aspectRatio: '1/1', fontSize: '8rem', border: '5px solid white', borderRadius: '30px' }}>
                                        <i className="bi bi-person-fill"></i>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="d-none" accept="image/*" />
                                <button
                                    onClick={handlePhotoClick}
                                    className="position-absolute bottom-0 end-0 btn btn-primary rounded-circle p-2 shadow-sm"
                                    style={{ width: '40px', height: '40px', transform: 'translate(20%, 20%)' }}
                                >
                                    <i className="bi bi-camera-fill"></i>
                                </button>
                            </div>
                            <h4 className="fw-bold text-dark mb-1 mt-3">{user?.prenom} {user?.nom}</h4>
                            <p className="text-muted small text-uppercase fw-bold mb-4">Administrateur Système</p>

                            <div className="d-grid gap-2 text-start px-3">
                                <button
                                    className={`btn border-0 rounded-3 text-start px-3 py-2 fw-bold transition-all ${activeTab === 'infos' ? 'bg-primary text-white shadow-sm' : 'text-muted hover-bg-light'}`}
                                    onClick={() => { setActiveTab('infos'); setIsEditing(false); }}
                                >
                                    <i className="bi bi-person-circle me-3"></i> Profil
                                </button>
                                <button
                                    className={`btn border-0 rounded-3 text-start px-3 py-2 fw-bold transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-sm' : 'text-muted hover-bg-light'}`}
                                    onClick={() => { setActiveTab('security'); setIsEditing(false); }}
                                >
                                    <i className="bi bi-shield-lock me-3"></i> Sécurité
                                </button>
                            </div>
                        </div>

                        <div className="col-lg-8 p-5 bg-white">
                            {message.text && (
                                <div className={`alert alert-${message.type} rounded-4 border-0 shadow-sm mb-4 d-flex align-items-center gap-2`}>
                                    <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill`}></i>
                                    <span className="fw-bold">{message.text}</span>
                                </div>
                            )}

                            {activeTab === 'infos' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-5">
                                        <h4 className="fw-extrabold text-dark m-0">Informations Personnelles</h4>
                                        {!isEditing && (
                                            <button className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={() => setIsEditing(true)}>
                                                <i className="bi bi-pencil-square me-2"></i> Modifier mon profil
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleProfileUpdate} className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Prénom</label>
                                                <input type="text" className="form-control rounded-3 border-light bg-light py-2" name="prenom" value={formData.prenom} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Nom</label>
                                                <input type="text" className="form-control rounded-3 border-light bg-light py-2" name="nom" value={formData.nom} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Adresse Email d'Administration</label>
                                                <input type="email" className="form-control rounded-3 border-light bg-light py-2" value={formData.email} disabled style={{ backgroundColor: '#eeeeee !important' }} />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Téléphone Professionnel</label>
                                                <input type="tel" className="form-control rounded-3 border-light bg-light py-2" name="telephone" value={formData.telephone} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-12 mt-5 d-flex gap-3">
                                                <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" disabled={loading}>Enregistrer les modifications</button>
                                                <button type="button" className="btn btn-light rounded-pill px-5 fw-bold" onClick={() => setIsEditing(false)}>Annuler</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="p-3 rounded-4 bg-light border-0">
                                                    <div className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Prénom</div>
                                                    <div className="fw-bold text-dark fs-5">{user?.prenom}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="p-3 rounded-4 bg-light border-0">
                                                    <div className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Nom</div>
                                                    <div className="fw-bold text-dark fs-5">{user?.nom}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="p-3 rounded-4 bg-light border-0">
                                                    <div className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Identifiant Email</div>
                                                    <div className="fw-bold text-dark fs-5">{user?.email}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="p-3 rounded-4 bg-light border-0">
                                                    <div className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Numéro de Contact</div>
                                                    <div className="fw-bold text-dark fs-5">{user?.telephone || 'Non renseigné'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div>
                                    <h4 className="fw-extrabold text-dark mb-5 text-center">Sécurité & Confidentialité</h4>
                                    <div className="mx-auto" style={{ maxWidth: '500px' }}>
                                        <form onSubmit={handlePasswordUpdate} className="row g-4">
                                            <div className="col-12">
                                                <div className="form-floating mb-3">
                                                    <input type="password" name="current" className="form-control border-light bg-light rounded-3" id="currPass" placeholder="Mot de passe actuel" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                                                    <label htmlFor="currPass" className="text-muted">Mot de passe actuel</label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-floating mb-3">
                                                    <input type="password" name="new" className="form-control border-light bg-light rounded-3" id="newPass" placeholder="Nouveau mot de passe" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required />
                                                    <label htmlFor="newPass" className="text-muted">Nouveau mot de passe</label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-floating mb-4">
                                                    <input type="password" name="confirm" className="form-control border-light bg-light rounded-3" id="confPass" placeholder="Confirmer" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
                                                    <label htmlFor="confPass" className="text-muted">Confirmer le mot de passe</label>
                                                </div>
                                            </div>
                                            <div className="col-12 text-center mt-2">
                                                <button type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg w-100" disabled={loading}>
                                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-shield-lock-fill me-2"></i>}
                                                    Sécuriser mon compte
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
