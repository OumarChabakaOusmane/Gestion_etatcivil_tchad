const Tesseract = require('tesseract.js');

const parseNni = async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: 'Image manquante' });
        }

        // Tesseract peut prendre directement une string base64 contenant le "data:image/jpeg;base64,..."
        const { data: { text } } = await Tesseract.recognize(imageBase64, 'fra+eng');
        
        const nniMatch = text.match(/\b\d{10,15}\b/);

        if (nniMatch) {
            return res.status(200).json({ success: true, nni: nniMatch[0] });
        } else {
            return res.status(400).json({ success: false, message: 'La carte NNI est floue ou illisible. Veuillez reprendre la photo.' });
        }
    } catch (error) {
        console.error('Erreur OCR backend:', error);
        return res.status(500).json({ success: false, message: 'Erreur lors de la lecture de l\'image' });
    }
};

module.exports = { parseNni };
