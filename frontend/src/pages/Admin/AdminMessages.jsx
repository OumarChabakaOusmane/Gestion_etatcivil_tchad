import React, { useState, useEffect } from 'react';
import contactService from '../../services/contactService';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const loadMessages = async () => {
        try {
            const response = await contactService.getAllMessages();
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement messages:', error);
        } finally {
            if (loading) setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSendingReply(true);
        setStatusMsg({ text: '', type: '' });

        try {
            const res = await contactService.replyToMessage(selectedMessage.id || selectedMessage._id, replyText);
            if (res.success) {
                setStatusMsg({ text: 'Réponse envoyée avec succès !', type: 'success' });
                setReplyText('');
                // Small delay before clearing message
                setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
            }
        } catch (error) {
            setStatusMsg({ text: error.message || "Erreur lors de l'envoi", type: 'danger' });
        } finally {
            setSendingReply(false);
        }
    };

    const filteredMessages = messages.filter(m =>
        m.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.sujet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 p-lg-5">
            {/* Header Hero Section */}
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden mb-5"
                style={{ background: 'linear-gradient(135deg, #202885 0%, #151a5c 100%)' }}>
                <div className="card-body p-5 text-white position-relative">
                    <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                        <div className="col-lg-8">
                            <h1 className="fw-bold mb-2 display-6">Messagerie Citoyenne</h1>
                            <p className="text-white opacity-50 mb-0 fs-5">Consultez et gérez les demandes d'assistance des visiteurs.</p>
                        </div>
                        <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                            <div className="d-inline-flex flex-column align-items-lg-end">
                                <span className="fs-2 fw-bold">{messages.length}</span>
                                <span className="text-uppercase small opacity-50 fw-bold tracking-wider">Messages reçus</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* List of Messages */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden border border-light h-100">
                        <div className="card-header bg-white p-3 border-bottom border-light">
                            <div className="position-relative">
                                <input
                                    type="text"
                                    placeholder="Filtrer les messages..."
                                    className="form-control border-0 bg-light rounded-pill ps-5 py-2 fw-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <i className="bi bi-filter position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                            </div>
                        </div>
                        <div className="card-body p-0 overflow-auto custom-scrollbar" style={{ maxHeight: '700px' }}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-grow text-primary" role="status"></div>
                                </div>
                            ) : filteredMessages.length === 0 ? (
                                <div className="text-center py-5 text-muted px-3">
                                    <i className="bi bi-chat-left-dots fs-1 opacity-25 d-block mb-3"></i>
                                    Aucun message trouvé.
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {filteredMessages.map(msg => (
                                        <button
                                            key={msg.id || msg._id}
                                            onClick={() => {
                                                setSelectedMessage(msg);
                                                setReplyText('');
                                                setStatusMsg({ text: '', type: '' });
                                            }}
                                            className={`list-group-item list-group-item-action p-4 border-0 border-bottom border-light transition-all ${(selectedMessage?.id === msg.id || selectedMessage?._id === msg._id) ? 'bg-primary bg-opacity-10' : ''}`}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="fw-bold text-dark">{msg.nom}</div>
                                                <small className="text-muted opacity-75" style={{ fontSize: '0.7rem' }}>
                                                    {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                </small>
                                            </div>
                                            <div className="fw-semibold text-primary small mb-1">{msg.sujet}</div>
                                            <div className="text-muted small text-truncate" style={{ maxWidth: '100%' }}>{msg.message}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Message Detail View */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden border border-light h-100">
                        {selectedMessage ? (
                            <div className="card-body p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                        <h3 className="fw-bold text-dark mb-1">{selectedMessage.sujet}</h3>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill small fw-bold">Message Reçu</span>
                                            <span className="text-muted small">
                                                {new Date(selectedMessage.createdAt).toLocaleString('fr-FR', {
                                                    day: 'numeric', month: 'long', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline-danger btn-sm rounded-circle border-0" onClick={() => setSelectedMessage(null)}>
                                        <i className="bi bi-x-lg fs-5"></i>
                                    </button>
                                </div>

                                <div className="bg-light p-4 rounded-4 mb-4 border border-light">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <small className="text-muted text-uppercase fw-bold opacity-50" style={{ fontSize: '0.65rem' }}>De la part de</small>
                                            <div className="fw-bold text-dark fs-5">{selectedMessage.nom}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted text-uppercase fw-bold opacity-50" style={{ fontSize: '0.65rem' }}>Email de contact</small>
                                            <div className="text-primary fw-medium">
                                                <i className="bi bi-envelope-at me-2 opacity-50"></i>
                                                {selectedMessage.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-4 border border-light shadow-sm mb-5">
                                    <p className="text-dark fs-5 lh-base mb-0" style={{ whiteSpace: 'pre-line' }}>
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                {/* Integrated Reply Section */}
                                <div className="reply-section pt-4 border-top">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                            <i className="bi bi-reply-fill"></i>
                                        </div>
                                        <h6 className="fw-bold m-0 text-dark">Réponse Native</h6>
                                    </div>

                                    {statusMsg.text && (
                                        <div className={`alert alert-${statusMsg.type} rounded-4 border-0 small fw-bold mb-3`}>
                                            {statusMsg.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleReply}>
                                        <textarea
                                            className="form-control border-0 bg-light rounded-4 p-4 mb-3 focus-ring-none"
                                            rows="5"
                                            placeholder={`Écrivez votre réponse à ${selectedMessage.nom}...`}
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            style={{ resize: 'none' }}
                                            required
                                        ></textarea>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="text-muted small">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Un email officiel sera envoyé au citoyen.
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                                                    style={{ backgroundColor: '#001a41', border: 'none' }}
                                                    disabled={sendingReply || !replyText.trim()}
                                                >
                                                    {sendingReply ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-send-fill text-warning"></i>
                                                            Envoyer la Réponse
                                                        </>
                                                    )}
                                                </button>
                                                <a
                                                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.sujet}`}
                                                    className="btn btn-light rounded-pill px-3 py-2 fw-bold text-muted small border"
                                                >
                                                    <i className="bi bi-box-arrow-up-right me-1"></i> Externe
                                                </a>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="card-body d-flex flex-column align-items-center justify-content-center py-5 text-center text-muted opacity-50">
                                <i className="bi bi-envelope-open fs-1 mb-3"></i>
                                <h5 className="fw-bold">Messagerie Intuitive</h5>
                                <p>Cliquez sur un message pour activer l'interface de réponse rapide.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-primary-soft { background: rgba(0, 26, 65, 0.1); }
                .tracking-wider { letter-spacing: 0.5px; }
                
                .list-group-item:hover {
                    background-color: rgba(0, 26, 65, 0.02);
                }
                
                .btn-primary:hover {
                    background-color: #00338d !important;
                    transform: translateY(-2px);
                }

                .focus-ring-none:focus {
                    box-shadow: none;
                    background-color: #f1f3f5 !important;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #eee;
                    border-radius: 10px;
                }
            `}} />
        </div>
    );
};

export default AdminMessages;
