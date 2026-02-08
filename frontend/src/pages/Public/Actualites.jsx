import { useState, useEffect } from 'react';
import articleService from '../../services/articleService';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import PageTransition from '../../components/PageTransition';
import { useLanguage } from '../../context/LanguageContext';

export default function Actualites() {
    const { language } = useLanguage();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');

    useEffect(() => {
        loadArticles();
    }, [category]);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;

            const response = await articleService.getAllArticles(params);
            setArticles(response.data || []);
        } catch (error) {
            console.error('Erreur chargement articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = (article, platform) => {
        const url = window.location.href;
        const text = `Découvrez cette actualité sur l'État Civil Tchad : ${article.title}`;

        if (platform === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        }
    };

    return (
        <div className={language === 'ar' ? 'rtl' : ''}>
            <PublicNavbar />
            <PageTransition>
                <div className="container py-5" style={{ marginTop: '80px', minHeight: '80vh' }}>
                    <div className="text-center mb-5 animate__animated animate__fadeInDown">
                        <h1 className="fw-bold display-5 text-primary mb-3">Actualités & Communiqués</h1>
                        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
                            Restez informé des dernières annonces officielles, événements et mises à jour de l'État Civil Tchadien.
                        </p>
                        <div className="d-flex justify-content-center gap-2 mt-4">
                            <button onClick={() => setCategory('')} className={`btn rounded-pill px-4 ${!category ? 'btn-primary' : 'btn-outline-secondary'}`}>Tous</button>
                            <button onClick={() => setCategory('Administration')} className={`btn rounded-pill px-4 ${category === 'Administration' ? 'btn-primary' : 'btn-outline-secondary'}`}>Administration</button>
                            <button onClick={() => setCategory('Santé')} className={`btn rounded-pill px-4 ${category === 'Santé' ? 'btn-primary' : 'btn-outline-secondary'}`}>Santé</button>
                            <button onClick={() => setCategory('Événement')} className={`btn rounded-pill px-4 ${category === 'Événement' ? 'btn-primary' : 'btn-outline-secondary'}`}>Événement</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="d-flex justify-content-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="display-1 text-muted opacity-25 mb-3"><i className="bi bi-newspaper"></i></div>
                            <h3 className="text-muted">Aucune actualité pour le moment</h3>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {articles.map((article, index) => (
                                <div key={article.id} className="col-md-6 col-lg-4 animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all rounded-4 overflow-hidden">
                                        <div className="position-relative" style={{ height: '240px' }}>
                                            <img
                                                src={article.image || '/images/news-placeholder.jpg'}
                                                alt={article.title}
                                                className="w-100 h-100 object-fit-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Actualité'; }}
                                            />
                                            <div className="position-absolute top-0 end-0 m-3">
                                                <span className="badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill fw-bold">
                                                    {article.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 d-flex flex-column">
                                            <small className="text-muted mb-2 d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                                {formatDate(article.createdAt)}
                                            </small>
                                            <h5 className="card-title fw-bold mb-3 text-dark">{article.title}</h5>
                                            <p className="card-text text-muted small flex-grow-1" style={{ lineHeight: '1.6' }}>
                                                {article.summary}
                                            </p>
                                            <div className="mt-auto pt-3 d-flex align-items-center justify-content-between border-top border-light-subtle">
                                                <button className="btn btn-link text-primary p-0 text-decoration-none fw-bold text-start">
                                                    Lire la suite <i className="bi bi-arrow-right ms-1"></i>
                                                </button>

                                                <div className="d-flex gap-2">
                                                    <button
                                                        onClick={() => handleShare(article, 'whatsapp')}
                                                        className="btn btn-sm btn-outline-success rounded-circle shadow-none p-0 d-flex align-items-center justify-content-center"
                                                        style={{ width: '32px', height: '32px' }}
                                                        title="Partager sur WhatsApp"
                                                    >
                                                        <i className="bi bi-whatsapp"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleShare(article, 'facebook')}
                                                        className="btn btn-sm btn-outline-primary rounded-circle shadow-none p-0 d-flex align-items-center justify-content-center"
                                                        style={{ width: '32px', height: '32px' }}
                                                        title="Partager sur Facebook"
                                                    >
                                                        <i className="bi bi-facebook"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PageTransition>
            <Footer />
        </div>
    );
}
