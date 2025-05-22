import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";
config();

const hf = new HfInference(process.env.HF_TOKEN);

export const analizarImagen = async (buffer) => {
  try {
    const base64 = buffer.toString('base64');

    const response = await fetch("http://192.168.2.117/analizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ base64 })
    });

    const resultado = await response.json();
    return resultado;

  } catch (error) {
    console.error("Error en la app móvil al analizar imagen:", error);
    return null;
  }
};


analizarImagen();
// Este código utiliza la API de Hugging Face para detectar objetos en una imagen y traducir las etiquetas al español.