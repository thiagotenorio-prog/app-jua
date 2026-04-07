const http = require('http');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; AppJua/1.0)',
        'Accept': 'application/json'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log('Redirect:', response.headers.location);
        fetchUrl(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => body += chunk);
      response.on('end', () => {
        console.log('Response length:', body.length);
        resolve(body);
      });
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
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

  console.log('Fetching:', targetUrl);

  try {
    const body = await fetchUrl(targetUrl);
    res.status(200).send(body);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};