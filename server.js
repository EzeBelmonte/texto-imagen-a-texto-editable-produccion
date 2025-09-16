
import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

import { formatOCRText } from './functions/formatOCRText.js';


// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Frontend compilado. Necesario para produicción
app.use(express.static(path.join(__dirname, "dist")));

// Carpeta temporal para subir imágenes
const upload = multer({ dest: 'uploads/' });

// Endpoint GET de prueba
app.get('/ping', (req, res) => {
    res.send('Servidor funcionando! Usa POST /procesar para subir imágenes.');
});

// Para cualquier otra ruta, devolvemos index.html (soporte para React Router). Necesario para producción
app.get((req,res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
}); 

// Endpoint POST para procesar imagen
app.post('/procesar', upload.single('imagen'), async (req, res) => {
    if (!req.file) return res.status(400).send('No se subió ninguna imagen');

    const imagenPath = req.file.path;

    try {
        // OCR con Tesseract
        const { data: { text } } = await Tesseract.recognize(imagenPath, 'spa');

        // Formatear el texto antes de devolverlo
        const formattedText = formatOCRText(text);

        // Eliminar archivo temporal
        if (fs.existsSync(imagenPath)) fs.unlinkSync(imagenPath);

        // Devolver texto en JSON
        res.json({ text: formattedText });

    } catch (err) {
        if (fs.existsSync(imagenPath)) fs.unlinkSync(imagenPath);
        console.error(err);
        res.status(500).send('Error procesando la imagen');
    }
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
