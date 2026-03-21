const https = require('https');

module.exports = function handler(req, res) {
  const { ticker, interval, range } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker' });

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval || '1mo'}&range=${range || '5y'}&includeAdjustedClose=true`;

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
    }
  };

  https.get(url, options, (apiRes) => {
    let body = '';
    apiRes.on('data', chunk => body += chunk);
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(body);
        const result = json?.chart?.result?.[0];
        if (!result) return res.status(404).json({ error: `No data found for "${ticker}"` });

        const timestamps = result.timestamp;
        const closes = result.indicators?.adjclose?.[0]?.adjclose
                    || result.indicators?.quote?.[0]?.close;

        if (!timestamps || !closes) return res.status(404).json({ error: 'No price data in response' });

        // Build { 'YYYY-MM-DD': price } map, skip null values
        const map = {};
        timestamps.forEach((ts, i) => {
          if (closes[i] == null) return;
          const date = new Date(ts * 1000).toISOString().split('T')[0];
          map[date] = closes[i];
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(map);
      } catch(e) {
        res.status(500).json({ error: 'Failed to parse response' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
};
