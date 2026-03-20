const https = require('https');

module.exports = function handler(req, res) {
  const params = new URLSearchParams(req.query).toString();
  const url = `https://www.alphavantage.co/query?${params}`;

  https.get(url, (apiRes) => {
    let body = '';
    apiRes.on('data', chunk => body += chunk);
    apiRes.on('end', () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(body);
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
};
