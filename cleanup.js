
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanup(days = 7) {
  const audioDir = path.join(__dirname, "audio");
  const CLEANUP_AGE_MS = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
  try {
    const files = await fs.readdir(audioDir);
    const now = Date.now();
    const deleted = [];

    // If days is 0, delete all files
    for (const file of files) {
      const filePath = path.join(audioDir, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtimeMs;

      if (days === 0 || age > CLEANUP_AGE_MS) {
        await fs.unlink(filePath);
        deleted.push(file);
      }
    }

    console.log('Cleanup complete.');
    console.log('Deleted files:', deleted);
  } catch (err) {
    console.error("Error during audio cleanup:", err);
    process.exit(1);
  }
}

// Get days from command line argument, default to 7 if not provided
const days = Number(process.argv[2]) || 7;
cleanup(days);
