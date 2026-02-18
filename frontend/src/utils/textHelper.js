/**
 * Utility to normalize common spelling errors and automatically add missing accents
 * for professional titles and common administrative terms in Tchad context.
 */

const TEXT_NORMALIZATION_MAP = {
    'commercant': 'Commerçant',
    'commercante': 'Commerçante',
    'eleve': 'Élève',
    'etudiant': 'Étudiant',
    'etudiante': 'Étudiante',
    'menagere': 'Ménagère',
    'salarie': 'Salarié',
    'salariee': 'Salariée',
    'retraite': 'Retraité',
    'retraitee': 'Retraitée',
    'ingenieur': 'Ingénieur',
    'prive': 'Privé',
    'liberal': 'Libéral',
    'medecin': 'Médecin',
    'ne': 'Né',
    'nee': 'Née',
    'pere': 'Père',
    'mere': 'Mère',
    'deces': 'Décès',
    'naissance': 'Naissance',
    'mariage': 'Mariage',
    'ndjamena': "N'Djamena",
    'ndjaména': "N'Djamena",
    'tchad': 'Tchad',
    'tchadien': 'Tchadien',
    'tchadienne': 'Tchadienne',
    'chaine': 'Chaîne',
    'hopital': 'Hôpital',
    'maitre': 'Maître',
    'ecole': 'École',
};

/**
 * Normalizes a string by replacing common misspelled patterns.
 * @param {string} text 
 * @returns {string}
 */
export const normalizeText = (text) => {
    if (!text) return "";
    if (typeof text !== 'string') {
        if (typeof text === 'object') return "[Données complexes]";
        return String(text);
    }

    let normalized = text.trim();
    const words = normalized.split(/\s+/);

    const processedWords = words.map(word => {
        // Clean word from punctuation for mapping check
        const cleanWord = word.toLowerCase().replace(/[,.:;!?]/g, '');
        const punctuation = word.substring(cleanWord.length);

        if (TEXT_NORMALIZATION_MAP[cleanWord]) {
            // Check if the original word was all caps
            if (word === word.toUpperCase() && word.length > 1) {
                return TEXT_NORMALIZATION_MAP[cleanWord].toUpperCase() + punctuation;
            }
            return TEXT_NORMALIZATION_MAP[cleanWord] + punctuation;
        }
        return word;
    });

    return processedWords.join(' ');
};

/**
 * Formats a name to Title Case (e.g., "OUMAR" -> "Oumar", "CHABAKA" -> "Chabaka").
 * @param {string} name 
 * @returns {string}
 */
export const formatName = (name) => {
    if (!name || typeof name !== 'string') return name || "";
    return name.trim().toLowerCase().split(/\s+/).map(word => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

export default {
    normalizeText,
    formatName
};
