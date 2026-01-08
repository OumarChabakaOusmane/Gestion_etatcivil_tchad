import React from 'react';

export default function Aide() {
    return (
        <div className="container py-5 fade-in font-family-sans">
            <h2 className="fw-bold mb-4" style={{ color: '#1a2b4b' }}>Centre d'Aide</h2>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="bg-white p-4 rounded-4 shadow-sm">
                        <h5 className="fw-bold text-primary mb-3">Comment faire une demande ?</h5>
                        <p className="text-muted">
                            Pour effectuer une demande d'acte, rendez-vous sur votre tableau de bord et cliquez sur le type d'acte souhaité (Naissance, Mariage, ou Décès). Suivez ensuite les étapes du formulaire.
                        </p>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="bg-white p-4 rounded-4 shadow-sm">
                        <h5 className="fw-bold text-primary mb-3">Délais de traitement</h5>
                        <p className="text-muted">
                            Les demandes sont généralement traitées sous 24 à 48 heures ouvrables. Vous recevrez une notification dès que votre acte est disponible.
                        </p>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white p-4 rounded-4 shadow-sm">
                        <h5 className="fw-bold text-primary mb-3">Contactez-nous</h5>
                        <p className="text-muted mb-0">
                            Si vous rencontrez des problèmes techniques, veuillez nous contacter à l'adresse support@etatcivil-tchad.td ou par téléphone au 1234.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
