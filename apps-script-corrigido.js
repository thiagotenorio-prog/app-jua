var SPREADSHEET_ID = '1RwUiXrhat6ZHwMcSkfhJ9HNIwBUqSZNUaQZzA0qf3mI';

function doGet(e) {
  var action = e.parameter.action || 'read';
  if (action === 'read') {
    return readAll();
  }
  if (action === 'clear') {
    return clearDb();
  }
  if (action === 'write') {
    return writeFromBase64(e.parameter.data);
  }
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

function writeFromBase64(base64Data) {
  try {
    var decoded = Utilities.base64Decode(base64Data);
    var jsonStr = Utilities.newBlob(decoded).getDataAsString();
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
    if (!dbSheet) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Aba DB não encontrada'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Usa getDisplayValue() para evitar formula interpretation
    var raw = dbSheet.getRange('A1').getDisplayValue();
    var jsonValue = (raw === null || raw === undefined) ? '' : String(raw);
    jsonValue = jsonValue.trim();
    
    if (jsonValue === '' || jsonValue === '{}') {
      return ContentService
        .createTextOutput(JSON.stringify({empty: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Tenta fazer parse diretamente
    try {
      var data = JSON.parse(jsonValue);
      if (data && (data.vendas || data.vendedores || data.produtos)) {
        return ContentService
          .createTextOutput(JSON.stringify(data))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } catch(parseErr) {}
    
    // Se falhar, tenta corrigir formato CSV: "" vira " e remove \ escapados
    var corrigido = jsonValue;
    // Substitui sequencias de backslash+quote por aspas normais
    corrigido = corrigido.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    // Substitui "" por "
    corrigido = corrigido.replace(/""/g, '"');
    // Remove aspas externas duplas se houver
    if (corrigido.startsWith('"') && corrigido.endsWith('"')) {
      corrigido = corrigido.substring(1, corrigido.length - 1);
      corrigido = corrigido.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    
    try {
      var data = JSON.parse(corrigido);
      return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(parseErr2) {
      // Se nada funcionar, limpa a celula e retorna empty
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
    if (!dbSheet) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Aba DB não encontrada'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
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

function saveAll(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var dbSheet = ss.getSheetByName('DB');
  if (!dbSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({error: 'Aba DB não encontrada'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var jsonStr = JSON.stringify(data);
  dbSheet.getRange('A1').setValue(jsonStr);
  syncToSheets(ss, data);
  return ContentService
    .createTextOutput(JSON.stringify({success: true, timestamp: new Date().toISOString()}))
    .setMimeType(ContentService.MimeType.JSON);
}

function syncToSheets(ss, data) {
  if (data.produtos) syncProdutos(ss, data.produtos);
  if (data.vendedores) syncVendedores(ss, data.vendedores);
  if (data.vendas) syncVendas(ss, data.vendas);
}

function syncProdutos(ss, produtos) {
  var sheet = ss.getSheetByName('Produtos');
  if (!sheet) return;
  var rows = [['ID', 'Nome do Produto', 'Preço de Custo', 'Preço de Venda', 'Estoque']];
  produtos.forEach(function(p) {
    rows.push([p.id || '', p.nome || '', p.custo !== undefined ? p.custo : '', p.preco !== undefined ? p.preco : '', p.est !== undefined ? p.est : '']);
  });
  sheet.clear();
  sheet.getRange(1, 1, rows.length, 5).setValues(rows);
}

function syncVendedores(ss, vendedores) {
  var sheet = ss.getSheetByName('Vendedores');
  if (!sheet) return;
  var rows = [['Nome', 'Ativo']];
  vendedores.forEach(function(v) {
    rows.push([v.nome || '', v.ativo !== false ? 'SIM' : 'NÃO']);
  });
  sheet.clear();
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
}

function syncVendas(ss, vendas) {
  var sheet = ss.getSheetByName('Vendas');
  if (!sheet) return;
  var rows = [['ID', 'Grupo', 'Vendedor', 'Produto', 'Preço Unit.', 'Quantidade', 'Total', 'Data', 'Pagamento', 'Cancelada']];
  vendas.forEach(function(v) {
    rows.push([v.id || '', v.grupoId !== undefined ? v.grupoId : '', v.vendedor || '', v.produto || '', v.preco !== undefined ? v.preco : '', v.quantidade !== undefined ? v.quantidade : '', v.total !== undefined ? v.total : '', v.data || '', v.pagamento || '', v.cancelada ? 'SIM' : 'NÃO']);
  });
  sheet.clear();
  sheet.getRange(1, 1, rows.length, 10).setValues(rows);
}
