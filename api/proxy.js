module.exports = (req, res) => {
  const https = require('https');
  
  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action') || 'read';
  const data = url.searchParams.get('data') || '';
  
  const targetUrl = `https://script.google.com/macros/s/AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD/exec?action=${action}` + 
    (data ? `&data=${data}` : '');

  const request = https.get(targetUrl, (response) => {
    let body = '';
    response.on('data', (chunk) => body += chunk);
    response.on('end', () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.status(200).send(body);
    });
  });

  request.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  request.end();
};