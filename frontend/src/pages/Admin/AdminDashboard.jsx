import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import demandeService from '../../services/demandeService';
import userService from '../../services/userService';
import authService from '../../services/authService';
import useCurrentUser from '../../hooks/useCurrentUser';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        en_attente: 0,
        acceptee: 0,
        rejetee: 0,
        totalUsers: 0,
        countsByType: [
            { name: 'Naissance', value: 0, color: '#0d6efd' },
            { name: 'Mariage', value: 0, color: '#ffc107' },
            { name: 'Décès', value: 0, color: '#dc3545' }
        ]
    });
    const [recentDemandes, setRecentDemandes] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useCurrentUser();

    const formatDate = (dateInput) => {
        if (!dateInput) return "-";
        let date;
        if (dateInput && typeof dateInput === 'object' && dateInput._seconds) {
            date = new Date(dateInput._seconds * 1000);
        } else {
            date = new Date(dateInput);
        }
        return isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
    };

    useEffect(() => {
        loadAdminStats();
        const interval = setInterval(loadAdminStats, 2000);
        return () => clearInterval(interval);
    }, []);

    const loadAdminStats = async () => {
        try {
            const [demandesRes, usersRes] = await Promise.all([
                demandeService.getAllDemandes(),
                userService.getAllUsers()
            ]);

            const demandes = Array.isArray(demandesRes.data) ? demandesRes.data :
                (Array.isArray(demandesRes) ? demandesRes : []);

            const allUsers = Array.isArray(usersRes.data) ? usersRes.data :
                (Array.isArray(usersRes) ? usersRes : []);

            const naissance = demandes.filter(d => d.type === 'naissance').length;
            const mariage = demandes.filter(d => d.type === 'mariage').length;
            const deces = demandes.filter(d => d.type === 'deces').length;

            setStats({
                total: demandes.length,
                en_attente: demandes.filter(d => d.statut === 'en_attente').length,
                acceptee: demandes.filter(d => d.statut === 'acceptee').length,
                rejetee: demandes.filter(d => d.statut === 'rejetee').length,
                totalUsers: allUsers.length,
                countsByType: [
                    { name: 'Naissance', value: naissance, color: '#0d6efd' },
                    { name: 'Mariage', value: mariage, color: '#ffc107' },
                    { name: 'Décès', value: deces, color: '#dc3545' }
                ]
            });

            const sortedDemandes = [...demandes].sort((a, b) => {
                const dateA = a.dateDemande?._seconds ? a.dateDemande._seconds * 1000 : new Date(a.dateDemande);
                const dateB = b.dateDemande?._seconds ? b.dateDemande._seconds * 1000 : new Date(b.dateDemande);
                return dateB - dateA;
            });
            setRecentDemandes(sortedDemandes.slice(0, 5));

            const sortedUsers = [...allUsers].reverse();
            setRecentUsers(sortedUsers.slice(0, 5));

        } catch (error) {
            console.error('Erreur stats admin:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-0">
            <div className="p-4">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                    </div>
                ) : (
                    <>
                        <section className="row g-4 mb-5">
                            <div className="col-md-3">
                                <div className="card border-0 rounded-4 shadow-sm text-white cursor-pointer"
                                    style={{ backgroundColor: 'var(--admin-navy)', transition: 'transform 0.2s' }}
                                    onClick={() => navigate('/admin/demandes?filter=en_attente')}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div className="card-body p-4 d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-hourglass-split fs-3"></i>
                                        </div>
                                        <div>
                                            <h2 className="fw-bold m-0">{stats.en_attente}</h2>
                                            <span className="small opacity-75">Demandes en attente</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 rounded-4 shadow-sm text-white cursor-pointer"
                                    style={{ backgroundColor: '#10b981', transition: 'transform 0.2s' }}
                                    onClick={() => navigate('/admin/demandes?filter=acceptee')}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div className="card-body p-4 d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-check-circle-fill fs-3"></i>
                                        </div>
                                        <div>
                                            <h2 className="fw-bold m-0">{stats.acceptee}</h2>
                                            <span className="small opacity-75">Demandes approuvées</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 rounded-4 shadow-sm text-white cursor-pointer"
                                    style={{ backgroundColor: '#f43f5e', transition: 'transform 0.2s' }}
                                    onClick={() => navigate('/admin/demandes?filter=rejetee')}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div className="card-body p-4 d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-x-circle-fill fs-3"></i>
                                        </div>
                                        <div>
                                            <h2 className="fw-bold m-0">{stats.rejetee}</h2>
                                            <span className="small opacity-75">Demandes rejetées</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 rounded-4 shadow-sm text-white cursor-pointer"
                                    style={{ backgroundColor: '#3b82f6', transition: 'transform 0.2s' }}
                                    onClick={() => navigate('/admin/utilisateurs')}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div className="card-body p-4 d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-people-fill fs-3"></i>
                                        </div>
                                        <div>
                                            <h2 className="fw-bold m-0">{stats.totalUsers}</h2>
                                            <span className="small opacity-75">Utilisateurs inscrits</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="row g-4 mb-5">
                            <div className="col-lg-7">
                                <div className="card border-0 rounded-4 shadow-sm h-100">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold text-dark mb-4">Statistiques des Demandes</h5>
                                        <div className="row align-items-center">
                                            <div className="col-md-6">
                                                <div style={{ height: '250px', minHeight: '250px', width: '100%', minWidth: 0, position: 'relative' }}>
                                                    <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                                        <PieChart>
                                                            <Pie
                                                                data={stats.countsByType.some(c => c.value > 0) ? stats.countsByType : [{ name: 'Vide', value: 1, color: '#eee' }]}
                                                                innerRadius={60}
                                                                outerRadius={85}
                                                                stroke="none"
                                                                dataKey="value"
                                                                isAnimationActive={false}
                                                            >
                                                                {stats.countsByType.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex flex-column gap-3">
                                                    {stats.countsByType.map((item, idx) => (
                                                        <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: item.color }}></div>
                                                                <span className="small fw-bold text-muted">Actes de {item.name}</span>
                                                            </div>
                                                            <span className="badge bg-white text-dark shadow-sm px-3 rounded-pill">
                                                                {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-5">
                                <div className="card border-0 rounded-4 shadow-sm h-100">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="fw-bold text-dark m-0">Utilisateurs récents</h5>
                                            <Link to="/admin/utilisateurs" className="small fw-bold text-primary text-decoration-none">Voir tous</Link>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table align-middle table-borderless">
                                                <thead>
                                                    <tr className="bg-light">
                                                        <th className="rounded-start small text-muted text-uppercase fw-bold">Noms</th>
                                                        <th className="rounded-end small text-muted text-uppercase fw-bold text-end">Inscrit le</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentUsers.map((user, idx) => (
                                                        <tr key={user.id || user._id || idx} className="border-bottom-faint cursor-pointer hover-bg-light" onClick={() => navigate('/admin/utilisateurs')}>
                                                            <td className="py-3 px-0">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}>
                                                                        {user.nom ? user.nom[0] : 'U'}
                                                                    </div>
                                                                    <span className="fw-bold text-dark small">{user.prenom} {user.nom}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-0 text-end text-muted small">{formatDate(user.createdAt)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="card border-0 rounded-4 shadow-sm mb-5">
                            <div className="card-body p-4">
                                <h5 className="fw-bold text-dark mb-4">Demandes en Attente</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 border-0 small text-muted text-uppercase fw-bold">ID</th>
                                                <th className="border-0 small text-muted text-uppercase fw-bold">Type</th>
                                                <th className="border-0 small text-muted text-uppercase fw-bold">Citoyen</th>
                                                <th className="border-0 small text-muted text-uppercase fw-bold text-center">Soumise le</th>
                                                <th className="pe-4 border-0 small text-muted text-uppercase fw-bold text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentDemandes.filter(d => d.statut === 'en_attente').map(d => (
                                                <tr key={d.id || d._id} className="cursor-pointer" onClick={() => navigate('/admin/demandes?filter=en_attente')}>
                                                    <td className="ps-4 py-3 fw-bold text-muted small">#{(d.id || d._id).slice(-4).toUpperCase()}</td>
                                                    <td className="py-3">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary text-uppercase px-3 rounded-pill small fw-bold">
                                                            {d.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 fw-bold text-dark">{d.userId?.prenom || 'Nom'} {d.userId?.nom || 'Inconnu'}</td>
                                                    <td className="py-3 text-center text-muted small">
                                                        {formatDate(d.dateDemande)}
                                                    </td>
                                                    <td className="pe-4 py-3 text-end">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate('/admin/demandes?filter=en_attente'); }}
                                                            className="btn btn-primary btn-sm px-4 rounded-3 border-0"
                                                            style={{ backgroundColor: 'var(--admin-navy)' }}
                                                        >
                                                            Examiner
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
