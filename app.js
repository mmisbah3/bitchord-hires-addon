const path = require('path');
// 1. Import Client Utama Bitchord
const BitchordClient = require('./src/core/BitchordClient'); // Ganti dengan path client Bitchord Anda

// 2. Import Add-on Hi-Res Audio
const hiResAddon = require('./bitchord-hires-addon');

// 3. Inisialisasi Instance Bitchord
const client = new BitchordClient({
  token: 'YOUR_BITCHORD_BOT_OR_USER_TOKEN',
  prefix: '!'
});

// 4. Pasang Add-on ke Client saat siap (Ready State)
client.on('ready', () => {
  console.log(`[Bitchord Core] Client berhasil login sebagai ${client.user.tag}`);
  
  // Inisialisasi Add-on Hi-Res
  hiResAddon.init(client);
});

// 5. Penanganan Command Play Audio (Contoh Command Player)
client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!play')) {
    const args = message.content.split(' ');
    const trackUrl = args[1];

    if (!trackUrl) {
      return message.reply('Masukkan URL atau path file audio!');
    }

    // Trigger event trackStart yang ditangkap oleh Add-on Hi-Res
    client.emit('trackStart', {
      title: path.basename(trackUrl),
      url: trackUrl,
      requestedBy: message.author.tag
    });

    message.reply(`🎵 Memutar audio Hi-Res/Lossless: **${path.basename(trackUrl)}**`);
  }

  if (message.content === '!stop') {
    client.emit('trackEnd');
    message.reply('⏹️ Pemutaran dihentikan.');
  }
});

// Start Client
client.login();