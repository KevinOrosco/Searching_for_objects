// server.js
import express from 'express';
import cors from 'cors';
import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";
config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const hf = new HfInference(process.env.HF_TOKEN);

app.post('/analizar', async (req, res) => {
  try {
    const { base64 } = req.body;
    const buffer = Buffer.from(base64, 'base64');

    const model = "facebook/detr-resnet-50";

    const result = await hf.objectDetection({ data: buffer, model });

    const confianzaMinima = 0.8;
    const filtrados = result.filter(obj => obj.score > confianzaMinima);

    const labelsOriginales = filtrados.map(obj => obj.label);
    const labelsUnicos = [...new Set(labelsOriginales)];

    const traducciones = await Promise.all(
      labelsUnicos.map(label =>
        hf.translation({
          model: "Helsinki-NLP/opus-mt-en-es",
          inputs: label
        })
      )
    );

    const diccionarioTraduccion = {};
    labelsUnicos.forEach((label, i) => {
      diccionarioTraduccion[label] = traducciones[i].translation_text;
    });

    const labelsTraducidos = labelsOriginales.map(label => diccionarioTraduccion[label]);

    const conteo = {};
    for (const label of labelsTraducidos) {
      conteo[label] = (conteo[label] || 0) + 1;
    }

    res.json(conteo);

  } catch (error) {
    console.error("Error al analizar imagen:", error);
    res.status(500).json({ error: "Error al analizar imagen" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
