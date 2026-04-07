module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const url = new URL(req.url, 'https://vendasinternas.com.br');
  const action = url.searchParams.get('action') || 'read';
  const data = url.searchParams.get('data') || '';
  
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD/exec';
  const targetUrl = `${GAS_URL}?action=${action}` + (data ? `&data=${data}` : '');

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow'
    });
    const body = await response.text();
    res.status(200).send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};