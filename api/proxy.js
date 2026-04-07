// ============================================================
// API.JS - Servidor Minimal para Vercel
// Solução alternativa: usa Google Apps Script diretamente com fetch
// ============================================================

module.exports = async function(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action') || 'read';
  const data = url.searchParams.get('data') || '';
  
  // Google Apps Script URL (deve estar publicado como Web App)
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD/exec';
  
  const targetUrl = `${GAS_URL}?action=${action}` + (data ? `&data=${data}` : '');
  
  console.log('API: action =', action);
  
  try {
    // Usa fetch nativo do Node.js
    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const body = await response.text();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).send(body);
  } catch (err) {
    console.error('API Error:', err.message);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: err.message });
  }
};