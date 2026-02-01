import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

/**
 * SmsSimulator - Un composant qui simule la réception de SMS en temps réel
 * Affiche une notification flottante style "Apple/Android notification"
 */
const SmsSimulator = () => {
    const [lastSms, setLastSms] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);

    useEffect(() => {
        // On écoute les nouveaux SMS créés il y a moins de 10 secondes pour éviter de re-notifier les vieux messages
        const now = new Date();
        const q = query(
            collection(db, 'simulated_sms'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const smsData = change.doc.data();

                    // Vérifier si le SMS est récent (moins de 10 secondes)
                    const createdAt = smsData.createdAt?.toDate();
                    if (createdAt && (now.getTime() - createdAt.getTime()) < 10000) {
                        showNotification(smsData);
                    }
                }
            });
        }, (error) => {
            console.error("Erreur d'écoute Firestore (SMS Simulator):", error.message);
            // On peut tenter de re-souscrire plus tard si c'est un problème de permission temporaire
        });

        return () => unsubscribe();
    }, []);

    const showNotification = (sms) => {
        setLastSms(sms);
        setIsVisible(true);

        // Jouer un petit son de notification si souhaité
        if (isSoundEnabled) {
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                audio.play();
            } catch (e) { console.log("Audio not supported"); }
        }

        // Cacher automatiquement après 8 secondes
        setTimeout(() => {
            setIsVisible(false);
        }, 8000);
    };

    return (
        <div
            className="sms-simulator-overlay"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: `translateX(-50%) translateY(${isVisible ? '0' : '-100px'})`,
                pointerEvents: isVisible ? 'auto' : 'none',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
        >
            <div className="sms-device-frame">
                <div className="sms-status-bar">
                    <span>12:00</span>
                    <div className="sms-status-icons">
                        <i className="bi bi-reception-4"></i>
                        <i className="bi bi-wifi"></i>
                        <i className="bi bi-battery-full"></i>
                    </div>
                </div>

                <div className="sms-bubble">
                    <div className="sms-header">
                        <div className="sms-avatar">
                            <i className="bi bi-shield-check"></i>
                        </div>
                        <div className="sms-sender-info">
                            <strong>SIGEC-TCHAD</strong>
                            <span>À l'instant</span>
                        </div>
                    </div>
                    <div className="sms-body">
                        {lastSms?.message}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .sms-simulator-overlay {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10000;
                    width: 320px;
                }
                .sms-device-frame {
                    background: #1a1a1a;
                    border-radius: 30px;
                    padding: 10px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 2px #333;
                }
                .sms-status-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #fff;
                    font-size: 11px;
                    padding: 0 10px 8px;
                }
                .sms-status-icons i {
                    margin-left: 5px;
                }
                .sms-bubble {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    border-radius: 20px;
                    padding: 12px 15px;
                    margin: 0 5px 5px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    color: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .sms-bubble .sms-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .sms-avatar {
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-right: 10px;
                    font-size: 16px;
                }
                .sms-sender-info {
                    display: flex;
                    flex-direction: column;
                }
                .sms-sender-info strong {
                    font-size: 14px;
                    border-radius: 10px;
                    margin: 0;
                }
            `}} />
        </div>
    );
};

export default SmsSimulator;
