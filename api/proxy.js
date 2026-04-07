const https = require('https');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, 'https://vendasinternas.com.br');
  const action = url.searchParams.get('action') || 'read';
  const data = url.searchParams.get('data') || '';
  
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD/exec';
  const targetUrl = `${GAS_URL}?action=${action}` + (data ? `&data=${data}` : '');

  const request = https.get(targetUrl, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      https.get(response.headers.location, (redirectRes) => {
        let body = '';
        redirectRes.on('data', (chunk) => body += chunk);
        redirectRes.on('end', () => {
          res.status(200).send(body);
        });
      }).on('error', (err) => {
        res.status(500).json({ error: err.message });
      });
      return;
    }
    
    let body = '';
    response.on('data', (chunk) => body += chunk);
    response.on('end', () => {
      res.status(200).send(body);
    });
  });

  request.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  request.end();
};