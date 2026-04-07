// ============================================================
// CONSTANTES GLOBAIS — Popular Farma
// ============================================================
var NOME_FARMACIA = 'Popular Farma Juazeiro';
var LOGO_PATH = 'https://app-jua.vercel.app/img/logo-popularfarma.png';

var VENDS = ['LAIS','IVAN','LIVIA','JADILSON','CARLA','BETANIA'];
var PRODS = [
  {id:1,nome:'HISTAMIN',preco:16.99,est:10},{id:2,nome:'OMEGA 3',preco:29.99,est:528},
  {id:3,nome:'MILIMETRIC',preco:4.99,est:64},{id:4,nome:'SHAMPOO JOHNSON 400ML',preco:16.99,est:240},
  {id:5,nome:'BEM SAUDE',preco:29.99,est:17},{id:6,nome:'JHONSON LAVANDA',preco:19.99,est:168},
  {id:7,nome:'DIPIRONA 1G',preco:7.99,est:4},{id:8,nome:'NISTATINA POMADA',preco:9.99,est:60},
  {id:9,nome:'SABONETE PAMPERS',preco:19.99,est:12},{id:10,nome:'PENETRO GEL',preco:17.99,est:129},
  {id:11,nome:'FRALDA MONICA',preco:17.99,est:4},{id:12,nome:'ALBENDAZOL',preco:2.99,est:660},
  {id:13,nome:'BABYMED',preco:4.99,est:3},{id:14,nome:'GAESO',preco:9.99,est:20},
  {id:15,nome:'DIPIRONA 500mg',preco:2.99,est:50},{id:16,nome:'XO INSETO LOCAO',preco:16.99,est:2412},
  {id:17,nome:'BEPANTRIZ POMADA',preco:7.99,est:0},{id:18,nome:'BEPANTRIZ TATOO',preco:12.99,est:0},
  {id:19,nome:'BEPANTRIZ LABIAL 9,99',preco:9.99,est:60},{id:20,nome:'BEPANTRIZ DERMA',preco:12.99,est:120},
  {id:21,nome:'ORAL B CREME DENTAL',preco:3.99,est:30},{id:22,nome:'KIT PANTENE 27,99',preco:27.99,est:32},
  {id:23,nome:'TADALAFILA 5mg',preco:16.49,est:20},{id:24,nome:'SIMETICONA GOTAS 3,99',preco:3.99,est:600},
  {id:25,nome:'PAMPERS PANTS',preco:99.99,est:0},{id:26,nome:'PAMPERS SUPER SEQUINHA',preco:87.99,est:68},
  {id:27,nome:'CIMEGRIP IMUNE',preco:21.99,est:44},{id:28,nome:'APTAMIL SL',preco:149.99,est:6},
  {id:29,nome:'DORFLEX',preco:4.99,est:0},{id:30,nome:'CENTRUN',preco:19.99,est:30},
  {id:31,nome:'SABONETE BABY',preco:9.99,est:0},{id:32,nome:'KIT PANTENE 24,99',preco:24.99,est:0},
  {id:33,nome:'ALBENDAZOL 1,99',preco:1.99,est:0},{id:34,nome:'BEPANTRIZ LABIAL 8,99',preco:8.99,est:0},
  {id:35,nome:'WARYZ',preco:29.99,est:0},{id:36,nome:'PAMPERS S SEQUINHA PROMO',preco:74.99,est:0},
  {id:37,nome:'LOSARTANA PROMO',preco:1.99,est:0},{id:38,nome:'SIMETICONA GOTAS 1,99',preco:1.99,est:0},
  {id:40,nome:'HUGGIES PROMO',preco:74.99,est:0},{id:41,nome:'KIT PANTENE PROMO',preco:23.99,est:0},
  {id:42,nome:'SABONETE PAMPERS 17,99',preco:17.99,est:0},{id:43,nome:'ALBENDAZOL PROMO',preco:0.99,est:0},
  {id:44,nome:'CETOPROFENO ATACADO',preco:3.99,est:0},{id:45,nome:'BEPANTRIZ PROMO',preco:8.99,est:0},
  {id:46,nome:'SUPER SEQUINHA PQ',preco:34.99,est:0},{id:47,nome:'BEPANTRIZ LABIAL 11,99',preco:11.99,est:0},
  {id:48,nome:'EDISTRIDE',preco:85.00,est:0},{id:49,nome:'CETOPROFENO 9,99',preco:9.99,est:0}
];

var PGTO_LABELS = {
  dinheiro: '💵 Dinheiro',
  pix: '📲 PIX',
  debito: '💳 Débito',
  credito_1_6: '💳 Crédito 1–6x',
  credito_7_10: '💳 Crédito 7–10x',
  convenio: '🏥 Convênio'
};

function pgtoLabel(k) { return PGTO_LABELS[k] || k || '—'; }
function pgtoBadgeClass(k) {
  if(k==='dinheiro') return 'badge-green';
  if(k==='pix') return 'badge-cyan';
  if(k==='debito') return 'badge-blue';
  if(k==='credito_1_6'||k==='credito_7_10') return 'badge-purple';
  if(k==='convenio') return 'badge-orange';
  return 'badge-amber';
}

/* ========== SHEETS INTEGRATION (via Apps Script) ========== */
var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD/exec';
var PROXY_URL = '/api/proxy?url=';
var sheetSyncing = false;
var sheetLastSync = null;
var dbLastUpdate = null;
var syncLeituraInterval = null;

function loadFromSheet() {
  return new Promise(function(resolve, reject) {
    showSyncStatus('Conectando ao banco de dados...', 'amber');
    var url = PROXY_URL + encodeURIComponent(APPS_SCRIPT_URL + '?action=read');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 15000;
    xhr.onload = function() {
      try {
        var data = JSON.parse(xhr.responseText);
        if (data.error) {
          showSyncStatus('Não foi possível conectar ao banco. Tente novamente.', 'red');
          resolve(false);
          return;
        }
        if (data.empty) {
          showSyncStatus('Banco vazio — preparando dados iniciais...', 'amber');
          resolve(false);
          return;
        }
        if (data.vendas || data.vendedores || data.produtos) {
          db.vendedores = data.vendedores || db.vendedores;
          db.produtos = data.produtos || db.produtos;
          db.vendas = data.vendas || [];
          db.nxt = data.nxt || db.nxt;
          dbLastUpdate = data.lastUpdate || null;
          localStorage.setItem('farm_db', JSON.stringify(db));
          localStorage.setItem('farm_db_timestamp', dbLastUpdate || '');
          showSyncStatus('Dados carregados do banco!', 'green');
          sheetLastSync = new Date();
          resolve(true);
          return;
        }
        showSyncStatus('Banco não contém dados válidos.', 'red');
        resolve(false);
      } catch(e) {
        showSyncStatus('Erro ao processar dados do banco.', 'red');
        resolve(false);
      }
    };
    xhr.onerror = function() {
      showSyncStatus('Sem conexão com o banco. Verifique sua internet.', 'red');
      resolve(false);
    };
    xhr.ontimeout = function() {
      showSyncStatus('Conexão lenta. Tente novamente.', 'red');
      resolve(false);
    };
    xhr.send();
  });
}

function saveToSheet() {
  return new Promise(function(resolve, reject) {
    if (sheetSyncing) { resolve(false); return; }
    sheetSyncing = true;
    showSyncStatus('Sincronizando com o banco...', 'amber');
    var payload = JSON.stringify({
      vendedores: db.vendedores,
      produtos: db.produtos,
      vendas: db.vendas,
      nxt: db.nxt,
      lastUpdate: dbLastUpdate || new Date().toISOString()
    });
    var encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(payload))));
    var url = PROXY_URL + encodeURIComponent(APPS_SCRIPT_URL + '?action=write&data=' + encoded);
    console.log('📤 Enviando para o banco...');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 25000;
    xhr.onload = function() {
      console.log('📤 Resposta status:', xhr.status);
      console.log('📤 Resposta:', xhr.responseText.substring(0, 200));
      sheetSyncing = false;
      try {
        var data = JSON.parse(xhr.responseText);
        if (data.success) {
          dbLastUpdate = data.timestamp || new Date().toISOString();
          localStorage.setItem('farm_db_timestamp', dbLastUpdate);
          showSyncStatus(data.message || 'Dados sincronizados com sucesso!', 'green');
          sheetLastSync = new Date();
          var ind = document.getElementById('sync-text');
          if (ind) {
            ind.textContent = '☁️ Salvo';
            ind.style.color = 'var(--green)';
            setTimeout(function() {
              ind.textContent = 'Sincronizado';
              ind.style.color = 'var(--green)';
            }, 3000);
          }
          resolve(true);
        } else {
          showSyncStatus('Ops! Não conseguimos salvar. Tente novamente.', 'red');
          resolve(false);
        }
      } catch(e) {
        showSyncStatus('Dados sincronizados!', 'green');
        sheetLastSync = new Date();
        resolve(true);
      }
    };
    xhr.onerror = function() {
      sheetSyncing = false;
      showSyncStatus('Sem conexão. Dados mantidos localmente.', 'red');
      resolve(false);
    };
    xhr.ontimeout = function() {
      sheetSyncing = false;
      showSyncStatus('Conexão lenta. Tente novamente.', 'red');
      resolve(false);
    };
    xhr.send();
  });
}

function showSyncStatus(msg, color) {
  var cor = color === 'green' ? '#22c55e' : color === 'red' ? '#f87171' : '#fbbf24';
  var bg = color === 'green' ? 'rgba(34,197,94,.15)' : color === 'red' ? 'rgba(248,113,113,.15)' : 'rgba(251,191,36,.15)';
  var el = document.getElementById('sheet-status-msg');
  if (el) {
    el.style.cssText = 'display:block;position:fixed;top:70px;right:20px;z-index:200;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.3);background:' + bg + ';color:' + cor + ';border:1px solid ' + cor;
    el.textContent = msg;
    setTimeout(function() { el.style.display = 'none'; }, 4000);
  }
  var loginEl = document.getElementById('sync-status');
  if (loginEl) {
    loginEl.style.display = 'block';
    var txt = document.getElementById('sync-msg');
    if (txt) {
      txt.style.cssText = 'font-size:12px;color:' + cor + ';min-height:18px;margin-top:6px;text-align:center';
      txt.textContent = msg;
    }
  }
}

function syncFromSheet() {
  showSyncStatus('Baixando dados do banco...', 'amber');
  loadFromSheet().then(function(ok) {
    if (ok) {
      showSyncStatus('Dados carregados do banco!', 'green');
      if (typeof renderPainel === 'function') renderPainel();
      if (typeof renderVendedores === 'function') renderVendedores();
      if (typeof renderProdutos === 'function') renderProdutos();
      if (typeof renderVendas === 'function') renderVendas();
      if (typeof renderHistorico === 'function') renderHistorico();
    } else {
      showSyncStatus('Banco vazio. Entre como Admin para popular.', 'amber');
    }
  });
}

function syncLeituraSilenciosa() {
  if (sheetSyncing) return;
  var url = PROXY_URL + encodeURIComponent(APPS_SCRIPT_URL + '?action=read');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.timeout = 8000;
  xhr.onload = function() {
    try {
      var data = JSON.parse(xhr.responseText);
      if (data.vendas || data.vendedores || data.produtos) {
        var remoteTimestamp = data.lastUpdate || null;
        if (remoteTimestamp && remoteTimestamp !== dbLastUpdate) {
          db.vendedores = data.vendedores || db.vendedores;
          db.produtos = data.produtos || db.produtos;
          db.vendas = data.vendas || [];
          db.nxt = data.nxt || db.nxt;
          dbLastUpdate = remoteTimestamp;
          localStorage.setItem('farm_db', JSON.stringify(db));
          localStorage.setItem('farm_db_timestamp', dbLastUpdate || '');
          var currentTab = document.querySelector('.section.active');
          if (currentTab) {
            var tabId = currentTab.id.replace('sec-', '');
            if (tabId === 'painel' && typeof renderPainel === 'function') renderPainel();
            if (tabId === 'vendedores' && typeof renderVendedores === 'function') renderVendedores();
            if (tabId === 'produtos' && typeof renderProdutos === 'function') renderProdutos();
            if (tabId === 'vendas' && typeof renderVendas === 'function') renderVendas();
            if (tabId === 'historico' && typeof renderHistorico === 'function') renderHistorico();
          }
        }
      }
    } catch(e) {}
  };
  xhr.send();
}

