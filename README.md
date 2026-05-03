# 🏠 Common Area Cleaning Bot

A WhatsApp bot that automatically sends the weekly cleaning reminder to your group every Monday at 9:00 AM.

---

## ⚙️ Setup (One Time)

### 1. Install Node.js
Download from https://nodejs.org (choose LTS version)

### 2. Install dependencies
Open a terminal in this folder and run:
```
npm install
```

### 3. Set your group name
Open `index.js` and find this line at the top:
```js
const GROUP_NAME = 'YOUR GROUP NAME HERE';
```
Replace it with the **exact** name of your WhatsApp group, e.g.:
```js
const GROUP_NAME = 'Home Cleaning 🏠';
```

---

## ▶️ Run the Bot

```
npm start
```

- A **QR code** will appear in the terminal
- Open WhatsApp on your phone → **Linked Devices** → **Link a Device**
- Scan the QR code
- The bot will connect and send the first message immediately

> ✅ After the first scan, the session is saved — you won't need to scan again unless you log out.

---

## ⏰ Schedule

The bot sends a message **every Monday at 9:00 AM** automatically to your group.

It also sends one immediately when you start it (so you can test it works).

---

## 💬 Example Message Sent

```
🏠 Common Area Cleaning — This Week
━━━━━━━━━━━━━━━━━━━━━
📅 Period: 1 May – 7 May
🚪 Room: Room 1
👤 Responsible: New Tenant
━━━━━━━━━━━━━━━━━━━━━
Please clean the common areas this week. Thank you! 🙏
```

---

## ⚠️ Important Notes

- Keep the terminal/computer **running** for the bot to work
- The phone that scanned the QR does **not** need to stay connected
- To stop the bot, press `Ctrl + C` in the terminal
