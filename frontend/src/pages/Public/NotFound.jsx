import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 overflow-hidden position-relative">
            {/* Décoration en arrière-plan */}
            <div className="position-absolute opacity-10" style={{ top: '-10%', right: '-10%', zIndex: 0 }}>
                <i className="bi bi-geo-alt-fill text-primary" style={{ fontSize: '30rem' }}></i>
            </div>

            <div className="container position-relative" style={{ zIndex: 1 }}>
                <div className="row justify-content-center text-center">
                    <div className="col-lg-7">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px', borderRadius: '35px', background: 'linear-gradient(135deg, #002664 0%, #004aad 100%)', boxShadow: '0 20px 40px rgba(0, 74, 173, 0.2)' }}>
                                <i className="bi bi-exclamation-triangle-fill text-white fs-1"></i>
                            </div>

                            <h1 className="display-1 fw-900 mb-0" style={{ background: 'linear-gradient(90deg, #002664, #d21034, #ffcf00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>404</h1>

                            <h2 className="fw-bold mb-4 text-dark fs-1">Oups, dossier introuvable !</h2>

                            <p className="text-muted mb-5 fs-5 mx-auto" style={{ maxWidth: '500px' }}>
                                Le document ou la page que vous recherchez n'existe pas dans nos registres d'état civil.
                                Il a peut-être été déplacé ou archivé.
                            </p>

                            <div className="d-flex flex-wrap justify-content-center gap-3">
                                <Link to="/" className="btn btn-primary-custom px-5 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center gap-2">
                                    <i className="bi bi-house-door-fill"></i>
                                    Retour à l'Accueil
                                </Link>
                                <button onClick={() => window.history.back()} className="btn btn-outline-secondary px-5 py-3 rounded-pill fw-bold border-2 d-flex align-items-center gap-2">
                                    <i className="bi bi-arrow-left"></i>
                                    Page Précédente
                                </button>
                            </div>
                        </motion.div>

                        <div className="mt-5 pt-5 opacity-50">
                            <p className="small text-uppercase letter-spacing-2 fw-bold mb-3">Besoin d'aide ?</p>
                            <div className="d-flex justify-content-center gap-4">
                                <Link to="/contact" className="text-decoration-none text-primary fw-bold small">Contacter le support</Link>
                                <Link to="/services" className="text-decoration-none text-primary fw-bold small">Liste des services</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de couleur drapeau en bas */}
            <div className="position-absolute bottom-0 start-0 w-100 d-flex" style={{ height: '8px' }}>
                <div style={{ flex: 1, backgroundColor: '#002664' }}></div>
                <div style={{ flex: 1, backgroundColor: '#ffcf00' }}></div>
                <div style={{ flex: 1, backgroundColor: '#d21034' }}></div>
            </div>
        </div>
    );
};

export default NotFound;
