import React from 'react';
import { Link } from 'react-router-dom';

const DemanderActe = () => {
    const services = [
        {
            title: "Acte de Naissance",
            description: "Obtenez un acte de naissance pour vous ou votre enfant.",
            icon: "bi-person-badge",
            color: "primary",
            link: "/demande/naissance"
        },
        {
            title: "Acte de Mariage",
            description: "Demandez un acte de mariage officiel après célébration.",
            icon: "bi-heart-fill",
            color: "danger",
            link: "/demande/mariage"
        },
        {
            title: "Acte de Décès",
            description: "Déclarer un décès et obtenir l'acte correspondant.",
            icon: "bi-journal-text",
            color: "secondary",
            link: "/demande/deces"
        }
    ];

    return (
        <div className="fade-in">
            <div className="dashboard-header-simple py-2 mb-5">
                <div>
                    <h1 className="user-welcome-text mb-1">Demander un Acte</h1>
                    <p className="text-muted mb-0 small">Sélectionnez le type de document dont vous avez besoin</p>
                </div>
            </div>

            <div className="row g-4 justify-content-center">
                {services.map((service, index) => (
                    <div key={index} className="col-md-4">
                        <Link to={service.link} className="text-decoration-none">
                            <div className="stat-card-modern h-100 flex-column text-center p-5 hover-translate">
                                <div className={`stat-border bg-${service.color}`}></div>
                                <div className={`stat-icon-circle bg-${service.color} bg-opacity-10 text-${service.color} mb-4 mx-auto`}
                                    style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}>
                                    <i className={`bi ${service.icon}`}></i>
                                </div>
                                <h4 className="fw-bold mb-3 text-dark">{service.title}</h4>
                                <p className="text-muted small mb-0">{service.description}</p>
                                <div className="mt-4">
                                    <span className={`btn btn-sm btn-outline-${service.color} rounded-pill px-4`}>
                                        Commencer <i className="bi bi-arrow-right ms-1"></i>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <div className="mt-5 p-4 modern-table-card bg-light border-0">
                <div className="row align-items-center">
                    <div className="col-md-1 text-center text-primary fs-2">
                        <i className="bi bi-info-circle-fill"></i>
                    </div>
                    <div className="col-md-11">
                        <h6 className="fw-bold mb-1">Informations importantes</h6>
                        <p className="small text-muted mb-0">
                            Assurez-vous d'avoir les pièces justificatives numérisées au format PDF ou JPG (taille max 5Mo).
                            Le délai de traitement varie entre 24h et 72h ouvrables.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemanderActe;
