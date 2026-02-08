import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import demandeService from '../../services/demandeService';
import userService from '../../services/userService';
import useCurrentUser from '../../hooks/useCurrentUser';
import SafeRechartsContainer from '../../components/SafeRechartsContainer';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        en_attente: 0,
        acceptee: 0,
        rejetee: 0,
        totalUsers: 0,
        countsByType: [
            { name: 'Naissance', value: 0, color: '#001a41' },
            { name: 'Mariage', value: 0, color: '#FECB00' },
            { name: 'Décès', value: 0, color: '#D21034' }
        ]
    });
    const [recentDemandes, setRecentDemandes] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [trendData, setTrendData] = useState([]);
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
        return isNaN(date.getTime()) ? "-" : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    useEffect(() => {
        loadAdminStats();
        // Auto-reload every 30 seconds instead of 5 for better performance
        const interval = setInterval(loadAdminStats, 30000);
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
                    { name: 'Naissance', value: naissance, color: '#001a41' },
                    { name: 'Mariage', value: mariage, color: '#FECB00' },
                    { name: 'Décès', value: deces, color: '#D21034' }
                ]
            });

            // Process Trend Data (Group by last 7 days)
            const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            const trendMap = {};
            const now = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const dayLabel = days[d.getDay()];
                trendMap[dayLabel] = 0;
            }

            demandes.forEach(d => {
                const date = d.dateDemande?._seconds ? new Date(d.dateDemande._seconds * 1000) : new Date(d.dateDemande);
                const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays < 7) {
                    const label = days[date.getDay()];
                    if (trendMap[label] !== undefined) trendMap[label]++;
                }
            });

            const finalTrend = Object.keys(trendMap).map(key => ({ name: key, value: trendMap[key] }));
            setTrendData(finalTrend);

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

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
    );

    return (
        <div className="p-4 p-lg-5 animate__animated animate__fadeIn">
            {/* Header Dashboard */}
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h1 className="fw-black text-dark mb-1 display-5">Tableau de Bord</h1>
                    <p className="text-muted mb-0 fs-5">Bienvenue sur votre espace de gestion centralisé.</p>
                </div>
                <div className="d-none d-md-block">
                    <div className="badge bg-white text-dark p-3 px-4 border rounded-pill shadow-sm fw-bold fs-6">
                        <i className="bi bi-calendar3 me-2 text-primary fs-5"></i>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </div>

            {/* Stats Cards Overhaul */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="premium-stat-card vibrant bg-vibrant-blue shadow-lg p-4 transition-all cursor-pointer h-100"
                        onClick={() => navigate('/admin/demandes?filter=en_attente')}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon-wrapper shadow-sm">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div>
                                <h2 className="m-0 fw-black display-6">{stats.en_attente}</h2>
                                <span className="small fw-bold text-uppercase opacity-75 tracking-wider" style={{ fontSize: '0.8rem' }}>En Attente</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="premium-stat-card vibrant bg-vibrant-green shadow-lg p-4 transition-all cursor-pointer h-100"
                        onClick={() => navigate('/admin/demandes?filter=acceptee')}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon-wrapper shadow-sm">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>
                            <div>
                                <h2 className="m-0 fw-black display-6">{stats.acceptee}</h2>
                                <span className="small fw-bold text-uppercase opacity-75 tracking-wider" style={{ fontSize: '0.8rem' }}>Approuvées</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="premium-stat-card vibrant bg-vibrant-red shadow-lg p-4 transition-all cursor-pointer h-100"
                        onClick={() => navigate('/admin/demandes?filter=rejetee')}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon-wrapper shadow-sm">
                                <i className="bi bi-x-circle-fill"></i>
                            </div>
                            <div>
                                <h2 className="m-0 fw-black display-6">{stats.rejetee}</h2>
                                <span className="small fw-bold text-uppercase opacity-75 tracking-wider" style={{ fontSize: '0.8rem' }}>Rejetées</span>
                            </div>
                        </div>
                    </div>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="col-md-3">
                        <div className="premium-stat-card vibrant bg-vibrant-sky shadow-lg p-4 transition-all cursor-pointer h-100"
                            onClick={() => navigate('/admin/utilisateurs')}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-icon-wrapper shadow-sm">
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <div>
                                    <h2 className="m-0 fw-black display-6">{stats.totalUsers}</h2>
                                    <span className="small fw-bold text-uppercase opacity-75 tracking-wider" style={{ fontSize: '0.8rem' }}>Utilisateurs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="row g-4 mb-5">
                {/* Main Activity Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 rounded-4 shadow-sm p-4" style={{ minHeight: '450px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-dark m-0">Volume des Demandes</h5>
                            <span className="badge bg-light text-muted rounded-pill px-3 py-2 fw-bold small shadow-none border">7 derniers jours</span>
                        </div>
                        <div style={{ height: '350px', width: '100%', minWidth: 0, minHeight: '350px' }}>
                            {!loading ? (
                                <SafeRechartsContainer>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#001a41" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#001a41" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dx={-10} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                                itemStyle={{ color: '#001a41', fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#001a41" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </SafeRechartsContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pie Chart Distribution */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm p-4" style={{ minHeight: '450px' }}>
                        <h5 className="fw-bold text-dark mb-4 text-center">Répartition par Type</h5>
                        <div style={{ height: '300px', width: '100%', position: 'relative', minWidth: 0, minHeight: '300px' }}>
                            {!loading ? (
                                <SafeRechartsContainer>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <PieChart>
                                            <Pie
                                                data={stats.countsByType.some(c => c.value > 0) ? stats.countsByType : [{ name: 'Aucun', value: 1, color: '#f0f0f0' }]}
                                                innerRadius={70}
                                                outerRadius={95}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {stats.countsByType.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </SafeRechartsContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            )}
                            <div className="position-absolute top-50 start-50 translate-middle text-center">
                                <div className="display-6 fw-bold text-dark">{stats.total}</div>
                                <div className="text-muted small fw-bold">TOTAL</div>
                            </div>
                        </div>
                        <div className="mt-2">
                            {stats.countsByType.map((item, idx) => (
                                <div key={idx} className="d-flex align-items-center justify-content-between mb-2 p-2 rounded-3 bg-light bg-opacity-50">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: item.color }}></div>
                                        <span className="small text-muted fw-bold">{item.name}</span>
                                    </div>
                                    <span className="fw-bold small">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-5">
                {/* Pending Demandes Table */}
                <div className={currentUser?.role === 'admin' ? "col-lg-7" : "col-12"}>
                    <div className="card border-0 rounded-4 shadow-sm h-100 overflow-hidden">
                        <div className="card-header bg-white border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold text-dark m-0">Demandes en Attente</h5>
                            <Link to="/admin/demandes?filter=en_attente" className="btn btn-dark-soft btn-sm rounded-pill px-3 fw-bold small tracking-wide">VOIR TOUT</Link>
                        </div>
                        <div className="card-body p-0 mt-3">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 border-0 small text-muted text-uppercase fw-bold py-3">ID</th>
                                            <th className="border-0 small text-muted text-uppercase fw-bold py-3">Type</th>
                                            <th className="border-0 small text-muted text-uppercase fw-bold py-3">Citoyen</th>
                                            <th className="pe-4 border-0 small text-muted text-uppercase fw-bold text-end py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentDemandes.filter(d => d.statut === 'en_attente').slice(0, 5).map(d => (
                                            <tr key={d.id || d._id} className="cursor-pointer border-bottom-faint" onClick={() => navigate('/admin/demandes?filter=en_attente')}>
                                                <td className="ps-4 py-3 fw-bold text-primary small">#{(d.id || d._id).slice(-4).toUpperCase()}</td>
                                                <td className="py-3">
                                                    <span className={`badge ${d.type === 'naissance' ? 'bg-primary' : d.type === 'mariage' ? 'bg-warning text-dark' : 'bg-danger'} bg-opacity-10 ${d.type === 'naissance' ? 'text-primary' : d.type === 'mariage' ? 'text-warning' : 'text-danger'} text-uppercase px-2 rounded-pill x-small fw-bold`}>
                                                        {d.type}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="fw-bold text-dark small">{d.userId?.prenom || "-"} {d.userId?.nom?.toUpperCase() || ""}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(d.dateDemande)}</div>
                                                </td>
                                                <td className="pe-4 py-3 text-end">
                                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold border-2 small">
                                                        Examiner
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {recentDemandes.filter(d => d.statut === 'en_attente').length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-muted fst-italic">Aucune demande en attente</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Users Table - Admin Only */}
                {currentUser?.role === 'admin' && (
                    <div className="col-lg-5">
                        <div className="card border-0 rounded-4 shadow-sm h-100 overflow-hidden">
                            <div className="card-header bg-white border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold text-dark m-0">Inscriptions Récentes</h5>
                                <Link to="/admin/utilisateurs" className="btn btn-dark-soft btn-sm rounded-pill px-3 fw-bold small tracking-wide">VOIR TOUT</Link>
                            </div>
                            <div className="card-body p-0 mt-3">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 border-0 small text-muted text-uppercase fw-bold py-3">Utilisateur</th>
                                                <th className="pe-4 border-0 small text-muted text-uppercase fw-bold text-end py-3">Inscrit le</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentUsers.map((user, idx) => (
                                                <tr key={user.id || user._id || idx} className="cursor-pointer border-bottom-faint" onClick={() => navigate('/admin/utilisateurs')}>
                                                    <td className="ps-4 py-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="avatar-initial-sm bg-primary-soft text-primary">
                                                                {user.prenom ? user.prenom[0] : (user.nom ? user.nom[0] : 'U')}
                                                            </div>
                                                            <div className="fw-bold text-dark small">{user.prenom} {user.nom?.toUpperCase()}</div>
                                                        </div>
                                                    </td>
                                                    <td className="pe-4 py-3 text-end text-muted small">{formatDate(user.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .premium-stat-card {
                    border: none;
                    border-radius: 24px;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                    backdrop-filter: blur(10px);
                }
                
                .premium-stat-card::after {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%);
                    z-index: -1;
                }

                .bg-vibrant-blue { background: linear-gradient(135deg, #001a41 0%, #00338d 100%); color: #fff; }
                .bg-vibrant-yellow { background: linear-gradient(135deg, #FECB00 0%, #f7d959 100%); color: #001a41; }
                .bg-vibrant-red { background: linear-gradient(135deg, #D21034 0%, #e64d5d 100%); color: #fff; }
                .bg-vibrant-green { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: #fff; }
                
                .stat-icon-wrapper {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                }
                
                .premium-stat-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
                }

                .premium-stat-card:hover .stat-icon-wrapper {
                    transform: rotate(10deg);
                    background: rgba(255, 255, 255, 0.3);
                }
                
                .bg-primary-soft { background: rgba(0, 26, 65, 0.1); }
                .bg-success-soft { background: rgba(16, 185, 129, 0.15); }
                .bg-warning-soft { background: rgba(254, 203, 0, 0.15); }
                .bg-danger-soft { background: rgba(210, 16, 52, 0.1); }
                
                .btn-dark-soft {
                    background: rgba(0, 26, 65, 0.05);
                    color: #001a41;
                    border: none;
                }
                .btn-dark-soft:hover {
                    background: #001a41;
                    color: #fff;
                }
                
                .avatar-initial-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 0.75rem;
                }
                
                .x-small { font-size: 0.65rem; }
                .tracking-wide { letter-spacing: 0.5px; }
                .border-bottom-faint { border-bottom: 1px solid rgba(0,0,0,0.03); }
            `}} />
        </div>
    );
}

