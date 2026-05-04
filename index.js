const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const cron = require('node-cron');
const QRCode = require('qrcode');
const https = require('https');

const GROUP_NAME    = '@ E7 8NN @52';
const TELEGRAM_TOKEN   = '8339615813:AAF05U3JWBFobzeVicgdHDTwIu1HiCP1Jb0';
const TELEGRAM_CHAT_ID = '7502613528';

async function sendToTelegram(text) {
  const body = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text });
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }
    }, resolve);
    req.write(body);
    req.end();
  });
}

async function sendQRToTelegram(qr) {
  const imgBuffer = await QRCode.toBuffer(qr);
  const boundary = '----Boundary';
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${TELEGRAM_CHAT_ID}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="qr.png"\r\nContent-Type: image/png\r\n\r\n`),
    imgBuffer,
    Buffer.from(`\r\n--${boundary}--`)
  ]);
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/sendPhoto`,
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length }
    }, resolve);
    req.write(body);
    req.end();
  });
}

const schedule = [
  { from: '2025-05-01', to: '2025-05-07',  room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-05-08', to: '2025-05-14',  room: 'Room 2', tenant: 'Uncle' },
  { from: '2025-05-15', to: '2025-05-21',  room: 'Room 3', tenant: 'Neel' },
  { from: '2025-05-22', to: '2025-05-28',  room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-05-29', to: '2025-06-04',  room: 'Room 5', tenant: 'Sadhana' },
  { from: '2025-06-05', to: '2025-06-11',  room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-06-12', to: '2025-06-18',  room: 'Room 7', tenant: 'Loft Girls' },
  { from: '2025-06-19', to: '2025-06-25',  room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-06-26', to: '2025-07-02',  room: 'Room 2', tenant: 'Uncle' },
  { from: '2025-07-03', to: '2025-07-09',  room: 'Room 3', tenant: 'Neel' },
  { from: '2025-07-10', to: '2025-07-16',  room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-07-17', to: '2025-07-23',  room: 'Room 5', tenant: 'Sadhana' },
  { from: '2025-07-24', to: '2025-07-30',  room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-07-31', to: '2025-08-06',  room: 'Room 7', tenant: 'Loft Girls' },
  { from: '2025-08-07', to: '2025-08-13',  room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-08-14', to: '2025-08-20',  room: 'Room 2', tenant: 'Uncle' },
  { from: '2025-08-21', to: '2025-08-27',  room: 'Room 3', tenant: 'Neel' },
  { from: '2025-08-28', to: '2025-09-03',  room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-09-04', to: '2025-09-10',  room: 'Room 5', tenant: 'Sadhana' },
  { from: '2025-09-11', to: '2025-09-17',  room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-09-18', to: '2025-09-24',  room: 'Room 7', tenant: 'Loft Girls' },
  { from: '2025-09-25', to: '2025-10-01',  room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-10-02', to: '2025-10-08',  room: 'Room 2', tenant: 'Uncle' },
  { from: '2025-10-09', to: '2025-10-15',  room: 'Room 3', tenant: 'Neel' },
  { from: '2025-10-16', to: '2025-10-22',  room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-10-23', to: '2025-10-29',  room: 'Room 5', tenant: 'Sadhana' },
  { from: '2025-10-30', to: '2025-11-05',  room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-11-06', to: '2025-11-12',  room: 'Room 7', tenant: 'Loft Girls' },
  { from: '2025-11-13', to: '2025-11-19',  room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-11-20', to: '2025-11-26',  room: 'Room 2', tenant: 'Uncle' },
  { from: '2025-11-27', to: '2025-12-03',  room: 'Room 3', tenant: 'Neel' },
  { from: '2025-12-04', to: '2025-12-10',  room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-12-11', to: '2025-12-17',  room: 'Room 5', tenant: 'Sadhana' },
  { from: '2025-12-18', to: '2025-12-24',  room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-12-25', to: '2025-12-31',  room: 'Room 7', tenant: 'Loft Girls' },
];

function getThisWeek() {
  const today = new Date(); today.setHours(0,0,0,0);
  return schedule.find(e => today >= new Date(e.from) && today <= new Date(e.to));
}

function buildMessage(entry) {
  const from = new Date(entry.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const to   = new Date(entry.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  return `🏠 *Common Area Cleaning — This Week*\n━━━━━━━━━━━━━━━━━━━━━\n📅 *Period:* ${from} – ${to}\n🚪 *Room:* ${entry.room}\n👤 *Responsible:* ${entry.tenant}\n━━━━━━━━━━━━━━━━━━━━━\nPlease clean the common areas this week. Thank you! 🙏`;
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
    connectTimeoutMs: 60000,
    retryRequestDelayMs: 2000,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('📱 QR received, sending to Telegram...');
      await sendQRToTelegram(qr);
      await sendToTelegram('📱 Scan the QR code above with WhatsApp to connect the bot!');
      console.log('✅ QR sent to Telegram!');
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp connected!');
      await sendToTelegram('✅ WhatsApp bot is now connected!');

      async function sendSchedule() {
        const entry = getThisWeek();
        if (!entry) return;
        const groups = await sock.groupFetchAllParticipating();
        const group = Object.values(groups).find(g => g.subject === GROUP_NAME);
        if (!group) { console.log('Group not found!'); return; }
        await sock.sendMessage(group.id, { text: buildMessage(entry) });
        console.log('✅ Schedule sent!');
      }

      await sendSchedule();
      cron.schedule('0 9 * * 1', sendSchedule);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log('Reconnecting...');
        setTimeout(startBot, 3000);
      } else {
        await sendToTelegram('❌ Bot logged out. Redeploy to reconnect.');
      }
    }
  });
}

startBot();
