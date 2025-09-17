
import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { formatOCRText } from './functions/formatOCRText.js';

import { v1 } from '@google-cloud/vision';
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

// Cliente de Google Vision
const client = new v1.ImageAnnotatorClient({
  credentials
});

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
    res.send('Servidor funcionando con Google Vision!');
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
        // Llamada a la vision API
        const [result] = await client.documentTextDetection(imagenPath);

        const detections = result.fullTextAnnotation
            ? result.fullTextAnnotation.text
            : '';

        // Eliminar archivo temporal
        if (fs.existsSync(imagenPath)) fs.unlinkSync(imagenPath);

        // Devolver texto en JSON
        res.json({ text: detections });

    } catch (err) {
        if (fs.existsSync(imagenPath)) fs.unlinkSync(imagenPath);
        console.error(err);
        res.status(500).send('Error procesando la imagen');
    }
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor escuchando en el puerto ${PORT}`));
