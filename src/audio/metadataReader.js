const musicMetadata = require('music-metadata');
const http = require('http');
const https = require('https');
const path = require('path');
const Logger = require('../utils/logger');

class MetadataReader {
  /**
   * Mengambil detail audio (Sample Rate, Bit Depth, Container, Bitrate)
   * @param {string} sourcePath - URL stream atau Path File lokal
   */
  static async getAudioDetails(sourcePath) {
    try {
      let metadata;

      // Cek apakah sumber merupakan URL remote atau Path file lokal
      if (sourcePath.startsWith('http://') || sourcePath.startsWith('https://')) {
        metadata = await this.parseUrlMetadata(sourcePath);
      } else {
        // Pembacaan file lokal
        metadata = await musicMetadata.parseFile(sourcePath);
      }

      const format = metadata.format || {};
      const sampleRate = format.sampleRate || 44100;
      const bitsPerSample = format.bitsPerSample || 16;
      const container = (format.container || path.extname(sourcePath).replace('.', '') || '').toLowerCase();

      // Kriteria Hi-Res & Lossless
      const isLossless = format.lossless ?? ['flac', 'wav', 'alac', 'dsd', 'aiff'].includes(container);
      const isHiRes = sampleRate >= 88200 || bitsPerSample >= 24;

      return {
        container: container || 'unknown',
        sampleRate,
        bitsPerSample,
        bitrate: format.bitrate ? Math.round(format.bitrate / 1000) : null,
        isLossless,
        isHiRes
      };
    } catch (err) {
      Logger.warn(`Gagal membaca metadata otomatis. Menggunakan profil default: ${err.message}`);
      
      return {
        container: 'unknown',
        sampleRate: 44100,
        bitsPerSample: 16,
        bitrate: null,
        isLossless: false,
        isHiRes: false
      };
    }
  }

  /**
   * Parse metadata dari stream HTTP/HTTPS secara aman
   */
  static parseUrlMetadata(urlStr) {
    return new Promise((resolve, reject) => {
      const client = urlStr.startsWith('https://') ? https : http;
      
      const req = client.get(urlStr, (res) => {
        // Tangani Redirect (301/302)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(this.parseUrlMetadata(res.headers.location));
        }

        const parsedUrl = new URL(urlStr);
        const options = {
          mimeType: res.headers['content-type'],
          fileInfo: { path: parsedUrl.pathname }
        };

        const parseFn = musicMetadata.parseStream || musicMetadata.parseNodeStream;
        
        if (typeof parseFn === 'function') {
          parseFn(res, options)
            .then(metadata => {
              req.destroy();
              resolve(metadata);
            })
            .catch(reject);
        } else {
          reject(new Error("Fungsi parseStream tidak tersedia pada modul music-metadata."));
        }
      });

      req.on('error', reject);
    });
  }
}

module.exports = MetadataReader;