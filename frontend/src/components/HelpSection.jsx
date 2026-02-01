import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import helpImage from '../assets/help_center.png';

export default function HelpSection() {
    const { t, language } = useLanguage();

    const faqs = [
        {
            id: 'faq1',
            question: language === 'ar' ? "كيفية تقديم طلب؟" : "Comment faire une demande d'acte ?",
            answer: language === 'ar' ? "سجل الدخول إلى مساحة المواطن الخاصة بك، ثم في لوحة القيادة الخاصة بك، انقر فوق 'تقديم طلب' تحت نوع العقد المطلوب." : "Connectez-vous à votre espace citoyen, puis sur votre tableau de bord, cliquez sur 'Faire une demande' sous l'acte souhaité (Naissance, Mariage ou Décès). Remplissez le formulaire et joignez les pièces demandées."
        },
        {
            id: 'faq2',
            question: language === 'ar' ? "ما هي مواعيد المعالجة؟" : "Quels sont les délais de traitement ?",
            answer: language === 'ar' ? "في المتوسط، تتم معالجة الطلبات في غضون 48 إلى 72 ساعة عمل. ستتلقى بريدًا إلكترونيًا وإشعارًا على حسابك بمجرد الموافقة على الطلب." : "En moyenne, les demandes sont traitées en 48h à 72h ouvrables. Vous recevrez un email et une notification sur votre compte dès que l'acte sera validé."
        },
        {
            id: 'faq3',
            question: language === 'ar' ? "هل هو مجاني؟" : "Est-ce gratuit ?",
            answer: language === 'ar' ? "تعتمد الرسوم على نوع العقد والبلدية. يتم عرض الرسوم الرسمية أثناء التحقق من طلبك في النموذج." : "Les frais dépendent du type d'acte et de la commune. Les tarifs officiels sont affichés lors de la validation de votre demande dans le formulaire."
        }
    ];

    return (
        <section id="aide" className="py-5 bg-white">
            <div className="container py-5">
                <div className="section-title mb-5">
                    <h2>{language === 'ar' ? "مركز المساعدة" : "Centre d'Aide"}</h2>
                    <div className="divider"></div>
                    <p className="mt-3 text-muted">
                        {language === 'ar' ? "ابحث عن إجابات لأسئلتك الأكثر شيوعًا." : "Trouvez des réponses à vos questions les plus fréquentes."}
                    </p>
                </div>

                <div className="row g-4 align-items-center">
                    <div className="col-lg-6 animate__animated animate__fadeInLeft">
                        <img
                            src={helpImage}
                            alt="Help Support"
                            className="img-fluid rounded-4 shadow-sm"
                        />
                    </div>

                    <div className="col-lg-6 animate__animated animate__fadeInRight">
                        <div className="accordion accordion-flush bg-transparent" id="helpAccordion">
                            {faqs.map((faq) => (
                                <div className="accordion-item border-bottom mb-3 rounded-4 overflow-hidden shadow-sm" key={faq.id}>
                                    <h2 className="accordion-header">
                                        <button
                                            className="accordion-button collapsed py-4 fw-bold text-dark bg-white"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#${faq.id}`}
                                        >
                                            {faq.question}
                                        </button>
                                    </h2>
                                    <div id={faq.id} className="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                                        <div className="accordion-body py-4 text-muted bg-white">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-4 bg-light rounded-4 d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                <i className="bi bi-lightbulb fs-4"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-1">Besoin d'aide supplémentaire ?</h6>
                                <p className="text-muted small mb-0">Consultez notre formulaire de contact ci-dessous pour une assistance personnalisée.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .accordion-button:not(.collapsed) {
                    background-color: white !important;
                    color: var(--tchad-blue) !important;
                    box-shadow: none;
                }
                .accordion-button:focus {
                    box-shadow: none;
                }
                .accordion-item {
                    border: 1px solid rgba(0,0,0,0.05) !important;
                }
            `}} />
        </section>
    );
}
