
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANGUAGE = process.env.LANGUAGE || "Italian";
const VOICES = ["alloy", "ash", "ballad", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer", "verse"];

async function generateAudio(poemPath, outputPath) {
  try {
    const poem = (await fs.readFile(poemPath, "utf-8")).trim();
    const instructions = `Voice: A slow, calm and expressive ${LANGUAGE} speaker, reciting a poem. Pacing: speak with elegance and feeling, capturing the rhythm and emotion of the original work.`;
    const selectedVoice = VOICES[Math.floor(Math.random() * VOICES.length)];

    console.log(`Generating audio for: ${path.basename(poemPath)}`);
    console.log(`Using voice: ${selectedVoice}`);

    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: selectedVoice,
      input: poem,
      instructions: instructions,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    await fs.writeFile(outputPath, buffer);
    console.log(`✅ Audio saved to: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Error processing ${poemPath}:`, err);
  }
}

async function preload() {
  const poemsDir = path.join(__dirname, "poems");
  const audioDir = path.join(__dirname, "audio");

  try {
    // Ensure audio directory exists
    await fs.mkdir(audioDir, { recursive: true });

    const poemFiles = await fs.readdir(poemsDir);
    console.log(`Found ${poemFiles.length} poem files`);

    for (const poemFile of poemFiles) {
      if (!poemFile.endsWith('.txt')) continue;
      
      const poemPath = path.join(poemsDir, poemFile);
      const audioFileName = poemFile.replace('.txt', '.mp3');
      const audioPath = path.join(audioDir, audioFileName);

      await generateAudio(poemPath, audioPath);
    }

    console.log("\n✨ Preload complete!");
  } catch (err) {
    console.error("Error during preload:", err);
    process.exit(1);
  }
}

preload();
