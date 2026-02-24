import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import demandeService from '../../services/demandeService';
import { useLanguage } from '../../context/LanguageContext';
import html2pdf from 'html2pdf.js';
import exportHelper from '../../utils/exportHelper';
import { normalizeText, formatName } from '../../utils/textHelper';
import Tesseract from 'tesseract.js';
import { toast } from 'react-hot-toast';

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
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [notification, setNotification] = useState(null);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const formatName = (nom, prenom) => {
        if (!nom && !prenom) return "-";
        const formatStr = (str) => str ? str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "";
        const n = formatStr(nom);
        const p = formatStr(prenom);
        return `${n} ${p}`.trim();
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
        setEditData({ ...demande.donnees });
        setIsEditing(false);
        setShowDetailsModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            setActionLoading(true);
            await demandeService.updateDemande(selectedDemande?.id || selectedDemande?._id, editData);
            await loadData();
            setIsEditing(false);
            setSelectedDemande({ ...selectedDemande, donnees: editData });
            showToast('Modifications enregistrées !', 'success');
        } catch (error) {
            showToast('Erreur: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExport = () => {
        try {
            if (!filteredDemandes || filteredDemandes.length === 0) {
                return showToast('Aucune donnée à exporter', 'info');
            }
            const dataToExport = exportHelper.formatDemandesForExport(filteredDemandes);
            const success = exportHelper.exportToExcel(dataToExport, 'Demandes_SIGEC', 'Demandes');
            if (success) {
                showToast('Export réussi !', 'success');
            } else {
                showToast('Erreur lors de l\'export', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            showToast('Erreur lors de l\'export', 'error');
        }
    };

    const [ocrLoading, setOcrLoading] = useState({});

    const handleOCR = async (imagePath, key) => {
        setOcrLoading(prev => ({ ...prev, [key]: true }));
        try {
            const { data: { text } } = await Tesseract.recognize(imagePath, 'fra+eng', {
                logger: m => console.log(m)
            });

            // Regex pour trouver une séquence de 10 à 15 chiffres (format typique du NNI)
            const nniMatch = text.match(/\b\d{10,15}\b/);

            if (nniMatch) {
                setEditData(prev => ({ ...prev, [key]: nniMatch[0] }));
                toast.success(`Numéro détecté : ${nniMatch[0]}`);
            } else {
                toast.error("Impossible de détecter un numéro NNI valide. Veuillez le saisir manuellement.");
            }
        } catch (error) {
            console.error("Erreur OCR:", error);
            toast.error("Erreur lors de la lecture de l'image");
        } finally {
            setOcrLoading(prev => ({ ...prev, [key]: false }));
        }
    };


    const renderField = (label, value, key) => {
        const isDate = key.toLowerCase().includes('date');
        const isTime = key.toLowerCase().includes('heure');
        const isSexe = key.toLowerCase().includes('sexe');
        const isNationalite = key.toLowerCase().includes('nationalite');
        const isRegime = key === 'regimeMatrimonial';
        const isImage = typeof value === 'string' && value.startsWith('data:image/');

        // Stabiliser la valeur pour éviter les nœuds texte orphelins
        const displayValue = value || "-";

        return (
            <div className="col-md-6 border-bottom py-3 d-flex align-items-center" key={key}>
                <span className="text-muted fw-bold" style={{ minWidth: '130px' }}>{label}</span>
                <span className="mx-2">:</span>
                <div className="flex-grow-1 d-flex flex-column">
                    {isEditing ? (
                        isSexe ? (
                            <select
                                className="form-select form-select-sm border-primary shadow-none"
                                value={editData[key] || ''}
                                onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                            >
                                <option value="M">Masculin (M)</option>
                                <option value="F">Féminin (F)</option>
                            </select>
                        ) : isNationalite ? (
                            <select
                                className="form-select form-select-sm border-primary shadow-none"
                                value={editData[key] || ''}
                                onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                            >
                                <option value="TCHADIENNE">TCHADIENNE</option>
                                <option value="AUTRE">AUTRE</option>
                            </select>
                        ) : isRegime ? (
                            <select
                                className="form-select form-select-sm border-primary shadow-none"
                                value={editData[key] || ''}
                                onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                            >
                                <option value="monogamie">Monogamie</option>
                                <option value="polygamie">Polygamie</option>
                            </select>
                        ) : (
                            <>
                                {isImage && (
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <img src={value} alt={label} className="img-thumbnail" style={{ maxHeight: '100px', cursor: 'pointer' }} onClick={() => window.open(value)} />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                            onClick={() => handleOCR(value, key)}
                                            disabled={ocrLoading[key]}
                                        >
                                            {ocrLoading[key] ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <i className="bi bi-eye"></i>
                                            )}
                                            Scanner
                                        </button>
                                    </div>
                                )}
                                <input
                                    type={isDate ? "date" : (isTime ? "time" : "text")}
                                    className="form-control form-control-sm border-primary shadow-none"
                                    value={isImage ? (editData[key] && !editData[key].startsWith('data:image/') ? editData[key] : '') : (editData[key] || '')}
                                    onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                    placeholder={isImage ? "Saisir le numéro lu sur la carte" : (isDate ? "JJ/MM/AAAA" : "")}
                                />
                            </>
                        )
                    ) : (
                        isImage ? (
                            <img src={value} alt={label} className="img-thumbnail" style={{ maxHeight: '100px', cursor: 'pointer', maxWidth: '150px' }} onClick={() => window.open(value)} />
                        ) : (
                            <span className="fw-bold text-dark">{displayValue}</span>
                        )
                    )}
                </div>
            </div>
        );
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
                <div style="display: flex; border-bottom: 1px solid #f2f2f2; padding: 4px 0; font-size: 10px; align-items: center; min-height: 28px;">
                    <div style="width: 25%; text-align: left; padding-left: 5px;">
                        <span style="font-weight: bold; color: #555; font-size: 10px; text-transform: uppercase; line-height: 1.2;">${labelFr}</span>
                    </div>
                    <div style="width: 50%; text-align: center; font-weight: 700; color: #000; font-size: 13px; line-height: 1.3;">
                        ${(typeof value === 'string' && value.startsWith('data:image/')) ? '[CARTE JOINTE]' : (normalizeText(value) || '-')}
                    </div>
                    <div style="width: 25%; text-align: right; padding-right: 8px;">
                        <span style="font-weight: bold; color: #555; font-size: 14px; line-height: 1.2;">${labelAr}</span>
                    </div>
                </div>
            `;

            const sectionTitle = (fr, ar) => `
                <div style="margin: 8px 0 4px 0; border-bottom: 2px solid ${themeColor(d)}; padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: bold; color: ${themeColor(d)}; font-size: 11px; letter-spacing: 0.5px;">${fr.toUpperCase()}</span>
                    <span style="font-weight: bold; color: ${themeColor(d)}; font-size: 16px;">${ar}</span>
                </div>
            `;

            if (d.type === 'naissance') {
                return `
                    ${sectionTitle("Informations de l'Enfant", "معلومات الطفل")}
                    ${row("NOM", "اللقب", formatName(d.donnees.nomEnfant))}
                    ${row("PRÉNOMS", "الاسم", formatName(d.donnees.prenomEnfant))}
                    ${row("SEXE", "الجنس", d.donnees.sexeEnfant === 'M' ? 'Masculin / ذكر' : 'Féminin / أنثى')}
                    ${row("DATE DE NAISSANCE", "تاريخ الميلاد", new Date(d.donnees.dateNaissanceEnfant).toLocaleDateString('fr-FR'))}
                    ${row("HEURE DE NAISSANCE", "ساعة الميلاد", d.donnees.heureNaissanceEnfant || '-')}
                    ${row("LIEU DE NAISSANCE", "مكان الميلاد", d.donnees.lieuNaissanceEnfant)}
                    
                    ${sectionTitle("Informations du Père", "معلومات الأب")}
                    ${row("NOM", "اللقب", formatName(d.donnees.nomPere))}
                    ${row("PRÉNOMS", "الاسم", formatName(d.donnees.prenomPere))}
                    ${row("NNI", "الرقم الوطني", d.donnees.nniPere || '-')}
                    ${row("NÉ LE", "ولد في", d.donnees.dateNaissancePere ? new Date(d.donnees.dateNaissancePere).toLocaleDateString('fr-FR') : '-')}
                    ${row("À", "في", d.donnees.lieuNaissancePere)}
                    ${row("NATIONALITÉ", "الجنسية", d.donnees.nationalitePere)}
                    ${row("PROFESSION", "المهنة", d.donnees.professionPere)}
                    ${row("DOMICILE", "السكن", d.donnees.domicilePere)}
                    
                    ${sectionTitle("Informations de la Mère", "معلومات الأم")}
                    ${row("NOM", "اللقب", formatName(d.donnees.nomMere))}
                    ${row("PRÉNOMS", "الاسم", formatName(d.donnees.prenomMere))}
                    ${row("NNI", "الرقم الوطني", d.donnees.nniMere || '-')}
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
                    ${row("NOM", "اللقب", formatName(d.donnees.nomEpoux))}
                    ${row("PRÉNOMS", "الاسم", formatName(d.donnees.prenomEpoux))}
                    ${row("NE LE", "تاريخ الميلاد", `${d.donnees.dateNaissanceEpoux ? new Date(d.donnees.dateNaissanceEpoux).toLocaleDateString('fr-FR') : '-'} à ${d.donnees.lieuNaissanceEpoux || '-'}`)}
                    ${row("PREMIER TÉMOIN", "الشاهد الأول", d.donnees.temoin1Epoux || '-')}
                    ${row("DEUXIÈME TÉMOIN", "الشاهد الثاني", d.donnees.temoin2Epoux || '-')}
                    ${row("NATIONALITÉ", "الجنسية", d.donnees.nationaliteEpoux)}
                    ${row("PROFESSION", "المهنة", d.donnees.professionEpoux)}
                    ${row("DOMICILE", "السكن", d.donnees.domicileEpoux)}
                    
                    ${sectionTitle("Informations de l'Épouse", "معلومات الزوجة")}
                    ${row("NOM", "اللقب", formatName(d.donnees.nomEpouse))}
                    ${row("PRÉNOMS", "الاسم", formatName(d.donnees.prenomEpouse))}
                    ${row("NEE LE", "تاريخ الميلاد", `${d.donnees.dateNaissanceEpouse ? new Date(d.donnees.dateNaissanceEpouse).toLocaleDateString('fr-FR') : '-'} à ${d.donnees.lieuNaissanceEpouse || '-'}`)}
                    ${row("PREMIER TÉMOIN", "الشاهد الأول", d.donnees.temoin1Epouse || '-')}
                    ${row("DEUXIÈME TÉMOIN", "الشاهد الثاني", d.donnees.temoin2Epouse || '-')}
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
                    ${row("NOM", "اللقب", formatName(d.donnees.nomDefunt))}
                    ${row("PRÉNOMS", "الاسم", formatName(d.donnees.prenomDefunt))}
                    ${row("SEXE", "الجنس", d.donnees.sexeDefunt === 'M' ? 'Masculin / ذكر' : 'Féminin / أنثى')}
                    ${row("REFERENCE NNI", "الرقم الوطني", d.donnees.nniDefunt)}
                    ${row("PROFESSION", "المهنة", d.donnees.professionDefunt || '-')}
                    ${row("NAISSANCE", "ولد في", `${d.donnees.dateNaissanceDefunt ? new Date(d.donnees.dateNaissanceDefunt).toLocaleDateString('fr-FR') : '-'} à ${d.donnees.lieuNaissanceDefunt || '-'}`)}
                    ${row("PÈRE", "الأب", d.donnees.pereDefunt || '-')}
                    ${row("MÈRE", "الأم", d.donnees.mereDefunt || '-')}
                    ${row("NATIONALITÉ", "الجنسية", d.donnees.nationaliteDefunt)}
                    ${row("DÉCÈS", "تاريخ الوفاة", `${new Date(d.donnees.dateDeces).toLocaleDateString('fr-FR')} à ${d.donnees.lieuDeces}`)}
                    ${row("CAUSE", "سبب الوفاة", d.donnees.causeDeces || 'Non spécifiée')}
                    
                    ${sectionTitle("Informations sur le Déclarant", "معلومات عن المبلغ")}
                    ${row("NOM COMPLET", "الاسم بالكامل", formatName(d.donnees.nomDeclarant, d.donnees.prenomDeclarant))}
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


    const isRequestIncomplete = (type, donnees) => {
        if (!donnees) return true;
        if (type === 'naissance') {
            const req = ['nomEnfant', 'prenomEnfant', 'dateNaissanceEnfant', 'lieuNaissanceEnfant', 'nomPere', 'prenomPere', 'nomMere', 'prenomMere'];
            return req.some(f => !donnees[f]);
        }
        if (type === 'mariage') {
            const req = ['nomEpoux', 'prenomEpoux', 'nomEpouse', 'prenomEpouse', 'dateMariage', 'lieuMariage'];
            return req.some(f => !donnees[f]);
        }
        if (type === 'deces') {
            const req = ['nomDefunt', 'prenomDefunt', 'sexeDefunt', 'dateDeces', 'lieuDeces', 'dateNaissanceDefunt', 'lieuNaissanceDefunt', 'pereDefunt', 'mereDefunt', 'nomDeclarant', 'prenomDeclarant'];
            return req.some(f => !donnees[f]);
        }
        return false;
    };

    const isIncomplete = selectedDemande ? isRequestIncomplete(selectedDemande.type, selectedDemande.donnees) : false;

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
                                    <td className="py-4">
                                        <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>
                                            {formatName(d.userId?.nom, d.userId?.prenom)}
                                        </div>
                                    </td>
                                    <td className="py-4 fw-bold text-muted" style={{ fontSize: '0.9rem' }}>{formatDate(d.dateDemande)}</td>
                                    <td className="py-4">
                                        <span className={`badge rounded-pill px-3 py-2 fw-bold shadow-sm ${d.statut === 'en_attente' ? 'bg-warning text-dark' : d.statut === 'acceptee' ? 'bg-success text-white' : 'bg-danger text-white'}`} style={{ fontSize: '0.8rem', letterSpacing: '0.3px' }}>
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
                                <div className="ms-auto d-flex gap-2">
                                    {(['en_attente', 'en attente'].includes(selectedDemande.statut?.toLowerCase())) && (
                                        <button
                                            className={`btn btn-sm ${isEditing ? 'btn-danger' : 'btn-outline-primary'} rounded-pill px-3 fw-bold`}
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            <i className={`bi ${isEditing ? 'bi-x-lg' : 'bi-pencil-fill'} me-2`}></i>
                                            {isEditing ? 'Annuler' : 'Modifier'}
                                        </button>
                                    )}
                                    <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                                </div>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-4 h-100">
                                            <h6 className="text-primary fw-bold text-uppercase small mb-3">Métadonnées</h6>
                                            <DetailRow label="Référence" value={(selectedDemande?.id || selectedDemande?._id)?.toUpperCase() || '-'} />
                                            <DetailRow label="Type d'acte" value={selectedDemande?.type?.toUpperCase() || '-'} />
                                            <DetailRow label="Date de demande" value={formatDate(selectedDemande?.dateDemande)} />
                                            <DetailRow label="Statut actuel" value={selectedDemande?.statut ? selectedDemande.statut.replace('_', ' ') : '-'} />
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
                                                    {selectedDemande.userId?.nom ? formatName(selectedDemande.userId.nom, selectedDemande.userId.prenom) : "Admin (Guichet)"}
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

                                    {/* Barre d'Actions Principale */}
                                    <div className="col-12">
                                        <div className="card-body bg-light rounded-4 p-4 mt-1 border-0 shadow-sm">
                                            <div className="row align-items-center">
                                                <div className="col-md-6">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-white p-2 rounded-circle shadow-sm">
                                                            <i className={`bi bi-circle-fill fs-4 ${(selectedDemande.statut === 'acceptee' || selectedDemande.statut === 'acceptee') ? 'text-success' :
                                                                (selectedDemande.statut === 'rejetee' || selectedDemande.statut === 'rejetee') ? 'text-danger' : 'text-warning'
                                                                }`}></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-muted small text-uppercase fw-bold mb-0">Statut de Traitement</div>
                                                            <span className="fw-black fs-5 text-dark">
                                                                {(selectedDemande.statut === 'en_attente' || selectedDemande.statut === 'en attente') ? 'En attente de validation' :
                                                                    (selectedDemande.statut === 'acceptee' || selectedDemande.statut === 'acceptee') ? 'Demande Acceptée' : 'Demande Rejetée'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-3 d-flex justify-content-center">
                                                        {(['en_attente', 'en attente'].includes(selectedDemande.statut?.toLowerCase())) ? (
                                                            <div className="d-flex gap-3">
                                                                <button
                                                                    className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                                                                    onClick={() => handleApprove(selectedDemande)}
                                                                    disabled={isIncomplete || actionLoading}
                                                                    title={isIncomplete ? "Impossible d'accepter une demande incomplète" : ""}
                                                                >
                                                                    {actionLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle-fill me-2"></i>}
                                                                    Accepter
                                                                </button>
                                                                <button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={() => openRejetModal(selectedDemande)} disabled={actionLoading}>
                                                                    <i className="bi bi-x-circle-fill me-2"></i>Rejeter
                                                                </button>
                                                                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => setIsEditing(true)}>
                                                                    <i className="bi bi-pencil-square me-2"></i>Modifier
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            (selectedDemande.statut === 'acceptee' || selectedDemande.statut === 'acceptee') && (
                                                                <button className="btn btn-outline-primary rounded-pill px-4 fw-bold" onClick={() => handleDownloadPDF(selectedDemande)}>
                                                                    <i className="bi bi-download me-2"></i>Télécharger le Certificat Officiel
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {isIncomplete && (selectedDemande.statut === 'en_attente' || selectedDemande.statut === 'en attente') && (
                                                <div className="alert alert-danger mx-0 mt-3 mb-0 rounded-4 d-flex align-items-center animate__animated animate__shakeX border-0 shadow-sm">
                                                    <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                                                    <div>
                                                        <div className="fw-bold">Demande Incomplète !</div>
                                                        <div className="small">Cette demande contient des champs obligatoires vides. Cliquez sur <strong>Modifier</strong> pour les remplir.</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <h6 className="text-primary fw-bold text-uppercase small mb-3">Détails de l'acte</h6>

                                        {selectedDemande.type === 'naissance' && (
                                            <>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-person-plus-fill me-2"></i>L'Enfant</h6>
                                                    <div className="row g-3">
                                                        {renderField('Nom', selectedDemande.donnees.nomEnfant, 'nomEnfant')}
                                                        {renderField('Prénoms', selectedDemande.donnees.prenomEnfant, 'prenomEnfant')}
                                                        {renderField('Sexe', selectedDemande.donnees.sexeEnfant, 'sexeEnfant')}
                                                        {renderField('Date Naissance', formatDate(selectedDemande.donnees.dateNaissanceEnfant), 'dateNaissanceEnfant')}
                                                        {renderField('Heure Naissance', selectedDemande.donnees.heureNaissanceEnfant, 'heureNaissanceEnfant')}
                                                        {renderField('Lieu Naissance', selectedDemande.donnees.lieuNaissanceEnfant, 'lieuNaissanceEnfant')}
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-gender-male me-2"></i>Le Père</h6>
                                                    <div className="row g-3">
                                                        {renderField('Nom', selectedDemande.donnees.nomPere, 'nomPere')}
                                                        {renderField('Prénoms', selectedDemande.donnees.prenomPere, 'prenomPere')}
                                                        {renderField('NNI', selectedDemande.donnees.nniPere, 'nniPere')}
                                                        {renderField('Date Naissance', formatDate(selectedDemande.donnees.dateNaissancePere), 'dateNaissancePere')}
                                                        {renderField('Lieu Naissance', selectedDemande.donnees.lieuNaissancePere, 'lieuNaissancePere')}
                                                        {renderField('Nationalité', selectedDemande.donnees.nationalitePere, 'nationalitePere')}
                                                        {renderField('Profession', selectedDemande.donnees.professionPere, 'professionPere')}
                                                        {renderField('Domicile', selectedDemande.donnees.domicilePere, 'domicilePere')}
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-gender-female me-2"></i>La Mère</h6>
                                                    <div className="row g-3">
                                                        {renderField('Nom', selectedDemande.donnees.nomMere, 'nomMere')}
                                                        {renderField('Prénoms', selectedDemande.donnees.prenomMere, 'prenomMere')}
                                                        {renderField('NNI', selectedDemande.donnees.nniMere, 'nniMere')}
                                                        {renderField('Date Naissance', formatDate(selectedDemande.donnees.dateNaissanceMere), 'dateNaissanceMere')}
                                                        {renderField('Lieu Naissance', selectedDemande.donnees.lieuNaissanceMere, 'lieuNaissanceMere')}
                                                        {renderField('Nationalité', selectedDemande.donnees.nationaliteMere, 'nationaliteMere')}
                                                        {renderField('Profession', selectedDemande.donnees.professionMere, 'professionMere')}
                                                        {renderField('Domicile', selectedDemande.donnees.domicileMere, 'domicileMere')}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedDemande.type === 'mariage' && (
                                            <>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-calendar-heart me-2"></i>Détails du Mariage & Dot</h6>
                                                    <div className="row g-3">
                                                        {renderField('Date', formatDate(selectedDemande.donnees.dateMariage), 'dateMariage')}
                                                        {renderField('Lieu', selectedDemande.donnees.lieuMariage, 'lieuMariage')}
                                                        {renderField('Régime Matrimonial', selectedDemande.donnees.regimeMatrimonial, 'regimeMatrimonial')}
                                                        {renderField('Montant Dot', selectedDemande.donnees.dotMontant, 'dotMontant')}
                                                        {renderField('Conditions Dot', selectedDemande.donnees.dotConditions, 'dotConditions')}
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-gender-male me-2"></i>L'Époux</h6>
                                                    <div className="row g-3">
                                                        {renderField('Nom', selectedDemande.donnees.nomEpoux, 'nomEpoux')}
                                                        {renderField('Prénoms', selectedDemande.donnees.prenomEpoux, 'prenomEpoux')}
                                                        {renderField('Premier Témoin', selectedDemande.donnees.temoin1Epoux, 'temoin1Epoux')}
                                                        {renderField('Deuxième Témoin', selectedDemande.donnees.temoin2Epoux, 'temoin2Epoux')}
                                                        {renderField('Date Naissance', formatDate(selectedDemande.donnees.dateNaissanceEpoux), 'dateNaissanceEpoux')}
                                                        {renderField('Lieu Naissance', selectedDemande.donnees.lieuNaissanceEpoux, 'lieuNaissanceEpoux')}
                                                        {renderField('Nationalité', selectedDemande.donnees.nationaliteEpoux, 'nationaliteEpoux')}
                                                        {renderField('Profession', selectedDemande.donnees.professionEpoux, 'professionEpoux')}
                                                        {renderField('Domicile', selectedDemande.donnees.domicileEpoux, 'domicileEpoux')}
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-gender-female me-2"></i>L'Épouse</h6>
                                                    <div className="row g-3">
                                                        {renderField('Nom', selectedDemande.donnees.nomEpouse, 'nomEpouse')}
                                                        {renderField('Prénoms', selectedDemande.donnees.prenomEpouse, 'prenomEpouse')}
                                                        {renderField('Premier Témoin', selectedDemande.donnees.temoin1Epouse, 'temoin1Epouse')}
                                                        {renderField('Deuxième Témoin', selectedDemande.donnees.temoin2Epouse, 'temoin2Epouse')}
                                                        {renderField('Date Naissance', formatDate(selectedDemande.donnees.dateNaissanceEpouse), 'dateNaissanceEpouse')}
                                                        {renderField('Lieu Naissance', selectedDemande.donnees.lieuNaissanceEpouse, 'lieuNaissanceEpouse')}
                                                        {renderField('Nationalité', selectedDemande.donnees.nationaliteEpouse, 'nationaliteEpouse')}
                                                        {renderField('Profession', selectedDemande.donnees.professionEpouse, 'professionEpouse')}
                                                        {renderField('Domicile', selectedDemande.donnees.domicileEpouse, 'domicileEpouse')}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedDemande.type === 'deces' && (
                                            <>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-person-x-fill me-2"></i>Le Défunt</h6>
                                                    <div className="row g-3">
                                                        {renderField('Nom', selectedDemande.donnees.nomDefunt, 'nomDefunt')}
                                                        {renderField('Prénoms', selectedDemande.donnees.prenomDefunt, 'prenomDefunt')}
                                                        {renderField('Sexe', selectedDemande.donnees.sexeDefunt, 'sexeDefunt')}
                                                        {renderField('NNI', selectedDemande.donnees.nniDefunt, 'nniDefunt')}
                                                        {renderField('Date Naissance', formatDate(selectedDemande.donnees.dateNaissanceDefunt), 'dateNaissanceDefunt')}
                                                        {renderField('Lieu Naissance', selectedDemande.donnees.lieuNaissanceDefunt, 'lieuNaissanceDefunt')}
                                                        {renderField('Père', selectedDemande.donnees.pereDefunt, 'pereDefunt')}
                                                        {renderField('Mère', selectedDemande.donnees.mereDefunt, 'mereDefunt')}
                                                        {renderField('Nationalité', selectedDemande.donnees.nationaliteDefunt, 'nationaliteDefunt')}
                                                        {renderField('Profession', selectedDemande.donnees.professionDefunt, 'professionDefunt')}
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner mb-3">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-info-circle-fill me-2"></i>Détails du Décès</h6>
                                                    <div className="row g-3">
                                                        {renderField('Date', formatDate(selectedDemande.donnees.dateDeces), 'dateDeces')}
                                                        {renderField('Lieu', selectedDemande.donnees.lieuDeces, 'lieuDeces')}
                                                        {renderField('Cause', selectedDemande.donnees.causeDeces, 'causeDeces')}
                                                    </div>
                                                </div>
                                                <div className="bg-light p-4 rounded-4 shadow-inner">
                                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="bi bi-person-fill me-2"></i>Le Déclarant</h6>
                                                    <div className="row g-3">
                                                        {renderField('Nom', selectedDemande.donnees.nomDeclarant, 'nomDeclarant')}
                                                        {renderField('Prénoms', selectedDemande.donnees.prenomDeclarant, 'prenomDeclarant')}
                                                        {renderField('Lien parenté', selectedDemande.donnees.lienParente, 'lienParente')}
                                                        {renderField('Domicile', selectedDemande.donnees.domicileDeclarant, 'domicileDeclarant')}
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
                                {isEditing ? (
                                    <button
                                        className="btn btn-success rounded-pill px-5 fw-bold shadow-sm"
                                        onClick={handleSaveEdit}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Enregistrement...
                                            </>
                                        ) : 'Enregistrer les modifications'}
                                    </button>
                                ) : (
                                    <button className="btn btn-primary rounded-pill px-5 fw-bold" onClick={() => setShowDetailsModal(false)}>Fermer</button>
                                )}
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
