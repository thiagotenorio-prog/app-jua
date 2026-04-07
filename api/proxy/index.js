const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        fetchUrl(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      let body = '';
      response.on('data', (chunk) => body += chunk);
      response.on('end', () => resolve(body));
    });
    
    request.on('error', reject);
    request.end();
  });
}

module.exports = async function(req, res) {
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

  try {
    const body = await fetchUrl(targetUrl);
    res.status(200).send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};