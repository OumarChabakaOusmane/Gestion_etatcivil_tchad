import React from 'react';

const TrackingTimeline = ({ status, type }) => {
    const steps = [
        { id: 'submitted', label: 'Dépôt', icon: 'bi-send', color: '#3b82f6' },
        { id: 'processing', label: 'Analyse', icon: 'bi-journal-check', color: '#8b5cf6' },
        { id: 'validated', label: 'Validation', icon: 'bi-patch-check', color: '#10b981' },
        { id: 'ready', label: 'Prêt / Signé', icon: 'bi-award', color: '#f59e0b' }
    ];

    const getStatusIndex = (status) => {
        switch (status) {
            case 'en_attente': return 1; // Analyse
            case 'acceptee': return 4;   // Tout est fini
            case 'rejetee': return -1;   // Cas spécial
            default: return 0;
        }
    };

    const currentIndex = getStatusIndex(status);

    if (status === 'rejetee') {
        return (
            <div className="p-4 text-center">
                <div className="bg-danger bg-opacity-10 text-danger p-4 rounded-4 mb-3">
                    <i className="bi bi-x-circle-fill fs-1"></i>
                    <h5 className="mt-3 fw-bold">Demande Rejetée</h5>
                    <p className="small mb-0">Veuillez consulter le motif du rejet pour corriger votre dossier.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="timeline-container position-relative px-4">
                {/* Ligne de fond */}
                <div className="position-absolute translate-middle-x start-50 h-100 bg-light" style={{ width: '4px', top: '0', zIndex: '0' }}></div>

                {/* Ligne de progression */}
                <div
                    className="position-absolute translate-middle-x start-50 bg-primary transition-all duration-700"
                    style={{
                        width: '4px',
                        top: '0',
                        height: `${(currentIndex / (steps.length - 1)) * 100}%`,
                        zIndex: '1',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
                    }}
                ></div>

                {steps.map((step, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex || (index === steps.length - 1 && currentIndex === steps.length);

                    return (
                        <div key={step.id} className="position-relative mb-5" style={{ zIndex: '2' }}>
                            <div className="d-flex align-items-center gap-4">
                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center shadow-lg transition-all duration-500 ${isActive ? 'bg-white text-primary' : 'bg-light text-muted'}`}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        border: isActive ? `3px solid ${step.color}` : '3px solid #e2e8f0',
                                        transform: isCurrent ? 'scale(1.15)' : 'scale(1)'
                                    }}
                                >
                                    <i className={`bi ${step.icon} fs-4`}></i>
                                </div>
                                <div className="bg-white p-3 rounded-4 shadow-sm border flex-grow-1">
                                    <h6 className={`mb-1 fw-bold ${isActive ? 'text-dark' : 'text-muted'}`}>{step.label}</h6>
                                    <p className="small text-muted mb-0">
                                        {isActive ? (index === currentIndex ? 'Étape en cours d\'examen' : 'Validé avec succès') : 'Attente du traitement'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="alert alert-primary bg-opacity-10 border-0 rounded-4 p-3 mt-2 mx-4">
                <div className="d-flex gap-3">
                    <i className="bi bi-info-circle-fill"></i>
                    <p className="small mb-0">
                        <strong>Estimation</strong> : Les délais moyens pour un acte de <strong>{type}</strong> au Tchad sont de 48h à 72h ouvrables.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TrackingTimeline;
