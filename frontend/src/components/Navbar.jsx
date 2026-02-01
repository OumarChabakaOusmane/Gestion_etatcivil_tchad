import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import useCurrentUser from '../hooks/useCurrentUser';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useCurrentUser();
    const isAdmin = authService.isAdmin();

    const handleLogout = () => {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            authService.logout();
            navigate('/');
        }
    };

    // Fonction pour vérifier si le lien est actif
    const isActive = (path) => {
        return location.pathname === path;
    };

    if (!user) return null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark shadow-lg sticky-top py-3"
            style={{ backgroundColor: 'var(--tchad-blue)', borderBottom: '2px solid var(--tchad-yellow)' }}>
            <div className="container">
                <Link className="navbar-brand fw-bold d-flex align-items-center" to={isAdmin ? "/admin/dashboard" : "/dashboard"}>
                    <span className="me-2 fs-3">🇹🇩</span>
                    <div className="lh-1">
                        <span className="d-block small text-warning opacity-75" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>RÉPUBLIQUE DU TCHAD</span>
                        <span className="fs-5">ÉTAT CIVIL</span>
                    </div>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {isAdmin ? (
                            // Menu Admin
                            <>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${isActive('/admin/dashboard') ? 'active fw-bold' : ''}`}
                                        to="/admin/dashboard"
                                    >
                                        <i className="bi bi-speedometer2 me-1"></i>
                                        Tableau de bord
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${isActive('/admin/demandes') ? 'active fw-bold' : ''}`}
                                        to="/admin/demandes"
                                    >
                                        <i className="bi bi-file-earmark-text me-1"></i>
                                        Gestion des demandes
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${isActive('/admin/utilisateurs') ? 'active fw-bold' : ''}`}
                                        to="/admin/utilisateurs"
                                    >
                                        <i className="bi bi-people me-1"></i>
                                        Utilisateurs
                                    </Link>
                                </li>
                            </>
                        ) : (
                            // Menu Citoyen
                            <>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${isActive('/dashboard') ? 'active fw-bold' : ''}`}
                                        to="/dashboard"
                                    >
                                        <i className="bi bi-house-door me-1"></i>
                                        Accueil
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${isActive('/mes-demandes') ? 'active fw-bold' : ''}`}
                                        to="/mes-demandes"
                                    >
                                        <i className="bi bi-list-check me-1"></i>
                                        Mes demandes
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${isActive('/actualites') ? 'active fw-bold' : ''}`}
                                        to="/actualites"
                                    >
                                        <i className="bi bi-newspaper me-1"></i>
                                        Actualités
                                    </Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <i className="bi bi-plus-circle me-1"></i>
                                        Nouvelle demande
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" to="/demande/naissance">
                                                <i className="bi bi-file-earmark-plus me-2"></i>
                                                Acte de naissance
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/demande/mariage">
                                                <i className="bi bi-heart me-2"></i>
                                                Acte de mariage
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/demande/deces">
                                                <i className="bi bi-file-earmark-x me-2"></i>
                                                Déclaration de décès
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="bi bi-person-circle me-1"></i>
                                {user.prenom} {user.nom}
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <span className="dropdown-item-text">
                                        <small className="text-muted">
                                            <i className="bi bi-shield-check me-1"></i>
                                            {isAdmin ? 'Administrateur' : 'Citoyen'}
                                        </small>
                                    </span>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        Déconnexion
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
