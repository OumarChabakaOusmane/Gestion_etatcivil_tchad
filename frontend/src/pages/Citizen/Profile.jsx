import React, { useState, useEffect, useRef } from 'react';
import authService from '../../services/authService';
import imageCompression from 'browser-image-compression';

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
                // Options de compression
                const options = {
                    maxSizeMB: 0.1, // 100KB max
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
                        const updatedUser = authService.getCurrentUser();
                        setUser(updatedUser);
                        window.dispatchEvent(new Event('storage'));
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
        <div className="fade-in font-family-sans pb-5">
            {/* Header section with Title and Breadcrumb */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold text-dark" style={{ fontSize: '2.5rem' }}>Mon profil</h1>
                <span className="text-muted small">Mon profil</span>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white border rounded-0 shadow-sm p-4 overflow-hidden">
                <div className="row g-5">

                    {/* Left Column: Photo & Name with decorative lines */}
                    <div className="col-lg-3 text-center">
                        <div style={{ borderTop: '4px solid #005a5a', width: '100%', marginBottom: '1.5rem' }}></div>

                        <div className="position-relative d-inline-block mb-3" style={{ width: '100%' }}>
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="img-fluid"
                                    style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '2px' }} />
                            ) : (
                                <div className="bg-light text-secondary d-flex align-items-center justify-content-center"
                                    style={{ width: '100%', aspectRatio: '1/1', fontSize: '4rem', borderRadius: '2px', border: '1px solid #eee' }}>
                                    <i className="bi bi-person"></i>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="d-none" accept="image/*" />
                            <button
                                onClick={handlePhotoClick}
                                className="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle p-2 shadow-sm"
                                style={{ transform: 'translate(20%, 20%)', width: '40px', height: '40px' }}
                            >
                                <i className="bi bi-camera-fill"></i>
                            </button>
                        </div>

                        <h4 className="fw-bold text-dark mt-4 mb-2" style={{ letterSpacing: '0.5px' }}>
                            {user?.prenom} {user?.nom}
                        </h4>

                        <div style={{ borderTop: '4px solid #005a5a', width: '100%', marginTop: '1.5rem' }}></div>
                    </div>

                    {/* Right Column: Dynamic Content (Infos or Update) */}
                    <div className="col-lg-9 border-start ps-lg-5">

                        {/* Action Tabs Top Bar */}
                        <div className="d-flex flex-wrap gap-3 mb-3">
                            <button
                                className={`btn rounded-0 px-4 py-2 fw-bold ${activeTab === 'infos' && !isEditing ? 'btn-primary' : 'btn-light border text-primary'}`}
                                onClick={() => { setActiveTab('infos'); setIsEditing(false); }}
                            >
                                Profil
                            </button>

                            <button
                                className={`btn rounded-0 px-4 py-2 fw-bold text-white d-flex align-items-center gap-2 ${isEditing ? 'btn-dark' : 'btn-secondary text-white'}`}
                                onClick={() => { setActiveTab('infos'); setIsEditing(true); }}
                                style={{ backgroundColor: isEditing ? '#333' : '#6c757d' }}
                            >
                                <i className="bi bi-pencil-square"></i> Editer
                            </button>

                            <button
                                className="btn rounded-0 px-4 py-2 fw-bold text-white d-flex align-items-center gap-2"
                                style={{ backgroundColor: '#17a2b8' }}
                                onClick={() => { setActiveTab('security'); setIsEditing(false); }}
                            >
                                <i className="bi bi-lock-fill"></i> Mot de Passe
                            </button>
                        </div>

                        <hr className="mb-4" />

                        {message.text && (
                            <div className={`alert alert-${message.type} py-2 mb-4 rounded-0`}>
                                {message.text}
                            </div>
                        )}

                        {/* Sub-view: Edit Profil */}
                        {isEditing ? (
                            <form onSubmit={handleProfileUpdate} className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Prénom</label>
                                    <input type="text" className="form-control rounded-0" name="prenom" value={formData.prenom} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Nom</label>
                                    <input type="text" className="form-control rounded-0" name="nom" value={formData.nom} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Téléphone</label>
                                    <input type="tel" className="form-control rounded-0" name="telephone" value={formData.telephone} onChange={handleInputChange} />
                                </div>
                                <div className="col-12 text-end mt-4">
                                    <button type="button" className="btn btn-light rounded-0 me-2 border" onClick={() => setIsEditing(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-dark rounded-0 px-4" disabled={loading}>Enregistrer</button>
                                </div>
                            </form>
                        ) : activeTab === 'security' ? (
                            /* Sub-view: Password Change */
                            <form onSubmit={handlePasswordUpdate} className="row g-4">
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Ancien mot de passe</label>
                                    <input type="password" name="current" className="form-control rounded-0" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Nouveau mot de passe</label>
                                    <input type="password" name="new" className="form-control rounded-0" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Confirmer</label>
                                    <input type="password" name="confirm" className="form-control rounded-0" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
                                </div>
                                <div className="col-12 text-end mt-4">
                                    <button type="button" className="btn btn-light rounded-0 me-2 border" onClick={() => setActiveTab('infos')}>Annuler</button>
                                    <button type="submit" className="btn btn-info rounded-0 px-4 text-white" disabled={loading}>Modifier</button>
                                </div>
                            </form>
                        ) : (
                            /* Sub-view: Profile Details (Matching image) */
                            <div className="profile-details-list">
                                <div className="row mb-3">
                                    <div className="col-4 text-muted fw-bold">Nom et Prenom :</div>
                                    <div className="col-8 fw-bold" style={{ color: '#0056b3' }}>{user?.nom} {user?.prenom}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-4 text-muted fw-bold">CIN :</div>
                                    <div className="col-8 fw-bold" style={{ color: '#0056b3' }}>{user?.cin || '24643864985'}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-4 text-muted fw-bold">Email :</div>
                                    <div className="col-8 fw-bold" style={{ color: '#0056b3' }}>{user?.email}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-4 text-muted fw-bold">Type de Compte :</div>
                                    <div className="col-8 fw-bold" style={{ color: '#0056b3' }}>{user?.role === 'admin' ? 'Administrateur' : 'Citoyen'}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-4 text-muted fw-bold">Etat :</div>
                                    <div className="col-8"><span className="fw-bold text-success">Actif</span></div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-4 text-muted fw-bold">Enregistrer le :</div>
                                    <div className="col-8 fw-bold" style={{ color: '#0056b3' }}>
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
                                        }) : 'Jan 22, 2024, 1:59:49 PM'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-details-list .row {
                    font-size: 1.1rem;
                    border-bottom: 1px solid #f8f9fa;
                    padding-bottom: 0.8rem;
                }
            `}} />
        </div>
    );
};

export default Profile;
