// KODE BARU (Kompatibel Express 5 / Path-to-Regexp v6+):
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