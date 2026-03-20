export default async function handler(req, res) {
  const params = new URLSearchParams(req.query).toString();
  const response = await fetch(`https://www.alphavantage.co/query?${params}`);
  const data = await response.json();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(data);
}
```

So your repo structure should look like:
```
api/
  av.js
index.html
