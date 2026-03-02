import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

/**
 * Page de changement de mot de passe forcé
 * S'affiche lors de la 1ère connexion avec le mot de passe par défaut (123456)
 */
export default function ChangePassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Vérifier que l'utilisateur doit bien changer son mot de passe
    useEffect(() => {
        const user = authService.getCurrentUser();
        const mustChange = authService.mustChangePassword();
        if (!user || !mustChange) {
            // Rediriger si pas besoin de changer
            const dest = authService.hasAdminAccess() ? '/admin/dashboard' : '/dashboard';
            navigate(dest, { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword.length < 6) {
            return setError('Le mot de passe doit contenir au moins 6 caractères.');
        }
        if (formData.newPassword !== formData.confirmPassword) {
            return setError('Les mots de passe ne correspondent pas.');
        }
        if (formData.newPassword === '123456') {
            return setError('Vous ne pouvez pas conserver le mot de passe par défaut.');
        }

        setLoading(true);
        try {
            await authService.updatePassword({
                current: '123456',
                new: formData.newPassword
            });

            // ✅ Effacer le flag de changement forcé
            localStorage.removeItem('mustChangePassword');

            // Mettre à jour le user en localStorage
            const user = authService.getCurrentUser();
            if (user) {
                const updatedUser = { ...user, mustChangePassword: false };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            // Rediriger vers le bon dashboard
            const dest = authService.hasAdminAccess() ? '/admin/dashboard' : '/dashboard';
            window.location.href = dest;

        } catch (err) {
            setError(err?.message || 'Erreur lors du changement de mot de passe.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #001a41 0%, #00338d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '48px 40px',
                width: '100%',
                maxWidth: '440px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }}>
                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        fontSize: '2rem'
                    }}>🔑</div>
                    <h2 style={{ margin: 0, fontWeight: 800, color: '#1a1a2e', fontSize: '1.5rem' }}>
                        Changement de mot de passe
                    </h2>
                    <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        Pour votre sécurité, veuillez définir un nouveau mot de passe personnel.
                    </p>
                </div>

                {/* Alerte mot de passe par défaut */}
                <div style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '1rem', marginTop: '2px' }}>⚠️</span>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
                        Votre mot de passe actuel est <strong>123456</strong> (par défaut).
                        Vous devez le modifier avant de continuer.
                    </p>
                </div>

                {/* Erreur */}
                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        color: '#dc2626',
                        fontSize: '0.88rem'
                    }}>
                        ❌ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Nouveau mot de passe */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}>
                            Nouveau mot de passe
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                placeholder="Minimum 6 caractères"
                                required
                                autoComplete="new-password"
                                style={{
                                    width: '100%',
                                    padding: '14px 48px 14px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#00205b'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem' }}
                            >
                                {showNew ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* Confirmer */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}>
                            Confirmer le mot de passe
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Répétez le mot de passe"
                                required
                                autoComplete="new-password"
                                style={{
                                    width: '100%',
                                    padding: '14px 48px 14px 16px',
                                    border: `2px solid ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#00205b'}
                                onBlur={e => {
                                    if (formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
                                        e.target.style.borderColor = '#ef4444';
                                    } else {
                                        e.target.style.borderColor = '#e5e7eb';
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem' }}
                            >
                                {showConfirm ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>Les mots de passe ne correspondent pas</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #00205b, #00338d)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            letterSpacing: '0.3px'
                        }}
                    >
                        {loading ? '⏳ Modification en cours...' : '✅ Définir mon nouveau mot de passe'}
                    </button>
                </form>
            </div>
        </div>
    );
}