function iniciarSyncLeitura() {
  if (syncLeituraInterval) clearInterval(syncLeituraInterval);
  syncLeituraInterval = setInterval(syncLeituraSilenciosa, 3000);
}

function pararSyncLeitura() {
  if (syncLeituraInterval) {
    clearInterval(syncLeituraInterval);
    syncLeituraInterval = null;
  }
}

function syncFromLogin() {
  showSyncStatus('Conectando ao banco...', 'amber');
  var url = PROXY_URL + encodeURIComponent(APPS_SCRIPT_URL + '?action=read');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.timeout = 15000;
  xhr.onload = function() {
    try {
      var data = JSON.parse(xhr.responseText);
      if (data.error) {
        showSyncStatus('Não foi possível conectar. Tente novamente.', 'red');
        return;
      }
      if (data.empty) {
        showSyncStatus('Banco vazio. Entre como Admin para popular.', 'amber');
        return;
      }
      if (data.vendedores || data.produtos || data.vendas) {
        db.vendedores = data.vendedores || db.vendedores;
        db.produtos = data.produtos || db.produtos;
        db.vendas = data.vendas || [];
        db.nxt = data.nxt || db.nxt;
        dbLastUpdate = data.lastUpdate || null;
        localStorage.setItem('farm_db', JSON.stringify(db));
        localStorage.setItem('farm_db_timestamp', dbLastUpdate || '');
        showSyncStatus('Dados carregados do banco! Pronto para usar.', 'green');
        return;
      }
      showSyncStatus('Banco vazio. Entre como Admin para popular.', 'amber');
    } catch(e) {
      showSyncStatus('Erro ao processar dados do banco.', 'red');
    }
  };
  xhr.onerror = function() {
    showSyncStatus('Sem conexão. Verifique sua internet.', 'red');
  };
  xhr.ontimeout = function() {
    showSyncStatus('Conexão lenta. Tente novamente.', 'red');
  };
  xhr.send();
}

function syncNow() {
  showSyncStatus('Enviando dados para o banco...', 'amber');
  saveToSheet().then(function(ok) {
    if (!ok) {
      showSyncStatus('Ops! Não conseguimos enviar. Tente novamente.', 'red');
    }
  });
}

function abrirPlanilha() {
  window.open('https://docs.google.com/spreadsheets/d/1RwUiXrhat6ZHwMcSkfhJ9HNIwBUqSZNUaQZzA0qf3mI/edit', '_blank');
}

/* ========== DB ========== */
function loadDB() {
  try {
    var el = document.getElementById('dados-salvos');
    if (el && el.textContent.trim()) {
      var d = JSON.parse(el.textContent);
      if (d && (d.vendas || d.vendedores)) { localStorage.setItem('farm_db', JSON.stringify(d)); return d; }
    }
  } catch(e) {}
  try { var d2 = localStorage.getItem('farm_db'); if (d2) return JSON.parse(d2); } catch(e) {}
  return { vendedores: VENDS.map(function(n){return{nome:n};}), produtos: JSON.parse(JSON.stringify(PRODS)), vendas: [], nxt: 1000 };
}

function saveDB() {
  try { localStorage.setItem('farm_db', JSON.stringify(db)); } catch(e) {}
  alteracoesPendentes = true;
  var btn = document.getElementById('btn-salvar');
  if (btn && !btn.textContent.includes('✔')) btn.textContent = '💾 Salvar *';
  saveToSheet();
}

var alteracoesPendentes = false;
var ultimoAutoSave = null;

function autoSalvar() {
  if (!alteracoesPendentes) return;
  try { localStorage.setItem('farm_db', JSON.stringify(db)); } catch(e) {}
  ultimoAutoSave = new Date();
  alteracoesPendentes = false;
  var btn = document.getElementById('btn-salvar');
  if (btn) { btn.textContent = '💾 Salvar'; btn.title = 'Salvo às ' + ultimoAutoSave.toLocaleTimeString('pt-BR'); }
  var ind = document.getElementById('autosave-ind');
  if (ind) { ind.textContent = 'Salvo às ' + ultimoAutoSave.toLocaleTimeString('pt-BR'); ind.style.opacity = '1'; setTimeout(function(){ ind.style.opacity = '0'; }, 3000); }
  saveToSheet();
}
// Sync automático REMOVIDO para evitar sobrescritas cegas
// O sync agora acontece apenas após operações de escrita (saveDB)
//setInterval(autoSalvar, 10000);

window.addEventListener('beforeunload', function(e) {
  if (alteracoesPendentes) { var msg = 'Você tem alterações não salvas!'; e.preventDefault(); e.returnValue = msg; return msg; }
});

