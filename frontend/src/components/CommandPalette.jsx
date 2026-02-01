import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState({ users: [], demandes: [], actes: [] });
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setSearchText('');
            setResults({ users: [], demandes: [], actes: [] });
        }
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchText.length >= 2) {
                setLoading(true);
                try {
                    const res = await api.get(`/search?q=${searchText}`);
                    if (res.data.success) {
                        setResults(res.data.data);
                    }
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults({ users: [], demandes: [], actes: [] });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchText]);

    const handleSelect = (type, item) => {
        setIsOpen(false);
        switch (type) {
            case 'user':
                navigate('/admin/utilisateurs');
                break;
            case 'demande':
                navigate('/admin/demandes');
                break;
            case 'acte':
                navigate('/admin/demandes'); // Ou une page spécifique si elle existe
                break;
            default:
                break;
        }
    };

    return (
        <div
            className={`command-palette-overlay ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
            style={{
                display: 'flex',
                visibility: isOpen ? 'visible' : 'hidden',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transition: 'opacity 0.2s ease, visibility 0.2s ease'
            }}
        >
            <div
                className={`command-palette-content animate__animated ${isOpen ? 'animate__fadeInDown' : 'animate__fadeOutUp'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="search-bar">
                    <i className="bi bi-search"></i>
                    <input
                        ref={inputRef}
                        autoFocus
                        type="text"
                        placeholder="Rechercher un citoyen, une demande, un acte... (Esc pour quitter)"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {loading && <div className="spinner-border spinner-border-sm text-primary"></div>}
                </div>

                <div className="results-container custom-scrollbar">
                    {/* ... rest of existing results rendering ... */}
                    {!searchText && (
                        <div className="search-hint">
                            <p>Tapez au moins 2 caractères pour rechercher</p>
                            <div className="shortcuts-hint">
                                <span><kbd>↑</kbd><kbd>↓</kbd> Naviguer</span>
                                <span><kbd>Enter</kbd> Sélectionner</span>
                            </div>
                        </div>
                    )}

                    {searchText && !loading && results.users.length === 0 && results.demandes.length === 0 && results.actes.length === 0 && (
                        <div className="no-results">Aucun résultat trouvé pour "{searchText}"</div>
                    )}

                    {/* Citoyens */}
                    {results.users.length > 0 && (
                        <div className="result-section">
                            <h3><i className="bi bi-people"></i> Citoyens</h3>
                            {results.users.map(user => (
                                <div key={user.id || user._id} className="result-item" onClick={() => handleSelect('user', user)}>
                                    {/* Changed handleSelect call */}
                                    <div className="result-icon"><i className="bi bi-person"></i></div>
                                    <div className="result-info">
                                        <div className="result-title">{user.prenom} {user.nom}</div>
                                        <div className="result-subtitle">{user.email} • {user.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Demandes */}
                    {results.demandes.length > 0 && (
                        <div className="result-section">
                            <h3><i className="bi bi-file-earmark-text"></i> Demandes</h3>
                            {results.demandes.map(demande => (
                                <div key={demande.id || demande._id} className="result-item" onClick={() => handleSelect('demande', demande)}>
                                    {/* Changed handleSelect call */}
                                    <div className="result-icon"><i className="bi bi-card-list"></i></div>
                                    <div className="result-info">
                                        <div className="result-title">Demande de {demande.type}</div>
                                        <div className="result-subtitle">ID: {demande.id.slice(-8).toUpperCase()} • Statut: {demande.statut}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actes */}
                    {results.actes.length > 0 && (
                        <div className="result-section">
                            <h3><i className="bi bi-patch-check"></i> Actes</h3>
                            {results.actes.map(acte => (
                                <div key={acte.id || acte._id} className="result-item" onClick={() => handleSelect('acte', acte)}>
                                    {/* Changed handleSelect call */}
                                    <div className="result-icon"><i className="bi bi-file-earmark-pdf"></i></div>
                                    <div className="result-info">
                                        <div className="result-title">{acte.label}</div>
                                        <div className="result-subtitle">N° {acte.numero || 'Non assigné'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .command-palette-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    padding-top: 10vh;
                }
                .command-palette-content {
                    width: 100%;
                    max-width: 650px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 70px rgba(0,0,0,0.3);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    max-height: 70vh;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid #eee;
                    gap: 15px;
                }
                .search-bar i {
                    font-size: 20px;
                    color: #aaa;
                }
                .search-bar input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 18px;
                    color: #333;
                }
                .results-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 0;
                }
                .result-section h3 {
                    font-size: 12px;
                    text-transform: uppercase;
                    color: #888;
                    padding: 10px 20px 5px;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .result-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 20px;
                    gap: 15px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .result-item:hover {
                    background: #f8f9fa;
                }
                .result-icon {
                    width: 35px;
                    height: 35px;
                    background: #f0f7ff;
                    color: #007bff;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .result-title {
                    font-weight: 600;
                    color: #333;
                    font-size: 14px;
                }
                .result-subtitle {
                    font-size: 12px;
                    color: #777;
                }
                .search-hint, .no-results {
                    padding: 40px 20px;
                    text-align: center;
                    font-size: 14px;
                }
                .search-footer {
                    padding: 12px 20px;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .footer-keys {
                    display: flex;
                    gap: 15px;
                    font-size: 11px;
                    color: #64748b;
                }
                .footer-keys kbd {
                    background: #fff;
                    padding: 1px 4px;
                    border: 1px solid #e2e8f0;
                    border-radius: 3px;
                }
                .footer-brand {
                    font-size: 11px;
                    font-weight: 600;
                    color: #cbd5e1;
                }
            `}} />
        </div>
    );
};

export default CommandPalette;
