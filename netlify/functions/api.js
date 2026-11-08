const express = require('express');
const serverless = require('serverless-http');

const app = express();
// Deklarasi dan inisialisasi router Wajib di paling atas
const router = express.Router();

// Middleware CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 1. Endpoint Manifest.json (Utama Bitchord PC)
router.get(['/', '/manifest.json'], (req, res) => {
  res.json({
    id: "com.bitchord.hires.lossless",
    version: "1.0.0",
    name: "Hi-Res & Lossless Audio Engine",
    description: "Pencarian dan Pemutar Audio Hi-Res 24-bit/96kHz Lossless",
    type: "audio",
    types: ["audio", "music"],
    resources: ["catalog", "stream", "search"],
    catalogs: [
      {
        type: "audio",
        id: "hires_catalog",
        name: "Hi-Res Local Tracks",
        extra: [{ name: "search", isRequired: false }]
      }
    ],
    manifestVersion: 1
  });
});

// 2. Endpoint Catalog & Search
router.get(['/catalog/(.*)', '/search/(.*)'], (req, res) => {
  const searchParam = req.query.search || 'Hi-Res Track';
  res.json({
    metas: [
      {
        id: "sample-96khz-track",
        type: "audio",
        name: `Hi-Res Track: ${searchParam}`,
        posterShape: "square",
        description: "Audio Hi-Res 24-bit / 96kHz PCM Stream",
        genres: ["Hi-Res", "Lossless"]
      }
    ]
  });
});

// 3. Endpoint Stream Information
router.get('/stream/(.*)', (req, res) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  res.json({
    streams: [
      {
        title: "PCM 24-bit / 96kHz Lossless Stream",
        url: `${baseUrl}/.netlify/functions/api/audio-file`,
        format: "wav",
        sampleRate: 96000,
        bitDepth: 24
      }
    ]
  });
});

// 4. Endpoint Audio File Response
router.get('/audio-file', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'audio/wav',
    'Access-Control-Allow-Origin': '*'
  });
  res.end();
});

app.use('/.netlify/functions/api', router);
app.use('/', router);

module.exports.handler = serverless(app);