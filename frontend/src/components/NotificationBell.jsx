import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const NotificationBell = ({ isWhite = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        loadNotifications();
        // Polling toutes les 60 secondes pour les nouvelles notifications
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await notificationService.getNotifications();
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error('Erreur notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Erreur markRead:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Erreur markAllRead:', error);
        }
    };

    const getTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'À l\'instant';
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
        return date.toLocaleDateString();
    };

    const getMessageContent = (message) => {
        if (message.includes('Motif:')) {
            const [mainText, reason] = message.split('Motif:');
            return (
                <>
                    <p className="small text-muted mb-2 lh-sm">{mainText}</p>
                    <div className="p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25">
                        <span className="d-block x-small fw-bold text-danger text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Motif du rejet</span>
                        <span className="d-block small text-dark fst-italic">"{reason.trim()}"</span>
                    </div>
                </>
            );
        }
        return <p className="small text-muted mb-0 lh-sm">{message}</p>;
    };

    return (
        <div className="position-relative">
            <button
                className={`btn btn-link p-0 position-relative shadow-none border-0 ${isWhite ? 'text-white' : 'text-dark'}`}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <i className={`bi bi-bell-fill fs-4 ${showDropdown ? 'opacity-100' : 'opacity-75'} transition-all`}></i>
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2 border-white shadow-sm" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050 }} onClick={() => setShowDropdown(false)}></div>
                    <div className="position-absolute end-0 mt-3 bg-white shadow-lg rounded-4 border overflow-hidden animate__animated animate__fadeIn" style={{ width: '380px', zIndex: 1060 }}>
                        <div className="p-3 d-flex justify-content-between align-items-center text-white" style={{ background: 'linear-gradient(45deg, #0a429b, #0d6efd)' }}>
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-bell-fill"></i>
                                <h6 className="m-0 fw-bold">Notifications</h6>
                            </div>
                            {unreadCount > 0 && (
                                <button className="btn btn-sm btn-light text-primary py-0 px-2 rounded-pill small fw-bold shadow-sm" style={{ fontSize: '0.7rem' }} onClick={handleMarkAllRead}>
                                    Tout marquer lu
                                </button>
                            )}
                        </div>

                        <div style={{ maxHeight: '450px', overflowY: 'auto' }} className="custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-5 text-center text-muted">
                                    <div className="mb-3 rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                        <i className="bi bi-bell-slash fs-3 opacity-25"></i>
                                    </div>
                                    <p className="small m-0 fw-bold">Aucune notification</p>
                                    <p className="x-small text-muted">Vos alertes apparaîtront ici</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 border-bottom transition-all cursor-pointer ${!notif.read ? 'bg-primary bg-opacity-5 position-relative' : 'hover-bg-light'}`}
                                        onClick={() => handleMarkAsRead(notif.id)}
                                        style={{ borderLeft: !notif.read ? '4px solid #0d6efd' : '4px solid transparent' }}
                                    >
                                        <div className="d-flex gap-3">
                                            <div className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0 bg-white text-${notif.type === 'danger' ? 'danger' : 'success'}`}
                                                style={{ width: '40px', height: '40px', border: `1px solid var(--bs-${notif.type === 'danger' ? 'danger' : 'success'})` }}>
                                                <i className={`bi bi-${notif.type === 'success' ? 'check-lg' : notif.type === 'danger' ? 'x-lg' : 'info-lg'} fs-5`}></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <span className={`fw-bold small ${!notif.read ? 'text-primary' : 'text-dark'}`}>{notif.title}</span>
                                                    <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                                                        <i className="bi bi-clock"></i> {getTimeAgo(notif.createdAt)}
                                                    </span>
                                                </div>
                                                {getMessageContent(notif.message)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-2 border-top text-center bg-light">
                            <button className="btn btn-sm text-muted fw-bold w-100" onClick={() => setShowDropdown(false)} style={{ fontSize: '0.75rem' }}>
                                <i className="bi bi-chevron-up me-1"></i> Fermer
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
