const https = require('https');

function makeRequest(url, callback, redirectCount = 0) {
  if (redirectCount > 5) {
    callback({ error: 'Too many redirects' });
    return;
  }

  const request = https.get(url, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      makeRequest(response.headers.location, callback, redirectCount + 1);
      return;
    }
    
    let body = '';
    response.on('data', (chunk) => body += chunk);
    response.on('end', () => {
      callback(null, body, response.statusCode);
    });
  });

  request.on('error', (err) => {
    callback(err);
  });

  request.end();
}

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

  makeRequest(targetUrl, (err, body, statusCode) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(statusCode || 200).send(body);
  });
};