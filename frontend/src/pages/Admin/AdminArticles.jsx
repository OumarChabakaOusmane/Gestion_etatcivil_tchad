import { useState, useEffect } from 'react';
import articleService from '../../services/articleService';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-hot-toast';

export default function AdminArticles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Général',
        content: '',
        image: '',
        isPublished: true
    });

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const response = await articleService.getAllArticles({ isAdmin: true });
            setArticles(response.data || []);
        } catch (error) {
            console.error('Erreur chargement articles:', error);
            toast.error('Erreur lors du chargement des articles');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (article = null) => {
        if (article) {
            setEditingArticle(article);
            setFormData({
                title: article.title,
                category: article.category,
                content: article.content,
                image: article.image || '',
                isPublished: article.isPublished
            });
        } else {
            setEditingArticle(null);
            setFormData({
                title: '',
                category: 'Général',
                content: '',
                image: '',
                isPublished: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingArticle) {
                await articleService.updateArticle(editingArticle.id, formData);
                toast.success('Article mis à jour avec succès');
            } else {
                await articleService.createArticle(formData);
                toast.success('Article créé avec succès');
            }
            setShowModal(false);
            loadArticles();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
        try {
            await articleService.deleteArticle(id);
            toast.success('Article supprimé');
            loadArticles();
        } catch (error) {
            console.error('Erreur suppression:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    // Conversion d'image en Base64 pour simplifier (idéalement Upload Service)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-4 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Gestion des Actualités</h2>
                    <p className="text-muted mb-0">Publiez des annonces et communiqués officiels.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn btn-primary rounded-pill px-4 shadow-sm">
                    <i className="bi bi-plus-lg me-2"></i>Nouvel Article
                </button>
            </div>

            <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3">Titre</th>
                                <th className="py-3">Catégorie</th>
                                <th className="py-3">Statut</th>
                                <th className="py-3">Date</th>
                                <th className="pe-4 py-3 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : articles.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucun article publié</td></tr>
                            ) : articles.map((article) => (
                                <tr key={article.id}>
                                    <td className="ps-4 py-3 fw-bold">{article.title}</td>
                                    <td><span className="badge bg-light text-dark border">{article.category}</span></td>
                                    <td>
                                        {article.isPublished ?
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Publié</span> :
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3">Brouillon</span>
                                        }
                                    </td>
                                    <td className="small text-muted">{new Date(article.createdAt).toLocaleDateString()}</td>
                                    <td className="pe-4 py-3 text-end">
                                        <button onClick={() => handleOpenModal(article)} className="btn btn-sm btn-light me-2"><i className="bi bi-pencil"></i></button>
                                        <button onClick={() => handleDelete(article.id)} className="btn btn-sm btn-light text-danger"><i className="bi bi-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulaire */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold">{editingArticle ? 'Modifier l\'article' : 'Nouvel Article'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Titre</label>
                                        <input type="text" className="form-control form-control-lg bg-light border-0"
                                            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-uppercase text-muted">Catégorie</label>
                                            <select className="form-select bg-light border-0"
                                                value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="Général">Général</option>
                                                <option value="Administration">Administration</option>
                                                <option value="Santé">Santé</option>
                                                <option value="Événement">Événement</option>
                                                <option value="Urgent">Urgent</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-uppercase text-muted">Image</label>
                                            <input type="file" className="form-control bg-light border-0" accept="image/*" onChange={handleImageChange} />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Contenu</label>
                                        <textarea className="form-control bg-light border-0" rows="6"
                                            value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required></textarea>
                                    </div>

                                    <div className="form-check form-switch mb-4">
                                        <input className="form-check-input" type="checkbox" id="pubSwitch"
                                            checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} />
                                        <label className="form-check-label fw-bold" htmlFor="pubSwitch">Publier immédiatement</label>
                                    </div>

                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Annuler</button>
                                        <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
                                            {loading ? 'Sauvegarde...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
