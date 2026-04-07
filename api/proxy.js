const https = require('https');

module.exports = async function(req, res) {
  const { action, data } = req.query;
  
  const targetUrl = `https://script.google.com/macros/s/AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD/exec?action=${action}${data ? '&data=' + data : ''}`;

  return new Promise((resolve) => {
    const req = https.get(targetUrl, (response) => {
      let body = '';
      response.on('data', chunk => body += chunk);
      response.on('end', () => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(200).send(body);
        resolve();
      });
    });

    req.on('error', (error) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(500).json({ error: error.message });
      resolve();
    });

    req.end();
  });
};