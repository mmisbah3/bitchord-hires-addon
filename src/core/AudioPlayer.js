const { Readable } = require('stream');

class AudioPlayer {
  constructor(voiceConnection) {
    this.connection = voiceConnection;
    this.currentStream = null;
  }

  /**
   * Menangani Raw PCM Stream dari Hi-Res Addon
   */
  playRawPCM(pcmStream, options = {}) {
    const { sampleRate = 96000, bitDepth = 24, channels = 2 } = options;

    console.log(`[AudioPlayer Core] Konfigurasi Output: ${bitDepth}-bit / ${sampleRate}Hz (${channels} Ch)`);

    this.currentStream = pcmStream;

    // Alirkan chunk data PCM langsung ke Voice Connection / Speaker Output
    pcmStream.on('data', (chunk) => {
      if (this.connection && typeof this.connection.writeAudioChunk === 'function') {
        this.connection.writeAudioChunk(chunk);
      }
    });

    pcmStream.on('end', () => {
      console.log('[AudioPlayer Core] Stream selesai.');
    });

    pcmStream.on('error', (err) => {
      console.error('[AudioPlayer Core] Error pada Audio Stream:', err);
    });
  }

  stop() {
    if (this.currentStream) {
      this.currentStream.destroy();
      this.currentStream = null;
    }
  }
}

module.exports = AudioPlayer;