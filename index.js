const http = require('http');
const path = require('path');
const HiResStreamHandler = require('./src/audio/streamHandler');
const MetadataReader = require('./src/audio/metadataReader');
const Logger = require('./src/utils/logger');

const streamHandler = new HiResStreamHandler();
const audioFilePath = path.join(__dirname, 'sample_96khz_24bit.wav');
const PORT = 8080;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Header CORS untuk Bitchord Client Engine
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Manifest Add-on (Mendeklarasikan Catalog, Stream, dan Search pada Root Resources)
  if (url.pathname === '/' || url.pathname === '/manifest.json') {
    const jsonManifest = {
      id: "com.bitchord.hires.lossless",
      version: "1.0.0",
      name: "Hi-Res & Lossless Audio Engine",
      description: "Pencarian dan Pemutar Audio Hi-Res 24-bit/96kHz Lossless",
      type: "audio",
      types: ["audio", "music"],
      // Tipe 'search' wajib didaftarkan di sini agar dibaca oleh Bitchord
      resources: [
        "catalog",
        "stream",
        "search"
      ],
      catalogs: [
        {
          type: "audio",
          id: "hires_catalog",
          name: "Hi-Res Local Tracks",
          extra: [
            {
              name: "search",
              isRequired: false
            }
          ]
        }
      ],
      manifestVersion: 1
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(jsonManifest, null, 2));
    Logger.info('Manifest dengan deklarasi Search & Catalog root berhasil dikirim.');
    return;
  }

  // 2. Endpoint Catalog & Search Query Handler
  if (url.pathname.startsWith('/catalog/') || url.pathname.startsWith('/search/')) {
    const searchParam = url.searchParams.get('search') || 'Local Track';
    
    const catalogResult = {
      metas: [
        {
          id: "local-sample-96khz",
          type: "audio",
          name: `Hi-Res Track: ${searchParam}`,
          posterShape: "square",
          description: "Audio Hi-Res 24-bit / 96kHz PCM Stream",
          genres: ["Hi-Res", "Lossless"]
        }
      ]
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(catalogResult, null, 2));
    Logger.info(`Pencarian berhasil diproses: "${searchParam}"`);
    return;
  }

  // 3. Endpoint Stream Handler (Dipanggil saat track dipilih)
  if (url.pathname.startsWith('/stream/')) {
    Logger.info('Menyiapkan stream audio Hi-Res...');

    const details = await MetadataReader.getAudioDetails(audioFilePath);

    const streamResult = {
      streams: [
        {
          title: "PCM 24-bit / 96kHz Lossless Stream",
          url: `http://localhost:${PORT}/audio-file`,
          format: details.container || "wav",
          sampleRate: details.sampleRate || 96000,
          bitDepth: details.bitsPerSample || 24
        }
      ]
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(streamResult, null, 2));
    return;
  }

  // 4. Raw PCM Audio Binary Stream Endpoint
  if (url.pathname === '/audio-file') {
    const details = await MetadataReader.getAudioDetails(audioFilePath);
    
    res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive'
    });

    const ffmpegStream = streamHandler.createLosslessStream(audioFilePath, details);
    ffmpegStream.pipe(res);

    req.on('close', () => {
      Logger.warn('Stream audio ditutup oleh client.');
      ffmpegStream.destroy();
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan' }));
});

server.listen(PORT, () => {
  Logger.success(`Server Add-on aktif pada port ${PORT}`);
  Logger.info(`Gunakan URL ini pada Bitchord PC: http://localhost:${PORT}/manifest.json`);
});