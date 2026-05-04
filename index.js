const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

// ─── CONFIG ───────────────────────────────────────────────
// Put the EXACT name of your WhatsApp group here
const GROUP_NAME = '@E7 8NN @52';
// ──────────────────────────────────────────────────────────

const schedule = [
  // May 2025
  { from: '2025-05-01', to: '2025-05-07', room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-05-08', to: '2025-05-14', room: 'Room 2', tenant: 'Uncle' },
  { from: '2025-05-15', to: '2025-05-21', room: 'Room 3', tenant: 'Neel' },
  { from: '2025-05-22', to: '2025-05-28', room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-05-29', to: '2025-06-04', room: 'Room 5', tenant: 'Sadhana' },
  // June 2025
  { from: '2025-06-05', to: '2025-06-11', room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-06-12', to: '2025-06-18', room: 'Room 7', tenant: 'Loft Girls' },
  { from: '2025-06-19', to: '2025-06-25', room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-06-26', to: '2025-07-02', room: 'Room 2', tenant: 'Uncle' },
  // July 2025
  { from: '2025-07-03', to: '2025-07-09', room: 'Room 3', tenant: 'Neel' },
  { from: '2025-07-10', to: '2025-07-16', room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-07-17', to: '2025-07-23', room: 'Room 5', tenant: 'Sadhana' },
  { from: '2025-07-24', to: '2025-07-30', room: 'Room 6', tenant: 'Sri Ram' },
  // August 2025
  { from: '2025-07-31', to: '2025-08-06', room: 'Room 7', tenant: 'Loft Girls' },
  { from: '2025-08-07', to: '2025-08-13', room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-08-14', to: '2025-08-20', room: 'Room 2', tenant: 'Uncle' },
  { from: '2025-08-21', to: '2025-08-27', room: 'Room 3', tenant: 'Neel' },
  // September 2025
  { from: '2025-08-28', to: '2025-09-03', room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-09-04', to: '2025-09-10', room: 'Room 5', tenant: 'Sadhana' },
  { from: '2025-09-11', to: '2025-09-17', room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-09-18', to: '2025-09-24', room: 'Room 7', tenant: 'Loft Girls' },
  // October 2025
  { from: '2025-09-25', to: '2025-10-01', room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-10-02', to: '2025-10-08', room: 'Room 2', tenant: 'Uncle' },
  { from: '2025-10-09', to: '2025-10-15', room: 'Room 3', tenant: 'Neel' },
  { from: '2025-10-16', to: '2025-10-22', room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-10-23', to: '2025-10-29', room: 'Room 5', tenant: 'Sadhana' },
  // November 2025
  { from: '2025-10-30', to: '2025-11-05', room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-11-06', to: '2025-11-12', room: 'Room 7', tenant: 'Loft Girls' },
  { from: '2025-11-13', to: '2025-11-19', room: 'Room 1', tenant: 'New Tenant' },
  { from: '2025-11-20', to: '2025-11-26', room: 'Room 2', tenant: 'Uncle' },
  // December 2025
  { from: '2025-11-27', to: '2025-12-03', room: 'Room 3', tenant: 'Neel' },
  { from: '2025-12-04', to: '2025-12-10', room: 'Room 4', tenant: 'Basement Boys' },
  { from: '2025-12-11', to: '2025-12-17', room: 'Room 5', tenant: 'Sadhana' },
  { from: '2025-12-18', to: '2025-12-24', room: 'Room 6', tenant: 'Sri Ram' },
  { from: '2025-12-25', to: '2025-12-31', room: 'Room 7', tenant: 'Loft Girls' },
];

function getThisWeeksEntry() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return schedule.find(entry => {
    const from = new Date(entry.from);
    const to = new Date(entry.to);
    return today >= from && today <= to;
  });
}

function buildMessage(entry) {
  const from = new Date(entry.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const to   = new Date(entry.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  return (
    `🏠 *Common Area Cleaning — This Week*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 *Period:* ${from} – ${to}\n` +
    `🚪 *Room:* ${entry.room}\n` +
    `👤 *Responsible:* ${entry.tenant}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `Please clean the common areas this week. Thank you! 🙏`
  );
}

async function sendToGroup(client, message) {
  const chats = await client.getChats();
  const group = chats.find(c => c.isGroup && c.name === GROUP_NAME);
  if (!group) {
    console.log(`❌ Group "${GROUP_NAME}" not found. Check the name in config.`);
    return;
  }
  await group.sendMessage(message);
  console.log(`✅ Message sent to "${GROUP_NAME}"`);
}

// ─── WhatsApp Client Setup ────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
  executablePath: '/usr/bin/google-chrome-stable',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
}
});

client.on('qr', qr => {
  console.log('\n📱 Scan this QR code with your WhatsApp:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot is connected and ready!\n');

  // Send immediately on startup (for testing)
  const entry = getThisWeeksEntry();
  if (entry) {
    console.log('Sending this week\'s message now...');
    sendToGroup(client, buildMessage(entry));
  } else {
    console.log('No schedule entry found for today\'s date.');
  }

  // ⏰ Send every Monday at 9:00 AM automatically
  cron.schedule('0 9 * * 1', () => {
    const entry = getThisWeeksEntry();
    if (entry) {
      sendToGroup(client, buildMessage(entry));
    }
  });

  console.log('⏰ Scheduler running — sends every Monday at 9:00 AM.\n');
});

client.on('auth_failure', () => console.log('❌ Auth failed. Delete the .wwebjs_auth folder and restart.'));
client.on('disconnected', reason => console.log('⚠️  Disconnected:', reason));

client.initialize();
