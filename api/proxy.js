const https = require('https');

module.exports = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const action = req.query.action || 'read';
  const data = req.query.data || '';
  
  const targetUrl = `https://script.google.com/macros/s/AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD/exec?action=${action}` + 
    (data ? `&data=${data}` : '');

  console.log('Proxy target:', targetUrl.substring(0, 100) + '...');

  const proxyReq = https.get(targetUrl, function(proxyRes) {
    let body = '';
    proxyRes.on('data', function(chunk) { body += chunk; });
    proxyRes.on('end', function() {
      res.status(200).send(body);
    });
  });

  proxyReq.on('error', function(err) {
    res.status(500).json({ error: err.message });
  });

  proxyReq.end();
};