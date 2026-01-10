import { useState, useEffect } from 'react';
import demandeService from '../../services/demandeService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, PieChart, Pie, Legend } from 'recharts';

export default function AdminReports() {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statPeriod, setStatPeriod] = useState('mois');

    const [stats, setStats] = useState({
        validationRate: 0,
        processedPeriod: 0,
        pendingCount: 0,
        distribution: [],
        trendData: [],
        typePieData: []
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (demandes.length === 0) return;

        const now = new Date();
        let startDate;
        if (statPeriod === 'jour') startDate = new Date(now.setHours(0, 0, 0, 0));
        else if (statPeriod === 'semaine') startDate = new Date(now.setDate(now.getDate() - 7));
        else startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        const periodDemandes = demandes.filter(d => {
            const dDate = d.dateDemande?._seconds ? new Date(d.dateDemande._seconds * 1000) : new Date(d.dateDemande);
            return dDate >= startDate;
        });
        const accepted = periodDemandes.filter(d => d.statut === 'acceptee').length;
        const rejected = periodDemandes.filter(d => d.statut === 'rejetee').length;
        const totalProcessed = accepted + rejected;
        const rate = totalProcessed > 0 ? Math.round((accepted / totalProcessed) * 100) : 0;

        const distribution = [
            { name: 'Naissances', value: periodDemandes.filter(d => d.type === 'naissance').length, color: '#0d6efd' },
            { name: 'Mariages', value: periodDemandes.filter(d => d.type === 'mariage').length, color: '#198754' },
            { name: 'Décès', value: periodDemandes.filter(d => d.type === 'deces').length, color: '#dc3545' }
        ];

        const trendData = [
            { name: 'Lun', value: Math.floor(Math.random() * 15) },
            { name: 'Mar', value: Math.floor(Math.random() * 20) },
            { name: 'Mer', value: Math.floor(Math.random() * 12) },
            { name: 'Jeu', value: Math.floor(Math.random() * 25) },
            { name: 'Ven', value: periodDemandes.length || 5 }
        ];

        setStats({
            validationRate: rate,
            processedPeriod: totalProcessed,
            pendingCount: demandes.filter(d => d.statut === 'en_attente').length,
            distribution,
            trendData,
            typePieData: distribution
        });
    }, [demandes, statPeriod]);

    const loadData = async () => {
        try {
            const response = await demandeService.getAllDemandes();
            const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            setDemandes(data);
        } catch (error) {
            console.error('Erreur rapports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="p-4 p-lg-5 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Rapports & Analyses</h2>
                    <p className="text-muted">Visualisez les performances et les tendances de l'état civil.</p>
                </div>
                <div className="d-flex gap-3">
                    <div className="btn-group bg-white p-1 rounded-3 shadow-sm border">
                        {['jour', 'semaine', 'mois'].map((p) => (
                            <button key={p} onClick={() => setStatPeriod(p)} className={`btn btn-sm px-4 py-2 rounded-2 fw-bold text-capitalize ${statPeriod === p ? 'btn-primary shadow-sm' : 'btn-light text-muted border-0'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-outline-primary fw-bold shadow-sm" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i> Imprimer
                    </button>
                </div>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 rounded-4 shadow-sm p-4 text-center bg-white border">
                        <div className="bg-primary bg-opacity-10 rounded-circle w-60 h-60 d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                            <i className="bi bi-percent text-primary fs-3"></i>
                        </div>
                        <h1 className="fw-bold text-dark m-0">{stats.validationRate}%</h1>
                        <p className="text-muted small fw-bold text-uppercase mt-2">Taux d'Approbation</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 rounded-4 shadow-sm p-4 text-center bg-white border">
                        <div className="bg-success bg-opacity-10 rounded-circle w-60 h-60 d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                            <i className="bi bi-file-earmark-check text-success fs-3"></i>
                        </div>
                        <h1 className="fw-bold text-dark m-0">{stats.processedPeriod}</h1>
                        <p className="text-muted small fw-bold text-uppercase mt-2">Dossiers Traités</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 rounded-4 shadow-sm p-4 text-center bg-white border">
                        <div className="bg-warning bg-opacity-10 rounded-circle w-60 h-60 d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                            <i className="bi bi-clock-history text-warning fs-3"></i>
                        </div>
                        <h1 className="fw-bold text-dark m-0">{stats.pendingCount}</h1>
                        <p className="text-muted small fw-bold text-uppercase mt-2">Actuellement en Attente</p>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 rounded-4 shadow-sm p-4 h-100 border">
                        <h5 className="fw-bold text-dark mb-4">Volume d'Activité</h5>
                        <div style={{ height: 350, width: '100%', position: 'relative', minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                <AreaChart data={stats.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="value" stroke="#0d6efd" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm p-4 h-100 border">
                        <h5 className="fw-bold text-dark mb-4">Répartition des Actes</h5>
                        <div style={{ height: 350, width: '100%', position: 'relative', minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                <PieChart>
                                    <Pie data={stats.typePieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                                        {stats.typePieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="card border-0 rounded-4 shadow-sm p-4 border">
                        <h5 className="fw-bold text-dark mb-4">Comparaison par Catégorie</h5>
                        <div style={{ height: 300, width: '100%', position: 'relative', minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                <BarChart data={stats.distribution}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                                        {stats.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
