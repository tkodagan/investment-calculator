const https = require('https');

const API_KEYS = [
  'LS6NMT89KF6VCU0X',  // your existing key
  'OPXAPSR8VFOV71GD',
  // add more as needed
];

function fetchWithKey(params, key) {
  return new Promise((resolve, reject) => {
    const url = `https://www.alphavantage.co/query?${params}&apikey=${key}`;
    https.get(url, (apiRes) => {
      let body = '';
      apiRes.on('data', chunk => body += chunk);
      apiRes.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  // Remove apikey from params — we'll attach it per-key ourselves
  const query = { ...req.query };
  delete query.apikey;
  const params = new URLSearchParams(query).toString();

  for (const key of API_KEYS) {
    try {
      const body = await fetchWithKey(params, key);
      const data = JSON.parse(body);

      // If this key is rate limited, try the next one
      if (data['Information'] && data['Information'].includes('API rate limit')) {
        continue;
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(body);
    } catch (err) {
      continue;
    }
  }

  // All keys exhausted
  res.status(429).json({ Information: 'All API keys have reached their rate limit for today.' });
};