function salvarArquivo() {
  var dadosJSON = JSON.stringify(db);
  var html = document.documentElement.outerHTML;
  html = html.replace(/<script id="dados-salvos"[^>]*>[\s\S]*?<\/script>/i, '');
  var tag = '<script id="dados-salvos" type="application/json">' + dadosJSON + '<\/script>';
  html = html.replace('</body>', tag + '\n</body>');
  var blob = new Blob([html], {type: 'text/html;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'vendas_farmacia.html'; a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
  alteracoesPendentes = false;
  var btn = document.getElementById('btn-salvar');
  if (btn) { btn.textContent = '✔ Salvo!'; setTimeout(function(){ btn.textContent = '💾 Salvar'; }, 2500); }
}

/* ========== MAIN ========== */
var db = loadDB();
var vSel = null;
var carr = [];
var pgtoSel = null;

document.getElementById('hdate').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

function fmt(v) { return 'R$ ' + parseFloat(v).toFixed(2).replace('.',','); }
function fn(v)  { return parseFloat(v).toFixed(2).replace('.',','); }
function vendsV(n) { return db.vendas.filter(function(v){return v.vendedor===n && !v.cancelada;}); }
function totV(n)   { return vendsV(n).reduce(function(s,v){return s+v.total;},0); }
function qtdV(n)   { return vendsV(n).reduce(function(s,v){return s+v.quantidade;},0); }

function showTab(t) {
  ['painel','lancar','vendedores','produtos','vendas','historico','fechamento'].forEach(function(a){
    document.getElementById('sec-'+a).classList.toggle('active', a===t);
  });
  document.querySelectorAll('.tab').forEach(function(b,i){
    b.classList.toggle('active',['painel','lancar','vendedores','produtos','vendas','historico','fechamento'][i]===t);
  });
  if(t==='painel')     renderPainel();
  if(t==='lancar')     renderLancar();
  if(t==='vendedores') renderVendedores();
  if(t==='produtos')   renderProdutos();
  if(t==='vendas')     renderVendas();
  if(t==='historico')  renderHistorico();
}

function enterApp(metodo) {
  usuarioAtual = metodo;
  document.getElementById('tela-login').style.display = 'none';
  aplicarPermissoes();
  renderPainel();
  document.getElementById('btn-sync').style.display = '';
  document.getElementById('btn-sheet').style.display = isAdm() ? '' : 'none';
  showSyncStatus('Conectando ao banco de dados...', 'amber');
  loadFromSheet().then(function(ok) {
    migrarCamposNovos();
    iniciarSyncLeitura();
    if (!ok) {
      showSyncStatus('Banco vazio — preparando dados...', 'amber');
      saveToSheet().then(function(saved) {
        if (saved) {
          showSyncStatus('Tudo pronto! Dados sincronizados com a planilha!', 'green');
        } else {
          showSyncStatus('Banco vazio. Entre como Admin para popular.', 'amber');
        }
      }).catch(function(err) {
        showSyncStatus('Não foi possível salvar no banco.', 'red');
      });
    }
  }).catch(function(err) {
    showSyncStatus('Sem conexão com o banco.', 'red');
  });
}

/* ---- PAINEL ---- */
function renderPainel() {
  var ativas = db.vendas.filter(function(v){return !v.cancelada;});
  var tG = ativas.reduce(function(s,v){return s+v.total;},0);
  var qG = ativas.reduce(function(s,v){return s+v.quantidade;},0);
  var nL = ativas.length;
  var tk = nL>0 ? tG/nL : 0;
  document.getElementById('metrics').innerHTML =
    '<div class="metric"><div class="metric-label">Total vendido (R$)</div><div class="metric-val green">'+fn(tG)+'</div></div>'+
    '<div class="metric"><div class="metric-label">Itens vendidos</div><div class="metric-val blue">'+qG+'</div></div>'+
    '<div class="metric"><div class="metric-label">Lançamentos</div><div class="metric-val">'+nL+'</div></div>'+
    '<div class="metric"><div class="metric-label">Ticket médio (R$)</div><div class="metric-val amber">'+fn(tk)+'</div></div>';

  var rank = db.vendedores.map(function(v){return{nome:v.nome,total:totV(v.nome),qtd:qtdV(v.nome)};})
    .sort(function(a,b){return b.total-a.total;});
  var mx = rank.length>0 ? rank[0].total : 1;
  var cores = ['gold','silver','bronze','','',''];
  var rh = tG===0 ? '<div class="empty">Nenhuma venda ainda</div>' : '';
  rank.forEach(function(v,i){
    var p = mx>0 ? Math.round(v.total/mx*100) : 0;
    rh += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">'+
      '<div style="font-family:monospace;font-size:20px;font-weight:700;min-width:32px;color:'+(cores[i]?'var('+cores[i]+')':'var(--text3)')+'">'+
        (i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1))+'</div>'+
      '<div style="flex:1"><div style="font-weight:700;font-size:15px">'+v.nome+'</div>'+
        '<div class="pb"><div class="pf" style="width:'+p+'%"></div></div></div>'+
      '<div style="text-align:right"><div style="font-family:monospace;font-size:14px;font-weight:700;color:var(--green)">'+fmt(v.total)+'</div>'+
        '<div style="font-size:12px;color:var(--text3)">'+v.qtd+' itens</div></div></div>';
  });
  document.getElementById('ranking').innerHTML = rh;

  var pp = {};
  db.vendas.forEach(function(v){if(!pp[v.produto])pp[v.produto]={qtd:0,total:0};pp[v.produto].qtd+=v.quantidade;pp[v.produto].total+=v.total;});
  var top = Object.keys(pp).map(function(k){return{nome:k,qtd:pp[k].qtd,total:pp[k].total};}).sort(function(a,b){return b.qtd-a.qtd;}).slice(0,8);
  var th='';
  if(top.length===0){th='<div class="empty">Nenhuma venda ainda</div>';}
  else{th='<div class="tw"><table><tr><th>Produto</th><th>Qtd</th><th>Total</th></tr>';
    top.forEach(function(p,i){th+='<tr><td class="nm">'+(i+1)+'. '+p.nome+'</td><td><span class="badge badge-blue">'+p.qtd+'</span></td><td style="font-family:monospace;color:var(--green);font-weight:700">'+fmt(p.total)+'</td></tr>';});
    th+='</table></div>';}
  document.getElementById('top-prod').innerHTML = th;
}

/* ---- LANCAR ---- */
function renderLancar() {
  var h = '';
  db.vendedores.filter(function(v){return v.ativo!==false;}).forEach(function(v){
    var tot=totV(v.nome); var qtd=qtdV(v.nome); var s=vSel===v.nome;
    h+='<div class="vc'+(s?' sel':'')+'" onclick="selVend(\''+v.nome+'\')">'+
      '<div class="vn">'+v.nome+'</div><div class="vi">'+qtd+' itens</div><div class="vv">'+fmt(tot)+'</div></div>';
  });
  document.getElementById('vend-sel').innerHTML = h;
  if(vSel){
    document.getElementById('lancar-form').style.display='block';
    document.getElementById('carr-vend').textContent=vSel;
    filtrarProds(); renderCarrinho();
  } else {
    document.getElementById('lancar-form').style.display='none';
  }
}

function selVend(n){ vSel=n; carr=[]; pgtoSel=null; renderLancar(); atualizarPgtoUI(); }

function selPgto(key) {
  pgtoSel = key;
  atualizarPgtoUI();
}
function atualizarPgtoUI() {
  var btns = document.querySelectorAll('#pgto-grid .pgto-btn');
  var keys = ['dinheiro','pix','debito','credito_1_6','credito_7_10','convenio'];
  btns.forEach(function(b,i){ b.classList.toggle('sel', keys[i]===pgtoSel); });
  document.getElementById('pgto-msg').textContent = '';
}

function filtrarProds() {
  var b = document.getElementById('l-busca').value.toLowerCase();
  var lista = db.produtos.filter(function(p){return p.est>0 && p.nome.toLowerCase().indexOf(b)>=0;}).slice(0,25);
  var h = '';
  lista.forEach(function(p){
    var q=0; for(var i=0;i<carr.length;i++){if(carr[i].id===p.id){q=carr[i].qtd;break;}}
    var badge = p.est>0 ? '<span class="badge badge-green">estoque: '+p.est+'</span>' : '<span class="badge badge-amber">sem estoque</span>';
    h+='<div class="vi-row"><div class="vi-nm">'+p.nome+'</div><div class="vi-pr">'+fmt(p.preco)+'</div>'+badge+
      '<div class="qin">'+
        '<button onclick="altQ('+p.id+',-1)">−</button>'+
        '<input type="number" min="0" value="'+q+'" id="q'+p.id+'" onchange="setQ('+p.id+',this.value)">'+
        '<button onclick="altQ('+p.id+',1)">+</button>'+
      '</div></div>';
  });
  document.getElementById('l-lista').innerHTML = h || '<div class="empty">Nenhum produto encontrado</div>';
}

function altQ(id, d) {
  var el=document.getElementById('q'+id); if(!el) return;
  var nv=Math.max(0,(parseInt(el.value)||0)+d); el.value=nv; setQ(id,nv);
}
function setQ(id, val) {
  var q=Math.max(0,parseInt(val)||0);
  var p=null; for(var i=0;i<db.produtos.length;i++){if(db.produtos[i].id===id){p=db.produtos[i];break;}}
  if(!p) return;
  var idx=-1; for(var j=0;j<carr.length;j++){if(carr[j].id===id){idx=j;break;}}
  if(q===0){if(idx>=0)carr.splice(idx,1);}
  else{if(idx>=0)carr[idx].qtd=q; else carr.push({id:id,nome:p.nome,preco:p.preco,qtd:q});}
  renderCarrinho();
}
function renderCarrinho() {
  var c=document.getElementById('carrinho-card');
  if(carr.length===0){c.style.display='none';return;}
  c.style.display='block'; var tot=0; var h='';
  carr.forEach(function(x){var s=x.preco*x.qtd; tot+=s;
    h+='<div class="vi-row"><div class="vi-nm">'+x.nome+'</div><div class="vi-pr">'+fmt(x.preco)+' × '+x.qtd+'</div>'+
      '<div class="vi-tot">'+fmt(s)+'</div><button class="btn-sm" onclick="remC('+x.id+')">✕</button></div>';
  });
  document.getElementById('carr-itens').innerHTML=h;
  document.getElementById('carr-total').textContent=fmt(tot);
}
function remC(id){carr=carr.filter(function(x){return x.id!==id;}); var el=document.getElementById('q'+id); if(el)el.value=0; renderCarrinho();}
function limparCarrinho(){carr=[]; pgtoSel=null; atualizarPgtoUI(); document.querySelectorAll('[id^="q"]').forEach(function(e){if(!isNaN(e.id.slice(1)))e.value=0;}); renderCarrinho();}

function confirmarVenda(imprimir) {
  if(!carr.length||!vSel) return;
  if(!pgtoSel){
    document.getElementById('pgto-msg').textContent = '⚠️ Selecione a forma de pagamento antes de confirmar.';
    document.getElementById('pgto-msg').scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  var ag=new Date().toLocaleString('pt-BR');
  var grupoId = db.nxt++;
  carr.forEach(function(c){
    db.vendas.push({id:db.nxt++,grupoId:grupoId,vendedor:vSel,produtoId:c.id,produto:c.nome,preco:c.preco,quantidade:c.qtd,total:c.preco*c.qtd,data:ag,pagamento:pgtoSel});
    for(var i=0;i<db.produtos.length;i++){if(db.produtos[i].id===c.id&&db.produtos[i].est>0){db.produtos[i].est=Math.max(0,db.produtos[i].est-c.qtd);break;}}
  });
  saveDB();
  var tot=carr.reduce(function(s,c){return s+c.preco*c.qtd;},0);
  var m=document.getElementById('lancar-msg'); m.style.color='var(--green)';
  m.textContent='✔ Venda de '+fmt(tot)+' registrada para '+vSel+' ('+pgtoLabel(pgtoSel)+')!';
  setTimeout(function(){m.textContent='';},5000);
  var grupoIdGerado = grupoId;
  carr=[]; pgtoSel=null; atualizarPgtoUI(); renderLancar(); renderPainel();
  if (imprimir) {
    imprimirComprovante(grupoIdGerado);
  }
}

/* ---- VENDEDORES ---- */
function renderVendedores() {
  var data=db.vendedores.map(function(v){
    return{nome:v.nome,ativo:v.ativo!==false,total:totV(v.nome),qtd:qtdV(v.nome),lanc:vendsV(v.nome).length};
  }).sort(function(a,b){
    if(a.ativo!==b.ativo) return a.ativo?-1:1;
    return b.total-a.total;
  });
  var h='<tr><th>Vendedor</th><th>Status</th><th>Lançamentos</th><th>Itens</th><th>Total</th><th></th></tr>';
  data.forEach(function(v){
    var statusBadge=v.ativo
      ? '<span class="badge badge-green">Ativo</span>'
      : '<span class="badge badge-red">Inativo</span>';
    var btnInativar=v.ativo
      ? '<button class="btn-sm" onclick="inativarVendedor(\''+v.nome+'\')" style="color:var(--amber)">Inativar</button>'
      : '<button class="btn-sm" onclick="reativarVendedor(\''+v.nome+'\')" style="color:var(--green)">Reativar</button>';
    var temVendas=v.lanc>0;
    var btnExcluir=!temVendas
      ? '<button class="btn-sm" onclick="excluirVendedor(\''+v.nome+'\')" style="color:var(--red)">Excluir</button>'
      : '<span style="font-size:11px;color:var(--text3)">Excluir indisponível</span>';
    h+='<tr style="'+(v.ativo?'':'opacity:.6')+'">'
      +'<td class="nm">'+v.nome+'</td>'
      +'<td>'+statusBadge+'</td>'
      +'<td>'+v.lanc+'</td>'
      +'<td><span class="badge badge-blue">'+v.qtd+'</span></td>'
      +'<td style="font-family:monospace;color:var(--green);font-weight:700">'+fmt(v.total)+'</td>'
      +'<td style="display:flex;gap:4px;flex-wrap:wrap">'
        +'<button class="btn-sm" onclick="detV(\''+v.nome+'\')">Detalhar</button>'
        +btnInativar+btnExcluir
      +'</td>'
    +'</tr>';
  });
  document.getElementById('tab-vend').innerHTML=h;
  document.getElementById('card-det-v').style.display='none';
}

function detV(nome) {
  var pp={};
  vendsV(nome).forEach(function(v){if(!pp[v.produto])pp[v.produto]={qtd:0,total:0,preco:v.preco};pp[v.produto].qtd+=v.quantidade;pp[v.produto].total+=v.total;});
  var lista=Object.keys(pp).map(function(k){return{nome:k,qtd:pp[k].qtd,total:pp[k].total,preco:pp[k].preco};}).sort(function(a,b){return b.total-a.total;});
  var h='<tr><th>Produto</th><th>Preço</th><th>Qtd</th><th>Total</th></tr>';
  lista.forEach(function(p){h+='<tr><td class="nm">'+p.nome+'</td><td style="font-family:monospace">'+fmt(p.preco)+'</td><td><span class="badge badge-blue">'+p.qtd+'</span></td><td style="font-family:monospace;color:var(--green);font-weight:700">'+fmt(p.total)+'</td></tr>';});
  var tv=totV(nome); var qv=qtdV(nome);
  h+='<tr style="border-top:1px solid var(--border2)"><td colspan="2" style="font-weight:700;color:var(--text)">Total '+nome+'</td><td style="font-weight:700;color:var(--accent)">'+qv+'</td><td style="font-family:monospace;font-weight:700;color:var(--green)">'+fmt(tv)+'</td></tr>';
  document.getElementById('title-det-v').textContent='Detalhe — '+nome;
  document.getElementById('tab-det-v').innerHTML=h;
  document.getElementById('card-det-v').style.display='block';
}

/* ---- PRODUTOS ---- */
function renderProdutos() {
  var b=(document.getElementById('p-busca')?document.getElementById('p-busca').value:'').toLowerCase();
  var lista=db.produtos.filter(function(p){return p.nome.toLowerCase().indexOf(b)>=0;});
  var vp={};
  db.vendas.filter(function(v){return !v.cancelada;}).forEach(function(v){if(!vp[v.produtoId])vp[v.produtoId]={qtd:0,total:0};vp[v.produtoId].qtd+=v.quantidade;vp[v.produtoId].total+=v.total;});
  var h='<tr><th>#</th><th>Produto</th><th>Custo</th><th>Venda</th><th>Margem</th><th>Estoque</th><th>Vendido</th><th>Receita</th><th>Lucro</th><th>EAN</th><th style="text-align:center">Com.%</th><th></th></tr>';
  lista.forEach(function(p){
    var v=vp[p.id]||{qtd:0,total:0};
    var bg=p.est<=0?'badge-red':p.est<=5?'badge-amber':'badge-green';
    var custo=p.custo||0;
    var margem=custo>0?((p.preco-custo)/p.preco*100):null;
    var lucro=custo>0?(p.preco-custo)*v.qtd:null;
    var margemTxt=margem!==null?'<span class="badge '+(margem>=0?'badge-green':'badge-red')+'">'+Math.round(margem)+'%</span>':'<span style="color:var(--text3);font-size:12px">—</span>';
    var lucroTxt=lucro!==null?'<span style="font-family:monospace;color:'+(lucro>=0?'var(--green)':'var(--red)')+';font-weight:700">'+fmt(lucro)+'</span>':'<span style="color:var(--text3);font-size:12px">—</span>';
    var eanTxt=p.ean?'<span style="font-family:monospace;font-size:12px;color:var(--text2)">'+(p.ean||'—')+'</span>':'<span style="color:var(--text3);font-size:12px">—</span>';
    var comTxt=p.comissao>0?'<span style="background:#7c3aed;color:#fff;padding:2px 7px;border-radius:20px;font-size:11px;font-weight:700">'+p.comissao+'%</span>':'<span style="color:var(--text3)">—</span>';
    h+='<tr><td style="color:var(--text3);font-family:monospace">'+p.id+'</td>'+
      '<td class="nm">'+p.nome+'</td>'+
      '<td style="font-family:monospace;color:var(--text2)">'+( custo>0?fmt(custo):'<span style="color:var(--text3);font-size:12px">—</span>')+'</td>'+
      '<td style="font-family:monospace">'+fmt(p.preco)+'</td>'+
      '<td>'+margemTxt+'</td>'+
      '<td><span class="badge '+bg+'">'+p.est+'</span></td>'+
      '<td><span class="badge badge-blue">'+v.qtd+'</span></td>'+
      '<td style="font-family:monospace;color:var(--green);font-weight:700">'+fmt(v.total)+'</td>'+
      '<td>'+lucroTxt+'</td>'+
      '<td>'+eanTxt+'</td>'+
      '<td style="text-align:center">'+comTxt+'</td>'+
      '<td style="display:flex;gap:4px"><button class="btn-sm" onclick="editProd('+p.id+')">✏️ Editar</button></td>'+
    '</tr>';
  });
  document.getElementById('tab-prods').innerHTML=h;
}

function editEst(id) {
  if(!checarAdm('Editar estoque')) return;
  var p=null; for(var i=0;i<db.produtos.length;i++){if(db.produtos[i].id===id){p=db.produtos[i];break;}} if(!p) return;
  var n=prompt('Novo estoque para "'+p.nome+'":', p.est); if(n===null) return;
  p.est=Math.max(0,parseInt(n)||0); saveDB(); renderProdutos();
}

function editPrecos(id) {
  if(!checarAdm('Editar preços')) return;
  var p=null; for(var i=0;i<db.produtos.length;i++){if(db.produtos[i].id===id){p=db.produtos[i];break;}} if(!p) return;
  var custo=prompt('Preço de CUSTO para "'+p.nome+'" (R$):', p.custo||0);
  if(custo===null) return;
  var venda=prompt('Preço de VENDA para "'+p.nome+'" (R$):', p.preco);
  if(venda===null) return;
  var com=prompt('Comissão de "'+p.nome+'" (%)\n(0 = sem comissão):', p.comissao !== undefined ? p.comissao : 0);
  if(com===null) return;
  p.custo=parseFloat((custo+'').replace(',','.'))||0;
  p.preco=parseFloat((venda+'').replace(',','.'))||p.preco;
  p.comissao=parseFloat((com+'').replace(',','.'))||0;
  saveDB(); renderProdutos();
}

function editEanProd(id) {
  var p = db.produtos.find(function(x){ return x.id === id; });
  if (!p) return;
  var n = prompt('EAN do produto "' + p.nome + '":\n(deixe em branco para remover)', p.ean || '');
  if (n === null) return;
  var novoEan = (n || '').trim().replace(/\D/g,'');
  if (novoEan && db.produtos.some(function(x){ return x.id !== id && x.ean && x.ean === novoEan; })) {
    alert('⚠️ Esse EAN já está cadastrado em outro produto!');
    return;
  }
  p.ean = novoEan || '';
  saveDB();
  renderProdutos();
}

function editProd(id) {
  if (!checarAdm('Editar produto')) return;
  var p = null;
  for (var i = 0; i < db.produtos.length; i++) {
    if (db.produtos[i].id === id) { p = db.produtos[i]; break; }
  }
  if (!p) return;
  
  window._produtoEditando = p;
  
  document.getElementById('modal-prod-body').innerHTML = 
    '<div class="form-grid">' +
      '<div class="field" style="grid-column:span 2">' +
        '<label>Nome do produto</label>' +
        '<input id="ep-nome" value="' + p.nome.replace(/"/g, '&quot;') + '">' +
      '</div>' +
      '<div class="field">' +
        '<label>Preço de custo (R$)</label>' +
        '<input id="ep-custo" type="number" step="0.01" value="' + (p.custo || 0) + '">' +
      '</div>' +
      '<div class="field">' +
        '<label>Preço de venda (R$)</label>' +
        '<input id="ep-preco" type="number" step="0.01" value="' + p.preco + '">' +
      '</div>' +
      '<div class="field">' +
        '<label>Estoque</label>' +
        '<input id="ep-est" type="number" value="' + (p.est || 0) + '">' +
      '</div>' +
      '<div class="field">' +
        '<label>Comissão (%)</label>' +
        '<input id="ep-comissao" type="number" step="0.5" min="0" max="100" value="' + (p.comissao || 0) + '">' +
      '</div>' +
      '<div class="field" style="grid-column:span 2">' +
        '<label>EAN / Código de barras</label>' +
        '<input id="ep-ean" value="' + (p.ean || '') + '" placeholder="7891234567890" maxlength="14">' +
      '</div>' +
    '</div>';
  
  document.getElementById('modal-editar-prod').classList.add('open');
}

function fecharModalEditProd() {
  document.getElementById('modal-editar-prod').classList.remove('open');
  window._produtoEditando = null;
}

function salvarEditProd() {
  var p = window._produtoEditando;
  if (!p) { alert('Erro: produto não encontrado'); return; }
  
  var nome = document.getElementById('ep-nome').value.trim();
  var custo = parseFloat((document.getElementById('ep-custo').value || '0').replace(',', '.'));
  var preco = parseFloat((document.getElementById('ep-preco').value || '0').replace(',', '.'));
  var est = parseInt(document.getElementById('ep-est').value) || 0;
  var comissao = parseFloat((document.getElementById('ep-comissao').value || '0').replace(',', '.'));
  var ean = (document.getElementById('ep-ean').value || '').trim().replace(/\D/g, '');
  
  if (!nome) { alert('Nome é obrigatório!'); return; }
  
  if (ean && db.produtos.some(function(x) { return x.id !== p.id && x.ean === ean; })) {
    alert('⚠️ EAN já cadastrado em outro produto!'); return;
  }
  
  p.nome = nome;
  p.custo = custo;
  p.preco = preco;
  p.est = est;
  p.comissao = comissao;
  p.ean = ean || '';
  
  saveDB();
  renderProdutos();
  fecharModalEditProd();
}

var _eanTimer = null;

function onEanInput(val) {
  var clean = (val || '').replace(/\D/g,'');
  if (clean.length >= 8) {
    clearTimeout(_eanTimer);
    _eanTimer = setTimeout(function() {
      bipEan(clean);
      var el = document.getElementById('l-ean');
      if (el) { el.value = ''; el.focus(); }
    }, 120);
  }
}

function bipEan(codigo) {
  var ean = (codigo || '').replace(/\D/g,'');
  var msg = document.getElementById('ean-msg');
  if (!ean || ean.length < 8) return;
  if (!vSel) {
    if (msg) { msg.style.color = 'var(--red)'; msg.textContent = '⚠️ Selecione um vendedor primeiro!'; }
    return;
  }
  var prod = db.produtos.find(function(p){ return p.ean === ean; });
  if (!prod) {
    if (msg) { msg.style.color = 'var(--red)'; msg.textContent = '❌ EAN ' + ean + ' não cadastrado!'; }
    setTimeout(function(){ if (msg) msg.textContent = ''; }, 3000);
    return;
  }
  if (prod.est <= 0) {
    if (msg) { msg.style.color = 'var(--amber)'; msg.textContent = '⚠️ "' + prod.nome + '" sem estoque!'; }
    setTimeout(function(){ if (msg) msg.textContent = ''; }, 3000);
    return;
  }
  var idx = carr.findIndex(function(i){ return i.id === prod.id; });
  if (idx >= 0) {
    carr[idx].qtd++;
  } else {
    carr.push({ id: prod.id, nome: prod.nome, preco: prod.preco, qtd: 1 });
  }
  if (msg) {
    msg.style.color = 'var(--green)';
    msg.textContent = '✔ ' + prod.nome + ' (+1)';
    setTimeout(function(){ if (msg) msg.textContent = ''; }, 2500);
  }
  renderCarrinho();
}

function inativarVendedor(nome) {
  if(!checarAdm('Inativar vendedor')) return;
  if(!confirm('Inativar "'+nome+'"? Ele não aparecerá na tela de lançamento.')) return;
  for(var i=0;i<db.vendedores.length;i++){if(db.vendedores[i].nome===nome){db.vendedores[i].ativo=false;break;}}
  saveDB(); renderVendedores();
  if(vSel===nome){ vSel=null; }
}

function reativarVendedor(nome) {
  for(var i=0;i<db.vendedores.length;i++){if(db.vendedores[i].nome===nome){db.vendedores[i].ativo=true;break;}}
  saveDB(); renderVendedores();
}

function excluirVendedor(nome) {
  if(!checarAdm('Excluir vendedor')) return;
  var temVendas=db.vendas.some(function(v){return v.vendedor===nome;});
  if(temVendas){alert('Não é possível excluir um vendedor que possui vendas registradas.');return;}
  if(!confirm('Excluir permanentemente "'+nome+'?"')) return;
  db.vendedores=db.vendedores.filter(function(v){return v.nome!==nome;});
  saveDB(); renderVendedores();
}

function addVendedor() {
  if(!checarAdm('Cadastrar vendedor')) return;
  var nome = document.getElementById('nv-nome').value.trim().toUpperCase();
  var m = document.getElementById('nv-msg');
  if (!nome) { m.style.color='var(--red)'; m.textContent='Preencha o nome do vendedor.'; return; }
  var jaExiste = db.vendedores.some(function(v){ return v.nome === nome; });
  if (jaExiste) { m.style.color='var(--red)'; m.textContent='Já existe um vendedor com esse nome.'; return; }
  db.vendedores.push({ nome: nome });
  saveDB();
  m.style.color='var(--green)'; m.textContent='✔ Vendedor ' + nome + ' cadastrado!';
  document.getElementById('nv-nome').value = '';
  setTimeout(function(){ m.textContent=''; }, 3000);
  renderVendedores();
}

function addProduto() {
  if(!checarAdm('Cadastrar produto')) return;
  var nome  = document.getElementById('np-nome').value.trim();
  var custo = parseFloat(document.getElementById('np-custo').value) || 0;
  var preco = parseFloat(document.getElementById('np-preco').value) || 0;
  var est   = parseInt(document.getElementById('np-est').value) || 0;
  var ean = (document.getElementById('np-ean').value || '').trim().replace(/\D/g,'');
  var comissao = parseFloat(document.getElementById('np-comissao').value) || 0;
  var m = document.getElementById('np-msg');
  if (!nome || preco <= 0) { m.style.color='var(--red)'; m.textContent='Preencha nome e preço de venda.'; return; }
  if (ean && db.produtos.some(function(p){ return p.ean && p.ean === ean; })) {
    m.style.color='var(--red)'; m.textContent='⚠️ Esse EAN já está cadastrado em outro produto!'; return;
  }
  db.produtos.push({ id: db.nxt++, nome: nome, custo: custo, preco: preco, est: est, ean: ean || '', comissao: comissao });
  saveDB(); m.style.color='var(--green)'; m.textContent='✔ Produto adicionado!';
  document.getElementById('np-nome').value='';
  document.getElementById('np-custo').value='';
  document.getElementById('np-preco').value='';
  document.getElementById('np-est').value='';
  document.getElementById('np-ean').value='';
  document.getElementById('np-comissao').value='';
  setTimeout(function(){ m.textContent=''; }, 3000);
  renderProdutos();
}

/* ---- HISTORICO ---- */
function renderHistorico() {
  var sel=document.getElementById('h-vend'); var cur=sel.value;
  sel.innerHTML='<option value="">Todos os vendedores</option>';
  db.vendedores.forEach(function(v){var o=document.createElement('option');o.value=v.nome;o.textContent=v.nome;if(v.nome===cur)o.selected=true;sel.appendChild(o);});
  var fv=sel.value;
  var fp=(document.getElementById('h-pgto').value||'');
  var fb=(document.getElementById('h-busca').value||'').toLowerCase();
  var lista=db.vendas.slice().reverse().filter(function(v){
    if(fv&&v.vendedor!==fv) return false;
    if(fp&&v.pagamento!==fp) return false;
    if(fb&&v.produto.toLowerCase().indexOf(fb)<0) return false;
    return true;
  }).slice(0,300);
  var h='<tr><th>Data</th><th>Vendedor</th><th>Produto</th><th>Pgto</th><th>Qtd</th><th>Preço</th><th>Total</th><th></th></tr>';
  if(!lista.length){h+='<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text3)">Nenhuma venda encontrada</td></tr>';}
  else lista.forEach(function(v){
    var bc=pgtoBadgeClass(v.pagamento);
    h+='<tr style="'+(v.cancelada?'opacity:.55':'')+'">'+
      '<td style="font-size:12px;color:var(--text3)">'+v.data+'</td>'+
      '<td><span class="badge badge-purple">'+v.vendedor+'</span></td>'+
      '<td class="nm">'+v.produto+(v.cancelada?' <span class="badge badge-red">CANCELADA</span>':'')+'</td>'+
      '<td><span class="badge '+bc+'" style="white-space:nowrap">'+pgtoLabel(v.pagamento)+'</span></td>'+
      '<td><span class="badge badge-blue">'+v.quantidade+'</span></td>'+
      '<td style="font-family:monospace">'+fmt(v.preco)+'</td>'+
      '<td style="font-family:monospace;color:'+(v.cancelada?'var(--red)':'var(--green)')+';font-weight:700">'+(v.cancelada?'—':fmt(v.total))+'</td>'+
      '<td>'+(v.cancelada?'':'<button class="btn-sm" onclick="abrirEditar('+v.id+')">✏️ Editar</button>')+'</td>'+
    '</tr>';
  });
  document.getElementById('tab-hist').innerHTML=h;
}

/* ---- EDICAO DE VENDA ---- */
var editandoId = null;
var editCarr = [];
var editPgto = null;

function abrirEditar(id) {
  var venda = null;
  for(var i=0;i<db.vendas.length;i++){if(db.vendas[i].id===id){venda=db.vendas[i];break;}}
  if(!venda) return;
  editandoId = id;
  editCarr = [{id: venda.produtoId, nome: venda.produto, preco: venda.preco, qtd: venda.quantidade}];
  editPgto = venda.pagamento || null;
  renderModalEditar(venda);
  document.getElementById('modal-editar').classList.add('open');
}

function renderModalEditar(venda) {
  var v = venda || (function(){ for(var i=0;i<db.vendas.length;i++){if(db.vendas[i].id===editandoId) return db.vendas[i];} return null; })();
  if(!v) return;
  var pgtoKeys = ['dinheiro','pix','debito','credito_1_6','credito_7_10','convenio'];
  var pgtoHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px">';
  pgtoKeys.forEach(function(k){
    pgtoHtml += '<div class="pgto-btn'+(editPgto===k?' sel':'')+'" id="epgto-'+k+'" onclick="editSelPgto(\''+k+'\')"><span class="pgto-icon">'+pgtoLabel(k).split(' ')[0]+'</span>'+pgtoLabel(k).replace(/^\S+\s/,'')+'</div>';
  });
  pgtoHtml += '</div>';
  var itensHtml = '';
  editCarr.forEach(function(x){
    var s = x.preco*x.qtd;
    itensHtml += '<div class="vi-row">'+
      '<div class="vi-nm">'+x.nome+'</div>'+
      '<div class="vi-pr">'+fmt(x.preco)+'</div>'+
      '<div class="qin"><button onclick="editAltQ('+x.id+',-1)">−</button>'+
        '<input type="number" min="1" value="'+x.qtd+'" id="eq'+x.id+'" onchange="editSetQ('+x.id+',this.value)">'+
        '<button onclick="editAltQ('+x.id+',1)">+</button></div>'+
      '<div class="vi-tot">'+fmt(s)+'</div>'+
      '<button class="btn-sm" onclick="editRemItem('+x.id+')" style="color:var(--red)">✕</button></div>';
  });
  var buscaHtml = '<div style="margin-top:1rem"><div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Adicionar produto</div>'+
    '<input id="edit-busca" placeholder="Buscar..." style="width:100%;padding:8px 11px;font-size:13px;border:1px solid var(--border2);border-radius:var(--radius-sm);background:var(--surface2);color:var(--text);margin-bottom:8px" oninput="filtrarProdsEditar()">'+
    '<div id="edit-lista" style="max-height:180px;overflow-y:auto"></div></div>';
  var html =
    '<div style="font-size:12px;color:var(--text3);margin-bottom:1rem">Venda de <strong style="color:var(--accent)">'+v.vendedor+'</strong> — '+v.data+'</div>'+
    '<div style="margin-bottom:1rem"><div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Itens da venda</div>'+itensHtml+buscaHtml+'</div>'+
    '<div style="margin-bottom:.5rem"><div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Forma de pagamento</div>'+pgtoHtml+'</div>'+
    '<div style="font-size:12px;color:var(--red);min-height:16px;margin-top:4px" id="edit-pgto-msg"></div>';
  document.getElementById('modal-editar-body').innerHTML = html;
  setTimeout(filtrarProdsEditar, 50);
}

function editSelPgto(k){ editPgto = k; }
function editAltQ(id, d){
  var el=document.getElementById('eq'+id); if(!el) return;
  var nv=Math.max(0,(parseInt(el.value)||0)+d);
  if(nv===0){ editRemItem(id); return; }
  el.value=nv; editSetQ(id,nv);
}
function editSetQ(id, val){
  var q=Math.max(0,parseInt(val)||0);
  if(q===0){ editRemItem(id); return; }
  for(var i=0;i<editCarr.length;i++){if(editCarr[i].id===id){editCarr[i].qtd=q;break;}}
  renderModalEditar();
}
function editRemItem(id){
  editCarr=editCarr.filter(function(x){return x.id!==id;});
  renderModalEditar();
}
function filtrarProdsEditar(){
  var busca = (document.getElementById('edit-busca')||{}).value || '';
  var b = busca.toLowerCase();
  var lista = db.produtos.filter(function(p){ return p.nome.toLowerCase().indexOf(b)>=0; }).slice(0,20);
  var h = '';
  lista.forEach(function(p){
    var jatem = editCarr.some(function(x){return x.id===p.id;});
    if(!jatem){
      h += '<div class="vi-row" style="padding:6px 0"><div class="vi-nm" style="font-size:13px">'+p.nome+'</div><div class="vi-pr">'+fmt(p.preco)+'</div>'+
        '<button class="btn-sm" style="color:var(--green)" onclick="editAddItem('+p.id+')">+ Adicionar</button></div>';
    }
  });
  var el = document.getElementById('edit-lista');
  if(el) el.innerHTML = h || '<div style="font-size:12px;color:var(--text3);padding:8px 0">Nenhum produto encontrado</div>';
}
function editAddItem(id){
  var p=null; for(var i=0;i<db.produtos.length;i++){if(db.produtos[i].id===id){p=db.produtos[i];break;}} if(!p) return;
  if(!editCarr.some(function(x){return x.id===id;})) editCarr.push({id:id,nome:p.nome,preco:p.preco,qtd:1});
  renderModalEditar();
}

function salvarEdicao(){
  if(!editandoId) return;
  var vOrig=null; var vIdx=-1;
  for(var i=0;i<db.vendas.length;i++){if(db.vendas[i].id===editandoId){vOrig=db.vendas[i];vIdx=i;break;}}
  if(!vOrig) return;
  if(editCarr.length===0){
    if(!checarAdm('Cancelar venda')) return;
    if(!confirm('Deseja CANCELAR esta venda?')) return;
    for(var j=0;j<db.produtos.length;j++){if(db.produtos[j].id===vOrig.produtoId){db.produtos[j].est+=vOrig.quantidade;break;}}
    db.vendas[vIdx].quantidade=0; db.vendas[vIdx].total=0; db.vendas[vIdx].cancelada=true;
    db.vendas[vIdx].pagamento=editPgto||vOrig.pagamento;
    saveDB(); fecharModalEditar(); renderHistorico(); renderPainel(); return;
  }
  if(!editPgto){
    var m=document.getElementById('edit-pgto-msg');
    if(m) m.textContent='⚠️ Selecione a forma de pagamento.'; return;
  }
  for(var j2=0;j2<db.produtos.length;j2++){if(db.produtos[j2].id===vOrig.produtoId){db.produtos[j2].est+=vOrig.quantidade;break;}}
  if(editCarr.length===1 && editCarr[0].id===vOrig.produtoId){
    var c=editCarr[0];
    db.vendas[vIdx].quantidade=c.qtd; db.vendas[vIdx].total=c.preco*c.qtd;
    db.vendas[vIdx].pagamento=editPgto; db.vendas[vIdx].cancelada=false;
    for(var k=0;k<db.produtos.length;k++){if(db.produtos[k].id===c.id){db.produtos[k].est=Math.max(0,db.produtos[k].est-c.qtd);break;}}
  } else {
    db.vendas.splice(vIdx,1);
    var dtOrig=vOrig.data; var grupoId=vOrig.grupoId||vOrig.id;
    editCarr.forEach(function(c){
      db.vendas.push({id:db.nxt++,grupoId:grupoId,vendedor:vOrig.vendedor,produtoId:c.id,produto:c.nome,preco:c.preco,quantidade:c.qtd,total:c.preco*c.qtd,data:dtOrig,pagamento:editPgto,cancelada:false});
      for(var k=0;k<db.produtos.length;k++){if(db.produtos[k].id===c.id){db.produtos[k].est=Math.max(0,db.produtos[k].est-c.qtd);break;}}
    });
  }
  saveDB(); fecharModalEditar(); renderHistorico(); renderPainel();
}

function fecharModalEditar(){
  document.getElementById('modal-editar').classList.remove('open');
  editandoId=null; editCarr=[]; editPgto=null;
}

/* ---- VENDAS (agrupadas) ---- */
var editGrupoId = null;
var editGrupoCarr = [];
var editGrupoPgto = null;

function renderVendas() {
  var sel = document.getElementById('sv-vend');
  var cur = sel ? sel.value : '';
  if (sel) {
    sel.innerHTML = '<option value="">Todos os vendedores</option>';
    db.vendedores.forEach(function(v) {
      var o = document.createElement('option'); o.value = v.nome; o.textContent = v.nome;
      if (v.nome === cur) o.selected = true;
      sel.appendChild(o);
    });
  }
  var fv = sel ? sel.value : '';
  var fp = (document.getElementById('sv-pgto') ? document.getElementById('sv-pgto').value : '');
  var fb = ((document.getElementById('sv-busca') ? document.getElementById('sv-busca').value : '') || '').toLowerCase();
  var grupos = {};
  db.vendas.forEach(function(v) {
    var gid = v.grupoId != null ? v.grupoId : v.id;
    if (!grupos[gid]) grupos[gid] = { grupoId: gid, vendedor: v.vendedor, data: v.data, pagamento: v.pagamento, itens: [], total: 0 };
    grupos[gid].itens.push(v); grupos[gid].total += v.total;
  });
  var lista = Object.values(grupos).sort(function(a, b) { return b.grupoId - a.grupoId; });
  if (fv) lista = lista.filter(function(g) { return g.vendedor === fv; });
  if (fp) lista = lista.filter(function(g) { return g.pagamento === fp; });
  if (fb) lista = lista.filter(function(g) {
    if (g.vendedor.toLowerCase().indexOf(fb) >= 0) return true;
    return g.itens.some(function(i) { return i.produto.toLowerCase().indexOf(fb) >= 0; });
  });
  var container = document.getElementById('sv-lista');
  if (!lista.length) { container.innerHTML = '<div class="empty">Nenhuma venda encontrada</div>'; return; }
  var h = '';
  lista.slice(0, 200).forEach(function(g) {
    var bc = pgtoBadgeClass(g.pagamento);
    var nomes = g.itens.map(function(i) { return i.produto + ' ×' + i.quantidade; }).join(', ');
    h += '<div class="sv-card" id="svc-' + g.grupoId + '">' +
      '<div class="sv-card-header" onclick="toggleSvCard(' + g.grupoId + ')">' +
        '<span class="sv-num">#' + g.grupoId + '</span>' +
        '<span class="sv-vend-badge"><span class="badge badge-purple">' + g.vendedor + '</span></span>' +
        '<span class="sv-itens-preview">' + nomes + '</span>' +
        '<span><span class="badge ' + bc + '" style="white-space:nowrap">' + pgtoLabel(g.pagamento) + '</span></span>' +
        '<span class="sv-total">' + fmt(g.total) + '</span>' +
        '<span class="sv-data">' + g.data + '</span>' +
        '<span class="sv-expand-ico">▾</span>' +
      '</div>' +
      '<div class="sv-card-body">' +
        '<div style="margin-top:12px"><table style="width:100%"><tr>' +
          '<th style="text-align:left;padding:6px 8px;font-size:11px;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Produto</th>' +
          '<th style="padding:6px 8px;font-size:11px;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border);text-align:right">Preço</th>' +
          '<th style="padding:6px 8px;font-size:11px;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border);text-align:right">Qtd</th>' +
          '<th style="padding:6px 8px;font-size:11px;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border);text-align:right">Total</th>' +
        '</tr>';
    g.itens.forEach(function(it) {
      h += '<tr><td style="padding:7px 8px;color:var(--text);font-weight:600">' + it.produto + '</td>' +
        '<td style="padding:7px 8px;font-family:monospace;color:var(--text2);text-align:right">' + fmt(it.preco) + '</td>' +
        '<td style="padding:7px 8px;text-align:right"><span class="badge badge-blue">' + it.quantidade + '</span></td>' +
        '<td style="padding:7px 8px;font-family:monospace;color:var(--green);font-weight:700;text-align:right">' + fmt(it.total) + '</td></tr>';
    });
    h += '<tr style="border-top:1px solid var(--border2)"><td colspan="3" style="padding:8px 8px;font-weight:700;color:var(--text)">Total</td>' +
      '<td style="padding:8px 8px;font-family:monospace;font-weight:700;color:var(--green);text-align:right">' + fmt(g.total) + '</td></tr></table>' +
      '<div style="margin-top:10px;display:flex;justify-content:flex-end;gap:8px">' +
        '<button class="btn btn-primary" onclick="abrirEditarGrupo(' + g.grupoId + ');event.stopPropagation()">✏️ Editar esta venda</button>' +
        '<button class="btn btn-secondary" onclick="imprimirComprovante(' + g.grupoId + ');event.stopPropagation()" style="font-size:12px">🖨️ Imprimir comprovante</button></div>' +
      '</div></div></div>';
  });
  container.innerHTML = h;
}

function toggleSvCard(gid) {
  var el = document.getElementById('svc-' + gid);
  if (el) el.classList.toggle('open');
}

function abrirEditarGrupo(gid) {
  var itensGrupo = db.vendas.filter(function(v) { return (v.grupoId != null ? v.grupoId : v.id) === gid; });
  if (!itensGrupo.length) return;
  editGrupoId = gid;
  editGrupoCarr = itensGrupo.map(function(v) { return { id: v.produtoId, nome: v.produto, preco: v.preco, qtd: v.quantidade, vendaId: v.id }; });
  editGrupoPgto = itensGrupo[0].pagamento || null;
  renderModalEditarGrupo(itensGrupo[0]);
  document.getElementById('modal-editar-grupo').classList.add('open');
}

function renderModalEditarGrupo(ref) {
  var r = ref || (function() {
    var it = db.vendas.filter(function(v) { return (v.grupoId != null ? v.grupoId : v.id) === editGrupoId; });
    return it[0] || null;
  })();
  if (!r) return;
  var pgtoKeys = ['dinheiro','pix','debito','credito_1_6','credito_7_10','convenio'];
  var total = editGrupoCarr.reduce(function(s, x) { return s + x.preco * x.qtd; }, 0);
  var itensHtml = '';
  editGrupoCarr.forEach(function(x) {
    var s = x.preco * x.qtd;
    itensHtml += '<div class="vi-row"><div class="vi-nm">' + x.nome + '</div><div class="vi-pr">' + fmt(x.preco) + '</div>' +
      '<div class="qin"><button onclick="egAltQ(\'' + x.id + '\',-1)">−</button>' +
        '<input type="number" min="1" value="' + x.qtd + '" id="egq' + x.id + '" onchange="egSetQ(\'' + x.id + '\',this.value)">' +
        '<button onclick="egAltQ(\'' + x.id + '\',1)">+</button></div>' +
      '<div class="vi-tot">' + fmt(s) + '</div>' +
      '<button class="btn-sm" onclick="egRemItem(\'' + x.id + '\')" style="color:var(--red)">✕</button></div>';
  });
  var pgtoHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px" id="eg-pgto-grid">';
  pgtoKeys.forEach(function(k) {
    pgtoHtml += '<div class="pgto-btn' + (editGrupoPgto === k ? ' sel' : '') + '" id="egpgto-' + k + '" onclick="egSelPgto(\'' + k + '\')">' +
      '<span class="pgto-icon">' + pgtoLabel(k).split(' ')[0] + '</span>' + pgtoLabel(k).replace(/^\S+\s/, '') + '</div>';
  });
  pgtoHtml += '</div>';
  var html =
    '<div style="font-size:12px;color:var(--text3);margin-bottom:1rem">Venda de <strong style="color:var(--accent)">' + r.vendedor + '</strong> — ' + r.data + '</div>' +
    '<div style="margin-bottom:1rem"><div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Itens da venda</div>' + itensHtml +
    '<div style="margin-top:1rem"><div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Adicionar produto</div>' +
      '<input id="eg-busca" placeholder="Buscar..." style="width:100%;padding:8px 11px;font-size:13px;border:1px solid var(--border2);border-radius:var(--radius-sm);background:var(--surface2);color:var(--text);margin-bottom:8px" oninput="egFiltrarProds()">' +
      '<div id="eg-lista" style="max-height:180px;overflow-y:auto"></div></div></div>' +
    '<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">' +
      '<span style="font-size:12px;color:var(--text3)">Total da venda</span>' +
      '<span style="font-family:monospace;font-size:1.3rem;font-weight:700;color:var(--green)" id="eg-total">' + fmt(total) + '</span></div>' +
    '<div style="margin-bottom:.5rem"><div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Forma de pagamento</div>' + pgtoHtml + '</div>' +
    '<div style="font-size:12px;color:var(--red);min-height:16px;margin-top:4px" id="eg-pgto-msg"></div>';
  document.getElementById('modal-eg-body').innerHTML = html;
  setTimeout(egFiltrarProds, 50);
}

function egSelPgto(k) { editGrupoPgto = k; }
function egAltQ(id, d) {
  var el = document.getElementById('egq' + id); if (!el) return;
  var nv = Math.max(1, (parseInt(el.value) || 1) + d); el.value = nv; egSetQ(id, nv);
}
function egSetQ(id, val) {
  var q = Math.max(1, parseInt(val) || 1); var pid = parseInt(id);
  for (var i = 0; i < editGrupoCarr.length; i++) { if (editGrupoCarr[i].id === pid) { editGrupoCarr[i].qtd = q; break; } }
  renderModalEditarGrupo();
}
function egRemItem(id) {
  var pid = parseInt(id); editGrupoCarr = editGrupoCarr.filter(function(x) { return x.id !== pid; });
  renderModalEditarGrupo();
}
function egFiltrarProds() {
  var busca = (document.getElementById('eg-busca') || {}).value || '';
  var b = busca.toLowerCase();
  var lista = db.produtos.filter(function(p) { return p.nome.toLowerCase().indexOf(b) >= 0; }).slice(0, 20);
  var h = '';
  lista.forEach(function(p) {
    var jatem = editGrupoCarr.some(function(x) { return x.id === p.id; });
    if (!jatem) {
      h += '<div class="vi-row" style="padding:6px 0"><div class="vi-nm" style="font-size:13px">' + p.nome + '</div><div class="vi-pr">' + fmt(p.preco) + '</div>' +
        '<button class="btn-sm" style="color:var(--green)" onclick="egAddItem(' + p.id + ')">+ Adicionar</button></div>';
    }
  });
  var el = document.getElementById('eg-lista');
  if (el) el.innerHTML = h || '<div style="font-size:12px;color:var(--text3);padding:8px 0">Nenhum produto encontrado</div>';
}
function egAddItem(id) {
  var p = null; for (var i = 0; i < db.produtos.length; i++) { if (db.produtos[i].id === id) { p = db.produtos[i]; break; } }
  if (!p) return;
  if (!editGrupoCarr.some(function(x) { return x.id === id; })) editGrupoCarr.push({ id: id, nome: p.nome, preco: p.preco, qtd: 1 });
  renderModalEditarGrupo();
}

function salvarEdicaoGrupo() {
  if (editGrupoId == null) return;
  var originais = db.vendas.filter(function(v) { return (v.grupoId != null ? v.grupoId : v.id) === editGrupoId; });
  var ref = originais[0] || {};
  if (editGrupoCarr.length === 0) {
    if(!checarAdm('Cancelar venda')) return;
    if (!confirm('Deseja CANCELAR esta venda?')) return;
    originais.forEach(function(v) {
      for (var j = 0; j < db.produtos.length; j++) { if (db.produtos[j].id === v.produtoId) { db.produtos[j].est += v.quantidade; break; } }
    });
    db.vendas.forEach(function(v) {
      if ((v.grupoId != null ? v.grupoId : v.id) === editGrupoId) { v.quantidade = 0; v.total = 0; v.cancelada = true; }
    });
    saveDB(); fecharModalEditarGrupo(); renderVendas(); renderPainel(); return;
  }
  if (!editGrupoPgto) {
    var m = document.getElementById('eg-pgto-msg'); if (m) m.textContent = '⚠️ Selecione a forma de pagamento.'; return;
  }
  originais.forEach(function(v) {
    for (var j = 0; j < db.produtos.length; j++) { if (db.produtos[j].id === v.produtoId) { db.produtos[j].est += v.quantidade; break; } }
  });
  db.vendas = db.vendas.filter(function(v) { return (v.grupoId != null ? v.grupoId : v.id) !== editGrupoId; });
  editGrupoCarr.forEach(function(c) {
    db.vendas.push({ id: db.nxt++, grupoId: editGrupoId, vendedor: ref.vendedor, produtoId: c.id, produto: c.nome, preco: c.preco, quantidade: c.qtd, total: c.preco * c.qtd, data: ref.data, pagamento: editGrupoPgto, cancelada: false });
    for (var k = 0; k < db.produtos.length; k++) { if (db.produtos[k].id === c.id) { db.produtos[k].est = Math.max(0, db.produtos[k].est - c.qtd); break; } }
  });
  saveDB(); fecharModalEditarGrupo(); renderVendas(); renderPainel();
}

function fecharModalEditarGrupo() {
  document.getElementById('modal-editar-grupo').classList.remove('open');
  editGrupoId = null; editGrupoCarr = []; editGrupoPgto = null;
}

/* ---- FECHAMENTO ---- */
function limparDatas() { document.getElementById('f-dt-ini').value=''; document.getElementById('f-dt-fim').value=''; }

function gerarFechamento() {
  var periodo = document.getElementById('f-periodo').value.trim() || 'Período atual';
  var farm    = document.getElementById('f-farm').value.trim() || 'Farmácia';
  var resp    = document.getElementById('f-resp').value.trim() || '—';
  var obs     = document.getElementById('f-obs').value.trim();
  var dtIni   = document.getElementById('f-dt-ini').value;
  var dtFim   = document.getElementById('f-dt-fim').value;
  var dg      = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});

  function parseDDMMYYYY(str) {
    var partes = str.split(',')[0].trim().split('/');
    if (partes.length < 3) return null;
    return new Date(parseInt(partes[2]), parseInt(partes[1])-1, parseInt(partes[0]));
  }
  var vendasFilt = db.vendas.filter(function(v) {
    if (!dtIni && !dtFim) return true;
    var dv = parseDDMMYYYY(v.data);
    if (!dv) return true;
    if (dtIni) { var di = new Date(dtIni+'T00:00:00'); if (dv < di) return false; }
    if (dtFim) { var df = new Date(dtFim+'T23:59:59'); if (dv > df) return false; }
    return true;
  });

  var filtroLabel = '';
  if (dtIni || dtFim) {
    var ini = dtIni ? new Date(dtIni+'T00:00:00').toLocaleDateString('pt-BR') : '—';
    var fim = dtFim ? new Date(dtFim+'T00:00:00').toLocaleDateString('pt-BR') : '—';
    filtroLabel = ini + ' até ' + fim;
  }

  var tG=vendasFilt.reduce(function(s,v){return s+v.total;},0);
  var qG=vendasFilt.reduce(function(s,v){return s+v.quantidade;},0);
  var nL=vendasFilt.length;
  var tk=nL>0?tG/nL:0;
  var med=['🥇','🥈','🥉'];
  var pgtoTotais = {};
  var pgtoKeys = ['dinheiro','pix','debito','credito_1_6','credito_7_10','convenio'];
  pgtoKeys.forEach(function(k){pgtoTotais[k]=0;});
  vendasFilt.forEach(function(v){if(pgtoTotais[v.pagamento]!==undefined)pgtoTotais[v.pagamento]+=v.total;else if(v.pagamento)pgtoTotais[v.pagamento]=(pgtoTotais[v.pagamento]||0)+v.total;});
  var rank=db.vendedores.map(function(v){
    var vv=vendasFilt.filter(function(x){return x.vendedor===v.nome;});
    return{nome:v.nome,total:vv.reduce(function(s,x){return s+x.total;},0),qtd:vv.reduce(function(s,x){return s+x.quantidade;},0),lanc:vv.length};
  }).sort(function(a,b){return b.total-a.total;});
  var dets=[];
  rank.forEach(function(rv){
    var pp={};
    vendasFilt.filter(function(v){return v.vendedor===rv.nome;}).forEach(function(v){
      if(!pp[v.produto])pp[v.produto]={qtd:0,total:0,preco:v.preco};
      pp[v.produto].qtd+=v.quantidade;pp[v.produto].total+=v.total;
    });
    var prods=Object.keys(pp).map(function(k){return{nome:k,qtd:pp[k].qtd,total:pp[k].total,preco:pp[k].preco};}).sort(function(a,b){return b.total-a.total;});
    if(prods.length>0) dets.push({nome:rv.nome,total:rv.total,qtd:rv.qtd,lanc:rv.lanc,prods:prods});
  });
  var pp2={};
  vendasFilt.forEach(function(v){if(!pp2[v.produto])pp2[v.produto]={qtd:0,total:0};pp2[v.produto].qtd+=v.quantidade;pp2[v.produto].total+=v.total;});
  var topP=Object.keys(pp2).map(function(k){return{nome:k,qtd:pp2[k].qtd,total:pp2[k].total};}).sort(function(a,b){return b.total-a.total;});
  var ths='style="text-align:left;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd"';
  var tdr='style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:right"';
  var tdg='style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:right;font-weight:700;color:#1a5c35"';
  var tdn='style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px"';
  var trF='style="background:#f0f0f0;font-weight:700;border-top:2px solid #bbb"';
  var o='<div style="max-width:720px;margin:0 auto;font-family:Arial,sans-serif;color:#111;line-height:1.5">';
  o+='<div style="text-align:center;border-bottom:2px solid #111;padding-bottom:1.5rem;margin-bottom:1.5rem">'+
    '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#777;margin-bottom:6px">Relatório de Fechamento — RH / Financeiro</div>'+
    '<div style="font-size:2rem;font-weight:700">'+farm+'</div>'+
    '<div style="font-size:1.1rem;color:#444;margin-top:4px">'+periodo+'</div></div>';
  o+='<table style="width:100%;font-size:13px;margin-bottom:1.5rem;border-collapse:collapse">'+
    '<tr><td style="color:#666;padding:3px 0;width:40%">Data de geração</td><td style="font-weight:600">'+dg+'</td>'+
    '<td style="color:#666;padding:3px 0;width:20%">Responsável</td><td style="font-weight:600">'+resp+'</td></tr>'+
    '<tr><td style="color:#666;padding:3px 0">Lançamentos</td><td style="font-weight:600">'+nL+'</td>'+
    '<td style="color:#666;padding:3px 0">Itens vendidos</td><td style="font-weight:600">'+qG+'</td></tr>'+
    (filtroLabel?'<tr><td style="color:#666;padding:3px 0">Período filtrado</td><td colspan="3" style="font-weight:600;color:#1a5c35">'+filtroLabel+'</td></tr>':'')+
    (obs?'<tr><td style="color:#666;padding:3px 0">Observações</td><td colspan="3" style="font-style:italic">'+obs+'</td></tr>':'')+
  '</table>';
  o+='<div style="background:#f0f7f0;border:1.5px solid #b6d9b6;border-radius:8px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem">'+
    '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#4a7c59">Total geral do período</div>'+
    '<div style="font-size:2.2rem;font-weight:700;color:#1a5c35">R$ '+tG.toFixed(2).replace('.',',')+'</div></div>'+
    '<div style="text-align:right;font-size:13px;color:#555"><div>'+qG+' itens em '+nL+' lançamentos</div><div>Ticket médio: R$ '+tk.toFixed(2).replace('.',',')+'</div></div></div>';
  var pgtoNomes={dinheiro:'💵 Dinheiro',pix:'📲 PIX',debito:'💳 Débito',credito_1_6:'💳 Crédito 1–6x',credito_7_10:'💳 Crédito 7–10x',convenio:'🏥 Convênio'};
  o+='<div style="margin-bottom:1.5rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#555;border-bottom:1.5px solid #ddd;padding-bottom:6px;margin-bottom:10px">Resumo por forma de pagamento</div><table style="width:100%;border-collapse:collapse"><tr><th '+ths+'>Forma</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Total (R$)</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">%</th></tr>';
  pgtoKeys.forEach(function(k){
    var v=pgtoTotais[k]||0; var pct=tG>0?Math.round(v/tG*100):0;
    if(v>0) o+='<tr><td '+tdn+'>'+(pgtoNomes[k]||k)+'</td><td '+tdg+'>R$ '+v.toFixed(2).replace('.',',')+'</td><td '+tdr+'>'+pct+'%</td></tr>';
  });
  o+='</table></div>';
  o+='<div style="margin-bottom:1.5rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#555;border-bottom:1.5px solid #ddd;padding-bottom:6px;margin-bottom:10px">Ranking de vendedores</div><table style="width:100%;border-collapse:collapse"><tr><th '+ths+'>#</th><th '+ths+'>Vendedor</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Itens</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Lanç.</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Total (R$)</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">%</th></tr>';
  rank.forEach(function(v,i){
    var p=tG>0?Math.round(v.total/tG*100):0;
    o+='<tr style="'+(i===0?'background:#fffbeb':'')+'"><td '+tdn+' style="padding:7px 10px;border-bottom:1px solid #eee;font-size:16px">'+(med[i]||(i+1))+'</td>'+
      '<td '+tdn+' style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px;font-weight:'+(i===0?700:500)+'">'+v.nome+'</td>'+
      '<td '+tdr+'>'+v.qtd+'</td><td '+tdr+'>'+v.lanc+'</td><td '+tdg+'>R$ '+v.total.toFixed(2).replace('.',',')+'</td><td '+tdr+'>'+p+'%</td></tr>';
  });
  o+='<tr '+trF+'><td colspan="2" '+tdn+' style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px">TOTAL GERAL</td><td '+tdr+'>'+qG+'</td><td '+tdr+'>'+nL+'</td><td '+tdg+'>R$ '+tG.toFixed(2).replace('.',',')+'</td><td '+tdr+'>100%</td></tr></table></div>';
  var vendasComissao = vendasFilt.filter(function(v) {
    var prod = db.produtos.find(function(p){ return p.id === v.produtoId; });
    return prod && prod.comissao > 0 && !v.cancelada;
  });
  if (vendasComissao.length > 0) {
    var comPorVendedor = {};
    vendasComissao.forEach(function(v) {
      var prod = db.produtos.find(function(p){ return p.id === v.produtoId; });
      if (!prod) return;
      if (!comPorVendedor[v.vendedor]) {
        comPorVendedor[v.vendedor] = { itens: [], totalComissao: 0 };
      }
      var valorCom = (v.total * prod.comissao) / 100;
      comPorVendedor[v.vendedor].itens.push({
        produto: v.produto || prod.nome,
        qtd: v.quantidade,
        totalVenda: v.total,
        pct: prod.comissao,
        comissao: valorCom
      });
      comPorVendedor[v.vendedor].totalComissao += valorCom;
    });
    o+='<div style="margin-bottom:2rem;page-break-inside:avoid">';
    o+='<h3 style="color:#4c1d95;border-bottom:2px solid #7c3aed;padding-bottom:6px;margin-bottom:1rem">💜 Comissões a Pagar — Por Vendedor</h3>';
    o+='<p style="font-size:12px;color:#888;margin-bottom:1rem;font-style:italic">⚠️ Documento interno — não aparece no comprovante do cliente.</p>';
    var totalGeralCom = 0;
    Object.keys(comPorVendedor).sort().forEach(function(nome) {
      var cv = comPorVendedor[nome];
      totalGeralCom += cv.totalComissao;
      o+='<div style="margin-bottom:1.5rem">';
      o+='<div style="background:#f5f0ff;padding:8px 12px;border-radius:6px;font-weight:700;color:#4c1d95;margin-bottom:6px">👤 ' + nome + '</div>';
      o+='<table style="width:100%;border-collapse:collapse;font-size:13px">';
      o+='<tr style="background:#ede9fe"><th style="padding:6px 10px;text-align:left">Produto</th><th style="padding:6px 10px;text-align:right">Qtd</th><th style="padding:6px 10px;text-align:right">Total Venda</th><th style="padding:6px 10px;text-align:right">Com.%</th><th style="padding:6px 10px;text-align:right">Valor Comissão</th></tr>';
      cv.itens.forEach(function(it) {
        o+='<tr style="border-bottom:1px solid #e9d5ff"><td style="padding:6px 10px">'+it.produto+'</td><td style="padding:6px 10px;text-align:right">'+it.qtd+'</td><td style="padding:6px 10px;text-align:right">R$ '+it.totalVenda.toFixed(2).replace('.',',')+'</td><td style="padding:6px 10px;text-align:right;color:#7c3aed;font-weight:700">'+it.pct+'%</td><td style="padding:6px 10px;text-align:right;font-weight:700;color:#4c1d95">R$ '+it.comissao.toFixed(2).replace('.',',')+'</td></tr>';
      });
      o+='<tr style="background:#f5f0ff;font-weight:700;border-top:2px solid #c4b5fd"><td colspan="4" style="padding:7px 10px;color:#4c1d95">TOTAL A PAGAR — '+nome+'</td><td style="padding:7px 10px;text-align:right;font-size:14px;color:#4c1d95">R$ '+cv.totalComissao.toFixed(2).replace('.',',')+'</td></tr>';
      o+='</table></div>';
    });
    o+='<div style="background:#4c1d95;color:#fff;padding:10px 14px;border-radius:8px;font-size:15px;font-weight:700;text-align:right;margin-top:8px">💜 TOTAL GERAL DE COMISSÕES: R$ '+totalGeralCom.toFixed(2).replace('.',',')+'</div></div>';
  }
  dets.forEach(function(v){
    var sq=v.prods.reduce(function(s,p){return s+p.qtd;},0);
    o+='<div style="margin-bottom:1.5rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#555;border-bottom:1.5px solid #ddd;padding-bottom:6px;margin-bottom:10px">Detalhe — '+v.nome+'<span style="float:right;color:#1a5c35;font-size:13px">R$ '+v.total.toFixed(2).replace('.',',')+'</span></div><table style="width:100%;border-collapse:collapse"><tr><th '+ths+'>Produto</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Preço</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Qtd</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Total</th></tr>';
    v.prods.forEach(function(p){ o+='<tr><td '+tdn+'>'+p.nome+'</td><td '+tdr+'>R$ '+p.preco.toFixed(2).replace('.',',')+'</td><td '+tdr+'>'+p.qtd+'</td><td '+tdg+'>R$ '+p.total.toFixed(2).replace('.',',')+'</td></tr>'; });
    o+='<tr '+trF+'><td colspan="2" '+tdn+' style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px">Subtotal '+v.nome+'</td><td '+tdr+'>'+sq+'</td><td '+tdg+'>R$ '+v.total.toFixed(2).replace('.',',')+'</td></tr></table></div>';
  });
  var lucroTotal=0;
  o+='<div style="margin-bottom:2rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#555;border-bottom:1.5px solid #ddd;padding-bottom:6px;margin-bottom:10px">Produtos vendidos no período</div><table style="width:100%;border-collapse:collapse"><tr><th '+ths+'>#</th><th '+ths+'>Produto</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Qtd</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Receita</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Margem</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">Lucro est.</th><th style="text-align:right;padding:7px 10px;font-size:11px;color:#666;text-transform:uppercase;background:#f5f5f5;border-bottom:1px solid #ddd">%</th></tr>';
  topP.forEach(function(p,i){
    var pct=tG>0?Math.round(p.total/tG*100):0;
    var prodObj=null; for(var pi=0;pi<db.produtos.length;pi++){if(db.produtos[pi].nome===p.nome){prodObj=db.produtos[pi];break;}}
    var custo=prodObj&&prodObj.custo>0?prodObj.custo:null;
    var preco=prodObj?prodObj.preco:null;
    var margem=custo&&preco?((preco-custo)/preco*100):null;
    var lucro=custo&&preco?(preco-custo)*p.qtd:null;
    if(lucro) lucroTotal+=lucro;
    var margemTxt=margem!==null?Math.round(margem)+'%':'—';
    var lucroTxt=lucro!==null?'R$ '+lucro.toFixed(2).replace('.',','):'—';
    o+='<tr><td '+tdn+' style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px;color:#999">'+(i+1)+'</td>'+
      '<td '+tdn+' style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px;font-weight:600">'+p.nome+'</td>'+
      '<td '+tdr+'>'+p.qtd+'</td><td '+tdg+'>R$ '+p.total.toFixed(2).replace('.',',')+'</td>'+
      '<td '+tdr+'>'+margemTxt+'</td>'+
      '<td '+tdr+'>'+lucroTxt+'</td><td '+tdr+'>'+pct+'%</td></tr>';
  });
  o+='<tr '+trF+'><td colspan="3" '+tdn+' style="padding:7px 10px;border-bottom:1px solid #eee;font-size:13px">TOTAL</td><td '+tdg+'>R$ '+tG.toFixed(2).replace('.',',')+'</td><td '+tdr+'>—</td><td '+tdr+'>'+(lucroTotal>0?'R$ '+lucroTotal.toFixed(2).replace('.',','):'—')+'</td><td '+tdr+'>100%</td></tr></table></div>';
  o+='<div style="border-top:1.5px solid #ddd;padding-top:1.5rem;margin-top:2rem;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem"><div style="font-size:12px;color:#999">Gerado em '+dg+' · '+farm+'</div><div style="text-align:center;min-width:220px"><div style="border-top:1px solid #aaa;padding-top:8px;font-size:13px;color:#555">'+resp+'<br><span style="font-size:11px;color:#999">Responsável / Gestor</span></div></div></div>';
  o+='</div>';
  document.getElementById('conteudo-fechamento').innerHTML=o;
  document.getElementById('prev-fech').style.display='block';
  document.getElementById('prev-fech').scrollIntoView({behavior:'smooth'});
}

function imprimirFechamento() {
  var c=document.getElementById('conteudo-fechamento').innerHTML;
  var j=window.open('','_blank');
  j.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Fechamento</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:1.5cm;color:#111}@page{margin:1.5cm}@media print{body{padding:0}}</style></head><body>'+c+'</body></html>');
  j.document.close();
  setTimeout(function(){j.print();},600);
}

/* ---- CSV & RESET ---- */
function migrarCamposNovos() {
  var alterado = false;
  db.produtos.forEach(function(p) {
    if (p.ean === undefined || p.ean === null) {
      p.ean = '';
      alterado = true;
    }
    if (p.comissao === undefined || p.comissao === null) {
      p.comissao = 0;
      alterado = true;
    }
  });
  if (alterado) saveDB();
}

function imprimirComprovante(grupoId) {
  var itens = db.vendas.filter(function(v) {
    return (v.grupoId != null ? v.grupoId : v.id) === grupoId && !v.cancelada;
  });
  if (!itens.length) {
    alert('Nenhum item encontrado para este comprovante.');
    return;
  }
  var ref = itens[0];
  var dataStr = ref.data ? new Date(ref.data).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
  var pgtoLabels = {
    dinheiro: '💵 Dinheiro',
    pix: '📲 PIX',
    debito: '💳 Débito',
    credito_1_6: '💳 Crédito 1–6x',
    credito_7_10: '💳 Crédito 7–10x',
    convenio: '🏥 Convênio'
  };
  var total = itens.reduce(function(s, v) { return s + v.total; }, 0);
  var linhasItens = itens.map(function(v) {
    var unitario = v.quantidade > 0 ? (v.total / v.quantidade) : (v.preco || 0);
    return '<tr><td style="padding:5px 8px;border-bottom:1px solid #eee">' + (v.produto || '—') + '</td>' +
      '<td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center">' + v.quantidade + '</td>' +
      '<td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right">R$ ' + unitario.toFixed(2).replace('.', ',') + '</td>' +
      '<td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">R$ ' + v.total.toFixed(2).replace('.', ',') + '</td></tr>';
  }).join('');
  var html = '<!DOCTYPE html><html lang="pt-BR"><head>' +
    '<meta charset="UTF-8"><title>Comprovante #' + grupoId + '</title>' +
    '<style>body{font-family:Arial,sans-serif;max-width:380px;margin:20px auto;padding:16px;font-size:13px;color:#222}table{width:100%;border-collapse:collapse}th{background:#f0f0f0;padding:5px 8px;text-align:left;font-size:12px}.total-bar{display:flex;justify-content:space-between;background:#e53e3e;color:#fff;padding:10px 12px;border-radius:6px;font-size:16px;font-weight:700;margin-top:12px}.info{display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px}.divider{border:none;border-top:1px dashed #ccc;margin:10px 0}@media print{body{max-width:100%;margin:0;padding:8px}}</style></head><body>' +
    '<div style="text-align:center;margin-bottom:12px">' +
    '<img src="' + LOGO_PATH + '" alt="' + NOME_FARMACIA + '" style="height:48px;width:auto" onerror="this.style.display=\'none\'">' +
    '<div style="font-size:15px;font-weight:700;color:#e53e3e;margin-top:4px">' + NOME_FARMACIA + '</div></div>' +
    '<hr class="divider">' +
    '<div class="info"><span>Venda nº</span><strong>#' + grupoId + '</strong></div>' +
    '<div class="info"><span>Data</span><span>' + dataStr + '</span></div>' +
    '<div class="info"><span>Vendedor</span><strong>' + ref.vendedor + '</strong></div>' +
    '<div class="info"><span>Pagamento</span><span>' + (pgtoLabels[ref.pagamento] || ref.pagamento || '—') + '</span></div>' +
    '<hr class="divider">' +
    '<table><tr><th>Produto</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Subtotal</th></tr>' + linhasItens + '</table>' +
    '<div class="total-bar"><span>TOTAL</span><span>R$ ' + total.toFixed(2).replace('.', ',') + '</span></div>' +
    '<hr class="divider">' +
    '<div style="text-align:center;font-size:11px;color:#888">Obrigado pela preferência! • ' + NOME_FARMACIA + '</div>' +
    '</body></html>';
  var janela = window.open('', '_blank', 'width=420,height=620');
  if (!janela) { alert('Pop-up bloqueado! Permita pop-ups para este site e tente novamente.'); return; }
  janela.document.write(html);
  janela.document.close();
  setTimeout(function() { janela.print(); }, 600);
}

function resetar() {
  if (!checarAdm('Zerar período')) return;
  db.vendas=[]; saveDB();
  document.getElementById('modal-reset').classList.remove('open');
  renderPainel();
}

/* ---- CONTROLE DE ACESSO ---- */
var usuarioAtual = null;
var perfilSelecionado = null;
var SENHA_ADM = 'adm123';

function selecionarPerfil(perfil) {
  perfilSelecionado = perfil;
  document.getElementById('pbtn-adm').classList.toggle('sel', perfil==='adm');
  document.getElementById('pbtn-vendedor').classList.toggle('sel', perfil==='vendedor');
  document.getElementById('campo-senha').style.display = perfil==='adm' ? 'block' : 'none';
  document.getElementById('login-msg').textContent = '';
  if (perfil==='adm') setTimeout(function(){ document.getElementById('login-senha').focus(); }, 50);
}

function fazerLogin() {
  var msg = document.getElementById('login-msg');
  if (!perfilSelecionado) { msg.textContent='Selecione um perfil para continuar.'; return; }
  if (perfilSelecionado==='adm') {
    var senha = document.getElementById('login-senha').value;
    if (senha !== SENHA_ADM) { msg.textContent='Senha incorreta.'; document.getElementById('login-senha').value=''; return; }
  }
  enterApp(perfilSelecionado);
}

function fazerLogout() {
  usuarioAtual = null; perfilSelecionado = null;
  document.getElementById('login-senha').value = '';
  document.getElementById('login-msg').textContent = '';
  document.getElementById('pbtn-adm').classList.remove('sel');
  document.getElementById('pbtn-vendedor').classList.remove('sel');
  document.getElementById('campo-senha').style.display = 'none';
  document.getElementById('tela-login').style.display = 'flex';
  document.getElementById('btn-sync').style.display = 'none';
  document.getElementById('btn-sheet').style.display = 'none';
  pararSyncLeitura();
}

function isAdm() { return usuarioAtual === 'adm'; }

function aplicarPermissoes() {
  var adm = isAdm();
  var badge = document.getElementById('user-badge');
  if (badge) {
    badge.textContent = adm ? '👑 ADM' : '🧑‍💼 Vendedor';
    badge.style.color = adm ? 'var(--amber)' : 'var(--accent)';
    badge.style.borderColor = adm ? 'rgba(251,191,36,.5)' : 'rgba(79,142,247,.5)';
  }
  var allButtons = ['btn-sync','btn-sheet'];
  allButtons.forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display=''; });
  var zerar = document.getElementById('btn-zerar');
  if(zerar) zerar.style.display = adm ? '' : 'none';
  document.querySelectorAll('.tab').forEach(function(t){
    if(t.textContent.indexOf('Fechamento')>=0 || t.textContent.indexOf('Produtos')>=0 || t.textContent.indexOf('Vendedores')>=0)
      t.style.display = adm ? '' : 'none';
  });
}

function checarAdm(acao) {
  if (!isAdm()) { alert('⛔ Acesso negado!\n\nA ação "'+acao+'" requer permissão de Administrador.'); return false; }
  return true;
}

/* ---- INIT ---- */
window.addEventListener('load', function() {
  db = loadDB();
  migrarCamposNovos();
});
