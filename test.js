const EventEmitter = require('events');
const path = require('path');
const addon = require('./index');

class MockBitchordClient extends EventEmitter {
  constructor() {
    super();
    this.audioPlayer = {
      playRawPCM: (stream, options) => {
        console.log('\n[MockPlayer] Stream Hi-Res Diterima:');
        console.log(`- Sample Rate : ${options.sampleRate} Hz`);
        console.log(`- Bit Depth   : ${options.bitDepth}-bit`);
        console.log(`- Channels    : ${options.channels}`);
        
        let totalBytes = 0;
        stream.on('data', (chunk) => {
          totalBytes += chunk.length;
          process.stdout.write(`\r[MockPlayer] Buffering PCM Data: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
        });

        stream.on('end', () => {
          console.log('\n\n[MockPlayer] Stream selesai diputar.');
        });
      }
    };
  }
}

const client = new MockBitchordClient();
addon.init(client);

// Gunakan path file WAV 24-bit 96kHz lokal
client.emit('trackStart', {
  title: 'Local Hi-Res WAV Track (24-bit / 96kHz)',
  url: path.join(__dirname, 'sample_96khz_24bit.wav')
});