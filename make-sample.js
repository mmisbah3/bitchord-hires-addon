// make-sample.js
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

const outputPath = path.join(__dirname, 'sample_96khz_24bit.wav');

// Buat sinyal audio gelombang sinus 1000Hz (24-bit / 96kHz, durasi 3 detik)
const command = `"${ffmpegPath}" -y -f lavfi -i "sine=frequency=1000:duration=3" -c:a pcm_s24le -ar 96000 "${outputPath}"`;

try {
  console.log('Membuat file sample Hi-Res (24-bit / 96kHz)...');
  execSync(command, { stdio: 'inherit' });
  console.log(`\nBerhasil membuat file: ${outputPath}`);
} catch (err) {
  console.error('Gagal membuat file sample:', err.message);
}