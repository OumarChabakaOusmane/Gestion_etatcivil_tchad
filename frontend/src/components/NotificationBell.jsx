import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const NotificationBell = ({ isWhite = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        loadNotifications();
        // Polling toutes les 10 secondes pour les nouvelles notifications
        const interval = setInterval(loadNotifications, 10000);
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

    return (
        <div className="position-relative">
            <button
                className={`btn btn-link p-0 position-relative shadow-none border-0 ${isWhite ? 'text-white' : 'text-dark'}`}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <i className="bi bi-bell-fill fs-4"></i>
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2 border-white" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050 }} onClick={() => setShowDropdown(false)}></div>
                    <div className="position-absolute end-0 mt-3 bg-white shadow-lg rounded-4 border overflow-hidden animate__animated animate__fadeIn" style={{ width: '350px', zIndex: 1060 }}>
                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                            <h6 className="m-0 fw-bold">Notifications</h6>
                            {unreadCount > 0 && (
                                <button className="btn btn-sm btn-link p-0 text-decoration-none small fw-bold" onClick={handleMarkAllRead}>
                                    Tout marquer lu
                                </button>
                            )}
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div className="p-5 text-center text-muted">
                                    <i className="bi bi-bell-slash fs-1 opacity-25 d-block mb-3"></i>
                                    <p className="small m-0">Aucune notification pour le moment.</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 border-bottom hover-bg-light transition-all cursor-pointer ${!notif.read ? 'bg-primary bg-opacity-5' : ''}`}
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        <div className="d-flex gap-3">
                                            <div className={`rounded-circle d-flex align-items-center justify-content-center bg-${notif.type || 'info'} bg-opacity-10 text-${notif.type || 'info'}`} style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                                                <i className={`bi bi-${notif.type === 'success' ? 'check-circle-fill' : notif.type === 'danger' ? 'x-circle-fill' : 'info-circle-fill'} fs-5`}></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold small">{notif.title}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>{getTimeAgo(notif.createdAt)}</span>
                                                </div>
                                                <p className="small text-muted mb-0 lh-sm">{notif.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-2 border-top text-center bg-light">
                                <button className="btn btn-sm btn-link text-decoration-none small text-muted" onClick={() => setShowDropdown(false)}>
                                    Fermer
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
