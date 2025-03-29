import Fastify from "fastify";
import fastifyFormBody from "@fastify/formbody";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

fastify.register(fastifyFormBody);

const APP_MODE = process.env.APP_MODE || "static"; // "static" or "dynamic"
const LANGUAGE = process.env.LANGUAGE || "Italian";
const VOICES = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
  "verse",
];
const PORT = process.env.PORT || 8000;

const audioDir = path.join(__dirname, "audio");
await fs.mkdir(audioDir, { recursive: true }); // Ensure audio directory exists

fastify.get("/", async (request, reply) => {
  reply.send({ message: "Server is running!" });
});

fastify.all("/inbound", async (request, reply) => {
  console.log(`Incoming call in ${APP_MODE} mode`);

  try {
    let audioUrl;

    if (APP_MODE === "static") {
      // Use existing audio file if available
      const audioFiles = await fs.readdir(audioDir);
      if (audioFiles.length > 0) {
        const randomAudio =
          audioFiles[Math.floor(Math.random() * audioFiles.length)];
        audioUrl = `${request.protocol}://${request.headers.host}/audio/${randomAudio}`;
      } else {
        console.log("No static files found, falling back to dynamic mode");
      }
    }
    
    if (audioUrl === undefined) {
      // Dynamic mode - generate new audio
      const poemsDir = path.join(__dirname, "poems");
      const files = await fs.readdir(poemsDir);

      if (files.length === 0) {
        throw new Error("No poem files found in poems folder.");
      }

      const randomFile = files[Math.floor(Math.random() * files.length)];
      const filePath = path.join(poemsDir, randomFile);
      const poem = (await fs.readFile(filePath, "utf-8")).trim();

      console.log(`Selected Poem (${randomFile}):\n`, poem);

      const instructions = `Voice: A slow, calm and expressive ${LANGUAGE} speaker, reciting a poem. Speak with elegance and feeling, capturing the rhythm and emotion of the original work.`;

      const speech = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: VOICES[Math.floor(Math.random() * VOICES.length)],
        input: poem,
        instructions,
      });

      const buffer = Buffer.from(await speech.arrayBuffer());

      // Save buffer to disk
      const randomId = Math.random().toString(36).substring(2, 10);
      const filename = `audio-${randomId}.mp3`;
      const fileSavePath = path.join(audioDir, filename);

      await fs.writeFile(fileSavePath, buffer);
      audioUrl = `${request.protocol}://${request.headers.host}/audio/${filename}`;
    }

    const texml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Play>${audioUrl}</Play>
        <Hangup/>
      </Response>`;

    reply.type("text/xml").send(texml);
  } catch (err) {
    console.error("Error loading poem or generating speech:", err);
    reply.code(500).send("Error loading poem or generating speech");
  }
});

fastify.get("/audio/:filename", async (request, reply) => {
  const { filename } = request.params;
  const filePath = path.join(audioDir, filename);

  try {
    const buffer = await fs.readFile(filePath);
    reply
      .header("Content-Type", "audio/mpeg")
      .header("Content-Length", buffer.length)
      .send(buffer);
  } catch (err) {
    reply.status(404).send("Audio not found.");
  }
});

fastify.listen({ port: PORT }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`✅ Server is running on port ${PORT}`);
});
