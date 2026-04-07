// ============================================================
// APP JUA - Google Apps Script com Controle de Versão
// Sistema de timestamp e merge para evitar sobrescritas
// ============================================================

var SPREADSHEET_ID = '1RwUiXrhat6ZHwMcSkfhJ9HNIwBUqSZNUaQZzA0qf3mI';

function doGet(e) {
  var action = e.parameter.action || 'read';
  if (action === 'read')  return readAll();
  if (action === 'clear') return clearDb();
  if (action === 'write') return writeFromBase64(e.parameter.data);
  if (action === 'check') return checkTimestamp();
  return ContentService
    .createTextOutput(JSON.stringify({error: 'Ação desconhecida'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    return saveAll(data);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function checkTimestamp() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var dbSheet = ss.getSheetByName('DB');
    if (!dbSheet) return ContentService
      .createTextOutput(JSON.stringify({error: 'Aba DB não encontrada'}))
      .setMimeType(ContentService.MimeType.JSON);

    var raw = dbSheet.getRange('A1').getDisplayValue();
    var jsonValue = (raw === null || raw === undefined) ? '' : String(raw).trim();

    if (jsonValue === '' || jsonValue === '{}') return ContentService
      .createTextOutput(JSON.stringify({timestamp: null, empty: true}))
      .setMimeType(ContentService.MimeType.JSON);

    var data = JSON.parse(jsonValue);
    return ContentService
      .createTextOutput(JSON.stringify({timestamp: data.lastUpdate || null, empty: false}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// CORREÇÃO: substituído Utilities.newBlob() (bugado sem MIME)
// por conversão direta de bytes → string
// ============================================================
function writeFromBase64(base64Data) {
  try {
    var bytes = Utilities.base64Decode(base64Data);
    var jsonStr = '';
    for (var i = 0; i < bytes.length; i++) {
      jsonStr += String.fromCharCode(bytes[i]);
    }
    var data = JSON.parse(jsonStr);
    return saveAll(data);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({error: 'Erro ao decodificar dados: ' + err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function readAll() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var dbSheet = ss.getSheetByName('DB');
    if (!dbSheet) return ContentService
      .createTextOutput(JSON.stringify({error: 'Aba DB não encontrada'}))
      .setMimeType(ContentService.MimeType.JSON);

    var raw = dbSheet.getRange('A1').getDisplayValue();
    var jsonValue = (raw === null || raw === undefined) ? '' : String(raw).trim();

    if (jsonValue === '' || jsonValue === '{}') return ContentService
      .createTextOutput(JSON.stringify({empty: true}))
      .setMimeType(ContentService.MimeType.JSON);

    try {
      var data = JSON.parse(jsonValue);
      if (data && (data.vendas || data.vendedores || data.produtos)) {
        return ContentService
          .createTextOutput(JSON.stringify(data))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } catch(parseErr) {}

    // Tentativa de correção de escape duplo
    var corrigido = jsonValue;
    corrigido = corrigido.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    corrigido = corrigido.replace(/""/g, '"');
    if (corrigido.startsWith('"') && corrigido.endsWith('"')) {
      corrigido = corrigido.substring(1, corrigido.length - 1);
      corrigido = corrigido.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    try {
      var data2 = JSON.parse(corrigido);
      return ContentService
        .createTextOutput(JSON.stringify(data2))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(parseErr2) {
      dbSheet.getRange('A1').setValue('');
      return ContentService
        .createTextOutput(JSON.stringify({empty: true, cleared: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch(outerErr) {
    return ContentService
      .createTextOutput(JSON.stringify({error: 'Erro ao ler: ' + (outerErr.message || outerErr)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function clearDb() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var dbSheet = ss.getSheetByName('DB');
    if (!dbSheet) return ContentService
      .createTextOutput(JSON.stringify({error: 'Aba DB não encontrada'}))
      .setMimeType(ContentService.MimeType.JSON);
    dbSheet.getRange('A1').setValue('');
    return ContentService
      .createTextOutput(JSON.stringify({success: true, cleared: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveAll(data, forceWrite) {
  forceWrite = forceWrite === true;
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var dbSheet = ss.getSheetByName('DB');
    if (!dbSheet) return ContentService
      .createTextOutput(JSON.stringify({error: 'Aba DB não encontrada'}))
      .setMimeType(ContentService.MimeType.JSON);

    var raw = dbSheet.getRange('A1').getDisplayValue();
    var jsonValue = (raw === null || raw === undefined) ? '' : String(raw).trim();

    var serverData = null;
    var serverTimestamp = null;
    if (jsonValue && jsonValue !== '' && jsonValue !== '{}') {
      try {
        serverData = JSON.parse(jsonValue);
        serverTimestamp = serverData.lastUpdate || null;
      } catch(e) { serverData = null; }
    }

    var clientTimestamp = data.lastUpdate || null;
    var needsMerge = false;
    var mergedData = null;

    if (!forceWrite && serverTimestamp && clientTimestamp && serverTimestamp !== clientTimestamp) {
      mergedData = mergeData(serverData, data);
      needsMerge = true;
    }

    if (!needsMerge) {
      data.lastUpdate = new Date().toISOString();
      if (serverData && serverData.nxt && data.nxt) {
        data.nxt = Math.max(serverData.nxt, data.nxt);
      } else if (serverData && serverData.nxt) {
        data.nxt = serverData.nxt;
      }
      if (serverData) {
        if (serverData.vendas && data.vendas) {
          var localVendasIds = data.vendas.map(function(v) { return v.id; });
          serverData.vendas.forEach(function(v) {
            if (localVendasIds.indexOf(v.id) === -1) data.vendas.push(v);
          });
        }
        if (serverData.produtos && data.produtos) {
          var localProdutosIds = data.produtos.map(function(p) { return p.id; });
          serverData.produtos.forEach(function(p) {
            if (localProdutosIds.indexOf(p.id) === -1) data.produtos.push(p);
          });
        }
        if (serverData.vendedores && data.vendedores) {
          var localVendedoresNomes = data.vendedores.map(function(v) { return v.nome; });
          serverData.vendedores.forEach(function(v) {
            if (localVendedoresNomes.indexOf(v.nome) === -1) data.vendedores.push(v);
          });
        }
      }
    } else {
      mergedData.lastUpdate = new Date().toISOString();
      data = mergedData;
    }

    dbSheet.getRange('A1').setValue(JSON.stringify(data));
    syncToSheets(ss, data);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        timestamp: data.lastUpdate,
        merged: needsMerge,
        message: needsMerge ? 'Dados mesclados com sucesso' : 'Dados salvos com sucesso'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function mergeData(serverData, clientData) {
  var merged = { vendedores: [], produtos: [], vendas: [], nxt: 0 };
  merged.lastUpdate = clientData.lastUpdate || serverData.lastUpdate || new Date().toISOString();
  merged.nxt = Math.max((serverData && serverData.nxt) || 0, (clientData && clientData.nxt) || 0);

  var vendedorMap = {};
  if (serverData && serverData.vendedores) serverData.vendedores.forEach(function(v) { vendedorMap[v.nome] = v; });
  if (clientData && clientData.vendedores) clientData.vendedores.forEach(function(v) { vendedorMap[v.nome] = v; });
  merged.vendedores = Object.values(vendedorMap);

  var produtoMap = {};
  if (serverData && serverData.produtos) serverData.produtos.forEach(function(p) { produtoMap[p.id] = p; });
  if (clientData && clientData.produtos) clientData.produtos.forEach(function(p) { produtoMap[p.id] = p; });
  merged.produtos = Object.values(produtoMap);

  var vendaMap = {};
  if (serverData && serverData.vendas) serverData.vendas.forEach(function(v) { vendaMap[v.id] = v; });
  if (clientData && clientData.vendas) clientData.vendas.forEach(function(v) { vendaMap[v.id] = v; });
  merged.vendas = Object.values(vendaMap);

  return merged;
}

function syncToSheets(ss, data) {
  if (data.produtos)   syncProdutos(ss, data.produtos);
  if (data.vendedores) syncVendedores(ss, data.vendedores);
  if (data.vendas)     syncVendas(ss, data.vendas);
}

function syncProdutos(ss, produtos) {
  var sheet = ss.getSheetByName('Produtos');
  if (!sheet) return;
  var rows = [['ID', 'Nome do Produto', 'Preço de Custo', 'Preço de Venda', 'Estoque', 'EAN', 'Comissão (%)']];
  produtos.forEach(function(p) {
    rows.push([p.id||'', p.nome||'', p.custo!==undefined?p.custo:'', p.preco!==undefined?p.preco:'', p.est!==undefined?p.est:'', p.ean||'', p.comissao!==undefined?p.comissao:'']);
  });
  sheet.clear();
  sheet.getRange(1, 1, rows.length, 7).setValues(rows);
}

function syncVendedores(ss, vendedores) {
  var sheet = ss.getSheetByName('Vendedores');
  if (!sheet) return;
  var rows = [['Nome', 'Ativo']];
  vendedores.forEach(function(v) { rows.push([v.nome||'', v.ativo!==false?'SIM':'NÃO']); });
  sheet.clear();
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
}

function syncVendas(ss, vendas) {
  var sheet = ss.getSheetByName('Vendas');
  if (!sheet) return;
  var rows = [['ID','Grupo','Vendedor','Produto','Preço Unit.','Quantidade','Total','Data','Pagamento','Cancelada']];
  vendas.forEach(function(v) {
    rows.push([v.id||'', v.grupoId!==undefined?v.grupoId:'', v.vendedor||'', v.produto||'', v.preco!==undefined?v.preco:'', v.quantidade!==undefined?v.quantidade:'', v.total!==undefined?v.total:'', v.data||'', v.pagamento||'', v.cancelada?'SIM':'NÃO']);
  });
  sheet.clear();
  sheet.getRange(1, 1, rows.length, 10).setValues(rows);
}
