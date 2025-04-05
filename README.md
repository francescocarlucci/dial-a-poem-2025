
# Dial a Poem 2025

## An AI-powered version of Dial a Poem - a tribute to his original creator John Giorno

Dial a Poem 2025 is a modern reimagining of John Giorno's innovative "Dial-A-Poem" project, using AI technology to generate audio readings of poems in multiple languages.

### Features

- Dynamic poem selection and audio generation using OpenAI's Text-to-Speech
- Support for multiple AI voices (alloy, ash, ballad, coral, echo, onyx, nova, sage, verse)
- Static and dynamic operation modes
- Automatic audio file cleanup
- RESTful API endpoints for audio management

### Setup

1. Create a `.env` file with the following variables:
   ```
   OPENAI_API_KEY=your_api_key
   APP_MODE=static    # or "dynamic"
   LANGUAGE=Italian   # or any other language
   PORT=8000         # optional, defaults to 8000
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Usage

#### Running the Server
```bash
npm start
```

#### Preloading Audio Files (Static Mode)
```bash
npm run preload          # Process all poems
npm run preload [name]   # Process specific poem
```

#### Cleanup Old Audio Files
```bash
npm run cleanup         # Remove files older than 7 days
npm run cleanup:all    # Remove all audio files
```

### API Endpoints

- `GET /` - Server health check
- `GET /audio/list` - List available audio files
- `GET /audio/:filename` - Stream specific audio file
- `ALL /inbound` - Main endpoint for poem playback

### Operation Modes

#### Static Mode
- Uses pre-generated audio files
- Faster response times
- Requires running preload script

#### Dynamic Mode
- Generates audio on-demand
- More variety in voice selection
- Higher latency due to real-time generation

### Project Structure
```
├── audio/           # Generated audio files
├── poems/           # Source poem text files
├── cleanup.js       # Audio file maintenance
├── index.js         # Main server
├── preload.js       # Static audio generator
```

### Dependencies

- Fastify - Web server framework
- OpenAI - AI text-to-speech generation
- dotenv - Environment configuration

### License

MIT License

### Author

Francesco Carlucci
