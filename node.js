const fetch = require('node-fetch');
const crypto = require('crypto');

const API_URL = 'https://metascope.org/api/apps/gen?app_id=9092019690921877';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1461099803789492298/MHxU7LPJRmsLY2L5G5NnEvhH2Oj6XH-_jrzWek48H9oNzRS900d2uf19Yzmb13XXRWgc';

const seen = new Set();

function getHash(data) {
  const sorted = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(sorted).digest('hex');
}

async function poll() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      console.log(`API error: ${res.status}`);
      return;
    }

    const data = await res.json();
    const hash = getHash(data);

    if (seen.has(hash)) {
      process.stdout.write('.'); // progress dot
      return;
    }

    seen.add(hash);
    console.log(`\n[${new Date().toLocaleTimeString()}] NEW → sending to Discord`);

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: 'metascope API Update',
          description: '```json\n' + JSON.stringify(data, null, 2).slice(0, 3900) + '\n```',
          color: 0x57F287,
          timestamp: new Date().toISOString(),
          footer: { text: '~2s polling' }
        }]
      })
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

setInterval(poll, 2000);
poll(); // start right away
