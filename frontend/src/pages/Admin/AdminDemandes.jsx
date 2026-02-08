import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import demandeService from '../../services/demandeService';
import { useLanguage } from '../../context/LanguageContext';
import html2pdf from 'html2pdf.js';
import exportHelper from '../../utils/exportHelper';
import { normalizeText } from '../../utils/textHelper';

export default function AdminDemandes() {
    const location = useLocation();
    const [demandes, setDemandes] = useState([]);
    const [filteredDemandes, setFilteredDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // all, naissance, mariage, deces
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { t } = useLanguage();

    const [showRejetModal, setShowRejetModal] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [motifRejet, setMotifRejet] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [notification, setNotification] = useState(null);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return "-";
        let date;
        if (dateInput && typeof dateInput === 'object' && dateInput._seconds) {
            date = new Date(dateInput._seconds * 1000);
        } else {
            date = new Date(dateInput);
        }
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filterParam = params.get('filter');
        if (filterParam && ['en_attente', 'acceptee', 'rejetee'].includes(filterParam)) {
            setFilterStatus(filterParam);
        }
        loadData();
        const interval = setInterval(loadData, 30000); // Reload every 30s instead of 2s for better performance
        return () => clearInterval(interval);
    }, [location.search]);

    useEffect(() => {
        let result = demandes.filter(d => {
            const matchesSearch =
                (d.userId?.nom && d.userId.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (d.userId?.prenom && d.userId.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (d.donnees?.nomEnfant && d.donnees.nomEnfant.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (d.donnees?.nomEpoux && d.donnees.nomEpoux.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (d.donnees?.nomDefunt && d.donnees.nomDefunt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                ((d.id || d._id) && (d.id || d._id).toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesType = filterType === 'all' || d.type === filterType;
            const matchesStatus = filterStatus === 'all' || d.statut === filterStatus;

            let matchesDate = true;
            if (startDate) {
                const start = new Date(startDate);
                const date = d.createdAt?._seconds ? new Date(d.createdAt._seconds * 1000) : new Date(d.createdAt);
                matchesDate = matchesDate && (date >= start);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                const date = d.createdAt?._seconds ? new Date(d.createdAt._seconds * 1000) : new Date(d.createdAt);
                matchesDate = matchesDate && (date <= end);
            }

            return matchesSearch && matchesType && matchesStatus && matchesDate;
        });
        setFilteredDemandes(result);
    }, [demandes, filterType, filterStatus, searchTerm, startDate, endDate]);

    const loadData = async () => {
        try {
            const response = await demandeService.getAllDemandes();
            const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            setDemandes(data);
            if (loading) setLoading(false);
        } catch (error) {
            console.error('Erreur chargement:', error);
        }
    };

    const handleApprove = async (demande) => {
        if (!window.confirm('Voulez-vous vraiment valider cet acte ?')) return;
        try {
            setActionLoading(true);
            await demandeService.updateStatut(demande.id || demande._id, 'acceptee');
            await loadData();
            showToast('Acte validé avec succès !', 'success');
        } catch (error) {
            showToast('Erreur: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openRejetModal = (demande) => {
        setSelectedDemande(demande);
        setMotifRejet("");
        setShowRejetModal(true);
    };

    const handleRejet = async () => {
        if (!motifRejet) return showToast('Le motif est requis', 'error');
        try {
            setActionLoading(true);
            await demandeService.updateStatut(selectedDemande.id || selectedDemande._id, 'rejetee', motifRejet);
            setShowRejetModal(false);
            loadData();
            showToast('Demande rejetée.', 'success');
        } catch (error) {
            showToast('Erreur: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDetails = (demande) => {
        setSelectedDemande(demande);
        setShowDetailsModal(true);
    };

    const handleDownloadPDF = (demande) => {
        const themeColor = d => d.type === 'naissance' ? '#004aad' : d.type === 'mariage' ? '#198754' : '#d21034';
        const typeLabelFr = d => d.type === 'naissance' ? 'NAISSANCE' : d.type === 'mariage' ? 'MARIAGE' : 'DÉCÈS';
        const typeLabelAr = d => d.type === 'naissance' ? 'الولادة' : d.type === 'mariage' ? 'الزواج' : 'الوفاة';

        const element = document.createElement('div');
        element.style.width = '800px';

        const publicUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
        const verifyUrl = `${publicUrl}/verifier-acte/${demande.id || demande._id}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

        const renderContent = d => {
            const row = (labelFr, labelAr, value) => `
                <div style="display: flex; border-bottom: 1px solid #f0f0f0; padding: 4px 0; font-size: 11px; align-items: center;">
                    <div style="width: 30%; text-align: left; padding-left: 5px;">
                        <span style="font-weight: bold; color: #333; font-size: 10px; text-transform: uppercase;">${labelFr}</span>
                    </div>
                    <div style="width: 45%; text-align: center; font-weight: bold; color: #000; font-size: 12px;">
                        ${normalizeText(value) || '-'}
                    </div>
                    <div style="width: 25%; text-align: right; padding-right: 8px;">
                        <span style="font-weight: bold; color: #333; font-size: 13px;">${labelAr}</span>
                    </div>
                </div>
            `;

            const sectionTitle = (fr, ar) => `
                <div style="margin: 10px 0 5px 0; border-bottom: 2px solid ${themeColor(d)}; padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: bold; color: ${themeColor(d)}; font-size: 11px;">${fr.toUpperCase()}</span>
                    <span style="font-weight: bold; color: ${themeColor(d)}; font-size: 15px;">${ar}</span>
                </div>
            `;

            if (d.type === 'naissance') {
                return `
                    ${sectionTitle("Informations de l'Enfant", "معلومات الطفل")}
                    ${row("NOM", "اللقب", d.donnees.nomEnfant.toUpperCase())}
                    ${row("PRÉNOMS", "الاسم", d.donnees.prenomEnfant.toUpperCase())}
                    ${row("SEXE", "الجنس", d.donnees.sexeEnfant === 'M' ? 'Masculin / ذكر' : 'Féminin / أنثى')}
                    ${row("DATE DE NAISSANCE", "تاريخ الميلاد", new Date(d.donnees.dateNaissanceEnfant).toLocaleDateString('fr-FR'))}
                    ${row("LIEU DE NAISSANCE", "مكان الميلاد", d.donnees.lieuNaissanceEnfant)}
                    
                    ${sectionTitle("Informations du Père", "معلومات الأب")}
                    ${row("NOM", "اللقب", d.donnees.nomPere.toUpperCase())}
                    ${row("PRÉNOMS", "الاسم", d.donnees.prenomPere.toUpperCase())}
                    ${row("NNI", "الرقم الوطني", d.donnees.nniPere || '-')}
                    ${row("NÉ LE", "ولد في", d.donnees.dateNaissancePere ? new Date(d.donnees.dateNaissancePere).toLocaleDateString('fr-FR') : '-')}
                    ${row("À", "في", d.donnees.lieuNaissancePere)}
                    ${row("NATIONALITÉ", "الجنسية", d.donnees.nationalitePere)}
                    ${row("PROFESSION", "المهنة", d.donnees.professionPere)}
                    ${row("DOMICILE", "السكن", d.donnees.domicilePere)}
                    
                    ${sectionTitle("Informations de la Mère", "معلومات الأم")}
                    ${row("NOM", "اللقب", d.donnees.nomMere.toUpperCase())}
                    ${row("PRÉNOMS", "الاسم", d.donnees.prenomMere.toUpperCase())}
                    ${row("NÉE LE", "ولدت في", d.donnees.dateNaissanceMere ? new Date(d.donnees.dateNaissanceMere).toLocaleDateString('fr-FR') : '-')}
                    ${row("À", "في", d.donnees.lieuNaissanceMere)}
                    ${row("NATIONALITÉ", "الجنسية", d.donnees.nationaliteMere)}
                    ${row("PROFESSION", "المهنة", d.donnees.professionMere)}
                    ${row("DOMICILE", "السكن", d.donnees.domicileMere)}
                `;
            }
            if (d.type === 'mariage') {
                return `
                    ${sectionTitle("Informations de l'Époux", "معلومات الزوج")}
                    ${row("NOM", "اللقب", d.donnees.nomEpoux.toUpperCase())}
                    ${row("PRÉNOMS", "الاسم", d.donnees.prenomEpoux.toUpperCase())}
                    ${row("NE LE", "تاريخ الميلاد", `${d.donnees.dateNaissanceEpoux ? new Date(d.donnees.dateNaissanceEpoux).toLocaleDateString('fr-FR') : '-'} à ${d.donnees.lieuNaissanceEpoux || '-'}`)}
                    ${row("TÉMOINS", "الشهود", `${d.donnees.temoin1Epoux} & ${d.donnees.temoin2Epoux}`)}
                    ${row("NATIONALITÉ", "الجنسية", d.donnees.nationaliteEpoux)}
                    ${row("PROFESSION", "المهنة", d.donnees.professionEpoux)}
                    ${row("DOMICILE", "السكن", d.donnees.domicileEpoux)}
                    
                    ${sectionTitle("Informations de l'Épouse", "معلومات الزوجة")}
                    ${row("NOM", "اللقب", d.donnees.nomEpouse.toUpperCase())}
                    ${row("PRÉNOMS", "الاسم", d.donnees.prenomEpouse.toUpperCase())}
                    ${row("NEE LE", "تاريخ الميلاد", `${d.donnees.dateNaissanceEpouse ? new Date(d.donnees.dateNaissanceEpouse).toLocaleDateString('fr-FR') : '-'} à ${d.donnees.lieuNaissanceEpouse || '-'}`)}
                    ${row("TÉMOINS", "الشهود", `${d.donnees.temoin1Epouse} & ${d.donnees.temoin2Epouse}`)}
                    ${row("NATIONALITÉ", "الجنسية", d.donnees.nationaliteEpouse)}
                    ${row("PROFESSION", "المهنة", d.donnees.professionEpouse)}
                    ${row("DOMICILE", "السكن", d.donnees.domicileEpouse)}
                    
                    ${sectionTitle("Détails de l'Union & Dot", "تفاصيل الزواج والمهر")}
                    ${row("MARIAGE", "تاريخ الزواج", `${new Date(d.donnees.dateMariage).toLocaleDateString('fr-FR')} à ${d.donnees.lieuMariage}`)}
                    ${row("RÉGIME", "النظام الزوجي", d.donnees.regimeMatrimonial ? d.donnees.regimeMatrimonial.replace('_', ' ').toUpperCase() : '-')}
                    ${row("DOT", "المهر", `${d.donnees.dotMontant} - ${d.donnees.dotConditions || 'Sans conditions'}`)}
                `;
            }
            if (d.type === 'deces') {
                return `
                    ${sectionTitle("Informations sur le Défunt", "معلومات عن المتوفى")}
                    ${row("NOM", "اللقب", d.donnees.nomDefunt.toUpperCase())}
                    ${row("PRÉNOMS", "الاسم", d.donnees.prenomDefunt.toUpperCase())}
                    ${row("SEXE", "الجنس", d.donnees.sexeDefunt === 'M' ? 'Masculin / ذكر' : 'Féminin / أنثى')}
                    ${row("REFERENCE NNI", "الرقم الوطني", d.donnees.nniDefunt)}
                    ${row("NAISSANCE", "ولد في", `${d.donnees.dateNaissanceDefunt ? new Date(d.donnees.dateNaissanceDefunt).toLocaleDateString('fr-FR') : '-'} à ${d.donnees.lieuNaissanceDefunt || '-'}`)}
                    ${row("PARENTS", "الوالدين", `${d.donnees.pereDefunt} & ${d.donnees.mereDefunt}`)}
                    ${row("NATIONALITÉ", "الجنسية", d.donnees.nationaliteDefunt)}
                    ${row("DÉCÈS", "تاريخ الوفاة", `${new Date(d.donnees.dateDeces).toLocaleDateString('fr-FR')} à ${d.donnees.lieuDeces}`)}
                    ${row("CAUSE", "سبب الوفاة", d.donnees.causeDeces || 'Non spécifiée')}
                    
                    ${sectionTitle("Informations sur le Déclarant", "معلومات عن المبلغ")}
                    ${row("NOM COMPLET", "الاسم بالكامل", `${d.donnees.nomDeclarant.toUpperCase()} ${d.donnees.prenomDeclarant}`)}
                    ${row("LIEN / DOMICILE", "القرابة / السكن", `${d.donnees.lienParente} / ${d.donnees.domicileDeclarant}`)}
                `;
            }
            return '';
        };

        element.innerHTML = `
            <div style="width: 800px; height: 1115px; background: white; overflow: hidden; position: relative; box-sizing: border-box;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 3px solid #004aad; margin: 12px; padding: 12px; font-family: 'Times New Roman', Times, serif; color: #1a1a1a; display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden;">
                
                    <!-- Watermark -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.04; z-index: 0; width: 500px; text-align: center; pointer-events: none;">
                        <img src="/logomairie.png" style="width: 100%;" alt=""/>
                        <h1 style="font-size: 60px; margin: 0; color: #000;">OFFICIEL</h1>
                    </div>

                    <!-- Header Bilingue Symétrique -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 3px double #004aad; padding-bottom: 8px; position: relative; z-index: 1;">
                        <div style="text-align: left; width: 25%;">
                            <img src="/drapeau-tchad.jpg" style="width: 70px; object-fit: contain; border-radius: 4px;" alt="Drapeau"/>
                        </div>
                        <div style="text-align: center; width: 50%;">
                            <strong style="font-size: 13px; color: #004aad; display: block; margin-bottom: 2px; letter-spacing: 0.5px;">RÉPUBLIQUE DU TCHAD</strong>
                            <span style="font-size: 8px; font-style: italic; display: block; margin-bottom: 4px;">Unité - Travail - Progrès</span>
                            
                            <strong style="font-size: 15px; color: #004aad; display: block; margin-bottom: 2px;">جمهورية تشاد</strong>
                            <span style="font-size: 10px; display: block;">وحدة - عمل - تقدم</span>
                        </div>
                        <div style="text-align: right; width: 25%;">
                            <img src="/logomairie.png" style="width: 65px; object-fit: contain;" alt="Logo Mairie"/>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; border-bottom: 1px solid #eee; padding-bottom: 8px; position: relative; z-index: 1;">
                        <div style="width: 40%; text-align: left;">
                            <h1 style="color: ${themeColor(demande)}; font-size: 16px; margin: 0; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px;">
                                ACTE DE ${typeLabelFr(demande)}
                            </h1>
                        </div>
                        <div style="width: 25%; text-align: center;">
                            <div style="border: 1px solid #ddd; padding: 2px 4px; background: #fdfdfd; border-radius: 3px;">
                                <span style="font-size: 8px; color: #666; display: block; text-transform: uppercase;">N° Registre</span>
                                <span style="font-size: 10px; color: #000; font-weight: bold;">
                                    ${(demande.id || demande._id).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div style="width: 35%; text-align: right;">
                            <h2 style="color: ${themeColor(demande)}; font-size: 18px; margin: 0; font-weight: bold;">
                                شهادة ${typeLabelAr(demande)}
                            </h2>
                        </div>
                    </div>

                    <div style="margin: 0 5px; position: relative; z-index: 1; flex: 1; overflow: hidden;">
                        ${renderContent(demande)}
                    </div>

                    <!-- Signature et QR Code -->
                    <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 5px; position: relative; z-index: 1;">
                        <div style="text-align: center; width: 120px;">
                            <div style="padding: 2px; border: 1px solid #eee; background: white; display: inline-block;">
                                <img src="${qrCodeUrl}" style="width: 65px; height: 65px;" alt="QR Code"/>
                            </div>
                            <p style="font-size: 6px; color: #999; margin-top: 2px; font-weight: bold; letter-spacing: 0.3px;">AUTHENTIFICATION SIGEC</p>
                        </div>
                        
                        <div style="text-align: center; width: 250px; border-top: 1.5px solid #1a1a1a; padding-top: 5px;">
                            <p style="margin: 0; font-weight: bold; font-size: 11px;">Fait à Abéché, le ${new Date().toLocaleDateString('fr-FR')}</p>
                            <p style="margin: 4px 0 20px 0; font-weight: bold; font-size: 11px;">L'Officier de l'État Civil / ضابط الحالة المدنية</p>
                            <div style="display: flex; justify-content: center; align-items: center; gap: 15px; opacity: 0.5;">
                                <span style="font-size: 9px; font-style: italic;">[Signature]</span>
                                <div style="width: 45px; height: 45px; border: 1.5px dashed #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #ccc;">Sceau</div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Discret -->
                    <div style="margin-top: 10px; text-align: center; font-size: 7px; color: #aaa; border-top: 1px solid #f9f9f9; padding-top: 5px; position: relative; z-index: 1;">
                        RÉPUBLIQUE DU TCHAD • SYSTÈME DE GESTION DE L'ÉTAT CIVIL (SIGEC) • DOCUMENT OFFICIEL INFALSIFIABLE
                    </div>
                </div>
            </div>
        `;

        const opt = {
            margin: 0,
            filename: `ACTE_${typeLabelFr(demande)}_${(demande.id || demande._id).slice(-6)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        try {
            html2pdf().set(opt).from(element).save();
            showToast('Génération du PDF lancée...', 'success');
        } catch (err) {
            console.error('PDF Error:', err);
            showToast('Erreur lors de la génération PDF', 'danger');
        }
    };


    const handleExport = () => {
        const formattedData = exportHelper.formatDemandesForExport(filteredDemandes);
        const success = exportHelper.exportToExcel(formattedData, 'Demandes_SIGEC', 'Demandes');
        if (success) showToast('Export réussi !', 'success');
        else showToast('Erreur lors de l\'export', 'error');
    };

    // Helper pour formater les dates YYYY-MM-DD en DD/MM/YYYY
    const formatDateString = (dateStr) => {
        if (!dateStr) return "Non renseignée";
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR');
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="p-4 p-lg-5 animate__animated animate__fadeIn">
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden mb-5"
                style={{ background: 'linear-gradient(135deg, #004aad 0%, #002d6a 100%)' }}>
                <div className="card-body p-5 text-white position-relative">
                    <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                        <div className="col-lg-8">
                            <h1 className="fw-bold mb-3 display-5">Gestion des Demandes</h1>
                            <p className="text-white-50 mb-0 fs-5">Examen et validation officielle des actes d'état civil.</p>
                        </div>
                    </div>
                </div>
            </div>

            {notification && (
                <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} border-0 shadow-sm rounded-4 mb-4 fade show d-flex align-items-center`}>
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div className="fw-bold">{notification.message}</div>
                </div>
            )}

            {/* Filters and Search Section */}
            <div className="bg-white p-3 rounded-4 shadow-sm mb-4 d-flex flex-wrap gap-3 align-items-center border border-light">
                <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou ID..."
                        className="form-control rounded-pill ps-5 border-light bg-light shadow-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="d-flex gap-2">
                    <select
                        className="form-select rounded-pill border-light bg-light shadow-none px-4"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Tous les types</option>
                        <option value="naissance">Naissances</option>
                        <option value="mariage">Mariages</option>
                        <option value="deces">Décès</option>
                    </select>

                    <select
                        className="form-select rounded-pill border-light bg-light shadow-none px-4"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="acceptee">Acceptées</option>
                        <option value="rejetee">Rejetées</option>
                    </select>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <label className="small fw-bold text-muted">Du :</label>
                    <input type="date" className="form-control form-control-sm border-0 bg-light rounded-pill px-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="d-flex align-items-center gap-2">
                    <label className="small fw-bold text-muted">Au :</label>
                    <input type="date" className="form-control form-control-sm border-0 bg-light rounded-pill px-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                {(startDate || endDate) && (
                    <button className="btn btn-sm btn-link text-danger p-0 fw-bold text-decoration-none" onClick={() => { setStartDate(''); setEndDate(''); }}>
                        Effacer les dates
                    </button>
                )}

                <div className="ms-auto">
                    <button className="btn btn-light rounded-pill px-4 border shadow-none d-flex align-items-center gap-2" onClick={loadData}>
                        <i className="bi bi-arrow-clockwise"></i>
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Stats Summary Line */}
            <div className="mb-4 d-flex gap-2">
                <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                    {filteredDemandes.length} résultat(s) trouvé(s)
                </span>
                <button onClick={handleExport} className="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center gap-2 fw-bold">
                    <i className="bi bi-file-earmark-excel-fill"></i>
                    Exporter (.xlsx)
                </button>
            </div>

            <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 border-0">
                        <thead className="bg-light">
                            <tr className="fw-bold text-uppercase border-bottom text-secondary" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                                <th className="ps-4 py-4">RÉF</th>
                                <th className="py-4">TYPE</th>
                                <th className="py-4">CITOYEN</th>
                                <th className="py-4">DATE</th>
                                <th className="py-4">STATUT</th>
                                <th className="text-end pe-4 py-4">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filteredDemandes.map(d => (
                                <tr key={d.id || d._id} className="border-bottom">
                                    <td className="ps-4 py-4 fw-bold text-dark font-monospace" style={{ fontSize: '1rem' }}>
                                        #{(d.id || d._id).slice(-8).toUpperCase()}
                                    </td>
                                    <td className="py-4">
                                        <span className={`badge px-3 py-2 bg-opacity-10 text-capitalize fw-bold rounded-3 ${d.type === 'naissance' ? 'bg-primary text-primary' : d.type === 'mariage' ? 'bg-success text-success' : 'bg-danger text-danger'}`} style={{ fontSize: '0.85rem' }}>
                                            {d.type === 'deces' ? 'Décès' : d.type}
                                        </span>
                                    </td>
                                    <td className="py-4 fw-bold text-dark" style={{ fontSize: '1rem' }}>
                                        {d.userId?.prenom || "-"} {d.userId?.nom?.toUpperCase() || ""}
                                    </td>
                                    <td className="py-4 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{formatDate(d.dateDemande)}</td>
                                    <td className="py-4">
                                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${d.statut === 'en_attente' ? 'bg-warning text-dark' : d.statut === 'acceptee' ? 'bg-success text-white' : 'bg-danger text-white'}`} style={{ fontSize: '0.85rem' }}>
                                            {d.statut === 'en_attente' ? 'En attente' : d.statut === 'acceptee' ? 'Acceptée' : 'Rejetée'}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4 py-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button className="btn btn-sm btn-outline-secondary border-0 bg-light rounded-3 px-3" onClick={() => handleDetails(d)} title="Détails">
                                                <i className="bi bi-eye fs-6"></i>
                                            </button>
                                            {d.statut === 'en_attente' && (
                                                <button className="btn btn-sm btn-primary rounded-3 px-3 shadow-sm" onClick={() => handleApprove(d)} disabled={actionLoading} title="Approuver">
                                                    <i className="bi bi-check-lg fs-6"></i>
                                                </button>
                                            )}
                                            {d.statut === 'acceptee' && (
                                                <button className="btn btn-sm btn-success rounded-3 px-3 shadow-sm" onClick={() => handleDownloadPDF(d)} title="Télécharger">
                                                    <i className="bi bi-download fs-6"></i>
                                                </button>
                                            )}
                                            {d.statut === 'en_attente' && (
                                                <button className="btn btn-sm btn-danger rounded-3 px-3 shadow-sm" onClick={() => openRejetModal(d)} title="Rejeter">
                                                    <i className="bi bi-x-lg fs-6"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredDemandes.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Aucune demande</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals... (Gardés identiques mais simplifiés) */}
            {showRejetModal && (
                <div className="modal show d-block shadow-lg animate__animated animate__zoomIn" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 bg-danger text-white rounded-top-4">
                                <h5 className="modal-title fw-bold">Rejeter la demande</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRejetModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <label className="fw-bold mb-2">Motif du rejet</label>
                                <textarea className="form-control border-0 bg-light" rows="4" value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)} placeholder="Précisez la raison du rejet..."></textarea>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-light rounded-3" onClick={() => setShowRejetModal(false)}>Annuler</button>
                                <button className="btn btn-danger rounded-3 px-4 shadow-sm" onClick={handleRejet} disabled={actionLoading}>Confirmer le Rejet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedDemande && (
                <div className="modal show d-block animate__animated animate__fadeInUp" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-bottom p-4 bg-light">
                                <h4 className="fw-bold m-0 text-primary">Extrait de Demande</h4>
                                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-4 h-100">
                                            <h6 className="text-primary fw-bold text-uppercase small mb-3">Métadonnées</h6>
                                            <DetailRow label="Référence" value={selectedDemande.id.toUpperCase()} />
                                            <DetailRow label="Type d'acte" value={selectedDemande.type.toUpperCase()} />
                                            <DetailRow label="Date de demande" value={formatDate(selectedDemande.dateDemande)} />
                                            <DetailRow label="Statut actuel" value={selectedDemande.statut.replace('_', ' ')} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-4 bg-white border rounded-4 h-100 shadow-sm position-relative overflow-hidden">
                                            <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                                <i className="bi bi-person-circle display-1 text-primary"></i>
                                            </div>
                                            <h6 className="text-primary fw-bold text-uppercase small mb-3">Demandeur (Compte Citoyen)</h6>

                                            <div className="mb-2">
                                                <span className="text-muted small d-block">Nom complet</span>
                                                <span className="fw-bold fs-5 text-dark">
                                                    {selectedDemande.userId?.prenom ? `${selectedDemande.userId.prenom} ${selectedDemande.userId.nom.toUpperCase()}` : "Admin (Guichet)"}
                                                </span>
                                            </div>

                                            <div className="mb-2">
                                                <span className="text-muted small d-block">Email de notification</span>
                                                {selectedDemande.userId?.email ? (
                                                    <div className="d-flex align-items-center gap-2 text-success fw-bold">
                                                        <i className="bi bi-check-circle-fill"></i>
                                                        {selectedDemande.userId.email}
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center gap-2 text-warning fw-bold">
                                                        <i className="bi bi-exclamation-triangle-fill"></i>
                                                        Non renseigné
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 pt-3 border-top">
                                                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2 rounded-pill">
                                                    <i className="bi bi-bell-fill me-2"></i>
                                                    Prêt à recevoir les notifications
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <h6 className="text-primary fw-bold text-uppercase small mb-3">Détails de l'acte</h6>

                                        {selectedDemande.type === 'naissance' && (
                                            <>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-person-fill me-2"></i>L'Enfant</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nom</span>: <span className="fw-bold">{selectedDemande.donnees.nomEnfant?.toUpperCase()}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Prénoms</span>: <span className="fw-bold">{selectedDemande.donnees.prenomEnfant}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Sexe</span>: <span className="fw-bold">{selectedDemande.donnees.sexeEnfant}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Date de Naissance</span>: <span className="fw-bold">{formatDateString(selectedDemande.donnees.dateNaissanceEnfant)}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Heure</span>: <span className="fw-bold">{selectedDemande.donnees.heureNaissanceEnfant || "Non renseignée"}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lieu</span>: <span className="fw-bold">{selectedDemande.donnees.lieuNaissanceEnfant}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-gender-male me-2"></i>Le Père</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nom</span>: <span className="fw-bold">{selectedDemande.donnees.nomPere?.toUpperCase()}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Prénoms</span>: <span className="fw-bold">{selectedDemande.donnees.prenomPere}</span></div>
                                                        <div className="col-md-12 border-bottom py-2"><span className="text-muted">NNI</span>: <span className="fw-bold">{selectedDemande.donnees.pere?.nni || "Non renseigné"}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Date Naissance</span>: <span className="fw-bold">{formatDateString(selectedDemande.donnees.dateNaissancePere)}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lieu Naissance</span>: <span className="fw-bold">{selectedDemande.donnees.lieuNaissancePere}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nationalité</span>: <span className="fw-bold">{selectedDemande.donnees.nationalitePere}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Profession</span>: <span className="fw-bold">{selectedDemande.donnees.professionPere}</span></div>
                                                        <div className="col-12 border-bottom py-2"><span className="text-muted">Domicile</span>: <span className="fw-bold">{selectedDemande.donnees.domicilePere}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-gender-female me-2"></i>La Mère</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nom</span>: <span className="fw-bold">{selectedDemande.donnees.nomMere?.toUpperCase()}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Prénoms</span>: <span className="fw-bold">{selectedDemande.donnees.prenomMere}</span></div>
                                                        <div className="col-md-12 border-bottom py-2"><span className="text-muted">NNI</span>: <span className="fw-bold">{selectedDemande.donnees.mere?.nni || "Non renseigné"}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Date Naissance</span>: <span className="fw-bold">{formatDateString(selectedDemande.donnees.dateNaissanceMere)}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lieu Naissance</span>: <span className="fw-bold">{selectedDemande.donnees.lieuNaissanceMere}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nationalité</span>: <span className="fw-bold">{selectedDemande.donnees.nationaliteMere}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Profession</span>: <span className="fw-bold">{selectedDemande.donnees.professionMere}</span></div>
                                                        <div className="col-12 border-bottom py-2"><span className="text-muted">Domicile</span>: <span className="fw-bold">{selectedDemande.donnees.domicileMere}</span></div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedDemande.type === 'mariage' && (
                                            <>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-calendar-heart me-2"></i>Détails du Mariage & Dot</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Date</span>: <span className="fw-bold">{formatDateString(selectedDemande.donnees.dateMariage)}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lieu</span>: <span className="fw-bold">{selectedDemande.donnees.lieuMariage}</span></div>
                                                        <div className="col-12 border-bottom py-2"><span className="text-muted">Régime Matrimonial</span>: <span className="fw-bold text-capitalize">{selectedDemande.donnees.regimeMatrimonial?.replace('_', ' ')}</span></div>
                                                        <div className="col-md-6 border-bottom py-2 text-success fw-bold"><span className="text-muted">Montant Dot</span>: {selectedDemande.donnees.dotMontant}</div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Conditions Dot</span>: {selectedDemande.donnees.dotConditions || "-"}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-gender-male me-2"></i>L'Époux</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nom</span>: <span className="fw-bold">{selectedDemande.donnees.nomEpoux?.toUpperCase()}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Prénoms</span>: <span className="fw-bold">{selectedDemande.donnees.prenomEpoux}</span></div>
                                                        <div className="col-md-12 border-bottom py-2"><span className="text-muted">Témoins</span>: <span className="fw-bold">{selectedDemande.donnees.temoin1Epoux} & {selectedDemande.donnees.temoin2Epoux}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Date Naissance</span>: <span className="fw-bold">{formatDateString(selectedDemande.donnees.dateNaissanceEpoux)}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lieu Naissance</span>: <span className="fw-bold">{selectedDemande.donnees.lieuNaissanceEpoux}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nationalité</span>: <span className="fw-bold">{selectedDemande.donnees.nationaliteEpoux}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Profession</span>: <span className="fw-bold">{selectedDemande.donnees.professionEpoux}</span></div>
                                                        <div className="col-12 border-bottom py-2"><span className="text-muted">Domicile</span>: <span className="fw-bold">{selectedDemande.donnees.domicileEpoux}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-gender-female me-2"></i>L'Épouse</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nom</span>: <span className="fw-bold">{selectedDemande.donnees.nomEpouse?.toUpperCase()}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Prénoms</span>: <span className="fw-bold">{selectedDemande.donnees.prenomEpouse}</span></div>
                                                        <div className="col-md-12 border-bottom py-2"><span className="text-muted">Témoins</span>: <span className="fw-bold">{selectedDemande.donnees.temoin1Epouse} & {selectedDemande.donnees.temoin2Epouse}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Date Naissance</span>: <span className="fw-bold">{formatDateString(selectedDemande.donnees.dateNaissanceEpouse)}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lieu Naissance</span>: <span className="fw-bold">{selectedDemande.donnees.lieuNaissanceEpouse}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nationalité</span>: <span className="fw-bold">{selectedDemande.donnees.nationaliteEpouse}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Profession</span>: <span className="fw-bold">{selectedDemande.donnees.professionEpouse}</span></div>
                                                        <div className="col-12 border-bottom py-2"><span className="text-muted">Domicile</span>: <span className="fw-bold">{selectedDemande.donnees.domicileEpouse}</span></div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedDemande.type === 'deces' && (
                                            <>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-person-x-fill me-2"></i>Le Défunt</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nom</span>: <span className="fw-bold">{selectedDemande.donnees.nomDefunt?.toUpperCase()}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Prénoms</span>: <span className="fw-bold">{selectedDemande.donnees.prenomDefunt}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Sexe</span>: <span className="fw-bold">{selectedDemande.donnees.sexeDefunt}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">NNI</span>: <span className="fw-bold">{selectedDemande.donnees.nniDefunt || "Non renseigné"}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Date Naissance</span>: <span className="fw-bold">{formatDateString(selectedDemande.donnees.dateNaissanceDefunt)}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lieu Naissance</span>: <span className="fw-bold">{selectedDemande.donnees.lieuNaissanceDefunt}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Fils de (Père)</span>: <span className="fw-bold">{selectedDemande.donnees.pereDefunt}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Et de (Mère)</span>: <span className="fw-bold">{selectedDemande.donnees.mereDefunt}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nationalité</span>: <span className="fw-bold">{selectedDemande.donnees.nationaliteDefunt}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Profession</span>: <span className="fw-bold">{selectedDemande.donnees.professionDefunt || "Non renseignée"}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-info-circle-fill me-2"></i>Détails du Décès</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Date</span>: <span className="fw-bold">{formatDateString(selectedDemande.donnees.dateDeces)}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lieu</span>: <span className="fw-bold">{selectedDemande.donnees.lieuDeces}</span></div>
                                                        <div className="col-12 border-bottom py-2"><span className="text-muted">Cause</span>: <span className="fw-bold">{selectedDemande.donnees.causeDeces}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-person-fill me-2"></i>Le Déclarant</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Nom</span>: <span className="fw-bold">{selectedDemande.donnees.nomDeclarant?.toUpperCase()}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Prénoms</span>: <span className="fw-bold">{selectedDemande.donnees.prenomDeclarant}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Lien parenté</span>: <span className="fw-bold">{selectedDemande.donnees.lienParente}</span></div>
                                                        <div className="col-md-6 border-bottom py-2"><span className="text-muted">Domicile</span>: <span className="fw-bold">{selectedDemande.donnees.domicileDeclarant}</span></div>
                                                    </div>
                                                </div>
                                                {selectedDemande.donnees.piecesJointes && selectedDemande.donnees.piecesJointes.length > 0 && (
                                                    <div className="bg-light p-4 rounded-4 shadow-inner mt-3">
                                                        <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-paperclip me-2"></i>Pièces Justificatives</h6>
                                                        <div className="row g-3">
                                                            {selectedDemande.donnees.piecesJointes.map((pic, idx) => (
                                                                <div key={idx} className="col-md-6 col-lg-4">
                                                                    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                                                                        <img
                                                                            src={pic}
                                                                            alt={`Document ${idx + 1}`}
                                                                            className="img-fluid"
                                                                            style={{ height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                                                            onClick={() => window.open(pic, '_blank')}
                                                                        />
                                                                        <div className="p-2 text-center small text-muted">Document {idx + 1}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 bg-light">
                                <button className="btn btn-primary rounded-pill px-5 fw-bold" onClick={() => setShowDetailsModal(false)}>Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const DetailRow = ({ label, value }) => (
    <div className="mb-3">
        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">{label}</label>
        <div className="fw-bold text-dark">{value}</div>
    </div>
);
