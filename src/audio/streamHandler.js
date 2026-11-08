const ffmpegPath = require('ffmpeg-static');
const { FFmpeg } = require('prism-media'); // Import langsung destructuring FFmpeg
const config = require('../config.json');
const Logger = require('../utils/logger');

class HiResStreamHandler {
  constructor(customConfig = {}) {
    this.audioSettings = { ...config.audioSettings, ...customConfig };
  }

  /**
   * Membuat readable stream PCM dari file/stream audio
   * @param {string} sourcePath 
   * @param {Object} audioDetails 
   */
  createLosslessStream(sourcePath, audioDetails) {
    const targetSampleRate = Math.min(
      audioDetails.sampleRate || this.audioSettings.defaultSampleRate,
      this.audioSettings.maxSampleRate
    );

    let pcmEncoding = 's24le';
    if (audioDetails.bitsPerSample === 32) {
      pcmEncoding = 's32le';
    } else if (audioDetails.bitsPerSample === 16) {
      pcmEncoding = 's16le';
    }

    const ffmpegArgs = [
      '-re',
      '-i', sourcePath,
      '-f', pcmEncoding,
      '-ar', targetSampleRate.toString(),
      '-ac', this.audioSettings.channels.toString(),
      '-vn',
      '-loglevel', 'quiet'
    ];

    Logger.info(`Membuka stream FFmpeg: ${pcmEncoding.toUpperCase()} @ ${targetSampleRate}Hz (${this.audioSettings.channels} Ch)`);

    // Inisialisasi class FFmpeg langsung
    const ffmpegStream = new FFmpeg({
      binary: ffmpegPath,
      args: ffmpegArgs,
      highWaterMark: this.audioSettings.highWaterMark
    });

    ffmpegStream.on('error', (err) => {
      Logger.error('Kesalahan pada FFmpeg stream process:', err);
    });

    return ffmpegStream;
  }

  isSupportedLossless(container) {
    return config.supportedFormats.includes(container.toLowerCase());
  }
}

module.exports = HiResStreamHandler;