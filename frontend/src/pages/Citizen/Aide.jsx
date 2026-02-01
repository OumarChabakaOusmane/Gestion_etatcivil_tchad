import React, { useState } from 'react';
import { useLanguage } from "../../context/LanguageContext";

export default function Aide() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    const faqs = [
        {
            id: 'faq1',
            question: "Comment faire une demande d'acte ?",
            answer: "Connectez-vous à votre espace citoyen, puis sur votre tableau de bord, cliquez sur 'Faire une demande' sous l'acte souhaité (Naissance, Mariage ou Décès). Remplissez le formulaire et joignez les pièces demandées."
        },
        {
            id: 'faq2',
            question: "Quels sont les délais de traitement ?",
            answer: "En moyenne, les demandes sont traitées en 48h à 72h ouvrables. Vous recevrez un email et une notification sur votre compte dès que l'acte sera validé."
        },
        {
            id: 'faq3',
            question: "Est-ce gratuit ?",
            answer: "Les frais dépendent du type d'acte et de la commune. Les tarifs officiels sont affichés lors de la validation de votre demande dans le formulaire."
        },
        {
            id: 'faq4',
            question: "Comment télécharger mon acte ?",
            answer: "Une fois votre demande approuvée, rendez-vous dans la section 'Mes Demandes'. Un bouton 'Télécharger' apparaîtra à côté de votre demande validée."
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in font-family-sans pb-5">
            {/* Hero Section */}
            <div className="card border-0 rounded-4 overflow-hidden mb-5 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1a2b4b 0%, #3b82f6 100%)' }}>
                <div className="card-body p-5 text-center text-white">
                    <h1 className="fw-bold mb-3 display-5">Centre d'Aide</h1>
                    <p className="text-white-50 fs-5 mb-4">Trouvez des réponses à vos questions ou contactez notre support technique.</p>
                    <div className="position-relative mx-auto" style={{ maxWidth: '600px' }}>
                        <input
                            type="text"
                            className="form-control form-control-lg rounded-pill ps-5 border-0 shadow"
                            placeholder="Rechercher une réponse..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                    </div>
                </div>
            </div>

            <div className="row g-5">
                {/* FAQ Section */}
                <div className="col-lg-8">
                    <h3 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                        <i className="bi bi-question-circle text-primary"></i>
                        Foire Aux Questions
                    </h3>
                    <div className="accordion accordion-flush bg-white rounded-4 shadow-sm overflow-hidden" id="faqAccordion">
                        {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
                            <div className="accordion-item border-bottom" key={faq.id}>
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed py-4 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target={`#${faq.id}`}>
                                        {faq.question}
                                    </button>
                                </h2>
                                <div id={faq.id} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div className="accordion-body py-4 text-muted lh-lg">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-5 text-center text-muted">
                                <i className="bi bi-search fs-1 opacity-25 d-block mb-3"></i>
                                Aucun résultat trouvé pour "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>

                {/* Support Section */}
                <div className="col-lg-4">
                    <h3 className="fw-bold text-dark mb-4">Nous Contacter</h3>

                    <div className="card border-0 shadow-sm rounded-4 mb-4 hover-translate transition-all">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="rounded-4 bg-primary bg-opacity-10 p-3">
                                    <i className="bi bi-envelope-fill text-primary fs-4"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">Email Support</h6>
                                    <small className="text-muted">Réponse sous 24h</small>
                                </div>
                            </div>
                            <p className="text-muted small mb-4">Envoyez-nous vos documents ou capture d'écran en cas de problème.</p>
                            <a href="mailto:support@etatcivil-tchad.td" className="btn btn-outline-primary w-100 rounded-pill fw-bold">
                                Envoyer un email
                            </a>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 mb-4 hover-translate transition-all">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="rounded-4 bg-success bg-opacity-10 p-3">
                                    <i className="bi bi-telephone-fill text-success fs-4"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">Centre d'appel</h6>
                                    <small className="text-muted">Lun-Ven, 8h-17h</small>
                                </div>
                            </div>
                            <p className="text-muted small mb-4">Appelez-nous pour une assistance immédiate sur votre dossier.</p>
                            <a href="tel:1234" className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm">
                                Appeler le 1234
                            </a>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-light rounded-4 p-4 mt-5">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <i className="bi bi-lightbulb text-warning"></i>
                            Conseil
                        </h6>
                        <p className="text-muted small mb-0 lh-base">
                            Gardez toujours votre numéro de dossier (ID) à portée de main quand vous contactez le support. Cela nous aide à vous répondre plus vite !
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .accordion-button:not(.collapsed) {
                    background-color: rgba(59, 130, 246, 0.05);
                    color: #3b82f6;
                    box-shadow: none;
                }
                .accordion-button:focus {
                    box-shadow: none;
                    border-color: rgba(0,0,0,.125);
                }
                .hover-translate:hover {
                    transform: translateY(-5px);
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
            `}} />
        </div>
    );
}
