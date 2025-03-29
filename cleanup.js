import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanup(days = 7) {
  const audioDir = path.join(__dirname, "audio");
  const CLEANUP_AGE_MS = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  console.log(`Running cleanup for files older than ${days} day(s)...`);
  console.log(`Target directory: ${audioDir}`);

  try {
    const files = await fs.readdir(audioDir);
    const now = Date.now();
    const deleted = [];

    if (files.length === 0) {
      console.log("No files found in audio directory.");
      return;
    }

    for (const file of files) {
      const filePath = path.join(audioDir, file);
      let stats;

      try {
        stats = await fs.stat(filePath);
      } catch (err) {
        console.error(`Failed to stat ${filePath}:`, err);
        continue;
      }

      // Skip if not a regular file
      if (!stats.isFile()) {
        console.log(`Skipping non-file: ${file}`);
        continue;
      }

      const age = now - stats.mtimeMs;
      console.log(
        `Checking ${file}: age = ${Math.floor(age / (1000 * 60))} min`,
      );

      if (days === 0 || age > CLEANUP_AGE_MS) {
        try {
          await fs.unlink(filePath);
          console.log(`Deleted: ${file}`);
          deleted.push(file);
        } catch (err) {
          console.error(`Failed to delete ${filePath}:`, err);
        }
      }
    }

    console.log(`\nCleanup complete. ${deleted.length} file(s) deleted.`);
    if (deleted.length > 0) {
      console.log("Deleted files:", deleted);
    }
  } catch (err) {
    console.error("Error during audio cleanup:", err);
    process.exit(1);
  }
}

// Get days from command line argument, default to 7 if not provided
const input = process.argv[2];
const days = input !== undefined ? Number(input) : 7;
cleanup(days);
