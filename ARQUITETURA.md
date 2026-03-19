# Arquitetura — App Jua

## Visão Geral

O App Jua é um sistema de controle de vendas para farmácia que usa Google Sheets como banco de dados centralizado em tempo real. Qualquer dispositivo com acesso à internet pode usar o app e sincronizar dados com a planilha.

---

## Fluxo de Dados

```
┌─────────────────┐
│   App Jua      │  ← js/app.js (navegador)
│  (Vercel)      │
└────────┬────────┘
         │ GET (leitura)
         │ GET + base64 (escrita)
         ↓
┌─────────────────┐
│  Google Apps    │  ← Código.gs (Google Apps Script)
│    Script      │     ID: AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD
└────────┬────────┘
         │ SpreadsheetApp (servidor-side)
         ↓
┌─────────────────┐
│   Google        │
│   Sheets        │  ← Farmácia - DB App Jua
│  (Planilha)     │     ID: 1RwUiXrhat6ZHwMcSkfhJ9HNIwBUqSZNUaQZzA0qf3mI
└─────────────────┘
```

---

## URLs e Identificadores

| Recurso | URL / ID |
|---------|----------|
| App publicado | https://app-jua.vercel.app |
| Apps Script | https://script.google.com/macros/s/AKfycbzpZfPTk-pEmhTw1Iiv4pOvhaO1fiiUteezRIy2AKhMmyBGwayg5Dueopl_MEHwSXLD/exec |
| Planilha | https://docs.google.com/spreadsheets/d/1RwUiXrhat6ZHwMcSkfhJ9HNIwBUqSZNUaQZzA0qf3mI/edit |

---

## Estrutura da Planilha

### Aba DB (principal)
- Célula: `A1`
- Conteúdo: JSON completo com todo o banco de dados
- Estrutura: `{"vendedores":[...],"produtos":[...],"vendas":[...],"nxt":1234}`
- O app lê e escreve TODOS os dados nesta célula
- As outras abas são cópias formatadas para visualização

### Aba Produtos
| Coluna | Conteúdo |
|--------|----------|
| A | ID |
| B | Nome do Produto |
| C | Preço de Custo (R$) |
| D | Preço de Venda (R$) |
| E | Estoque |

### Aba Vendedores
| Coluna | Conteúdo |
|--------|----------|
| A | Nome |
| B | Ativo (SIM/NÃO) |

### Aba Vendas
| Coluna | Conteúdo |
|--------|----------|
| A | ID |
| B | Grupo (venda agrupada) |
| C | Vendedor |
| D | Produto |
| E | Preço Unit. |
| F | Quantidade |
| G | Total (R$) |
| H | Data/Hora |
| I | Pagamento |
| J | Cancelada (SIM/NÃO) |

---

## Comunicação App ↔ Apps Script

### Leitura (GET)
```
App → GET https://script.google.com/.../exec?action=read
     ← JSON com dados do banco ou {empty: true}
```

### Escrita (GET + base64)
```
App → GET https://script.google.com/.../exec?action=write&data=<base64>
     ← {success: true, timestamp: "..."}
```

**Por que GET com base64 em vez de POST?**
- POST para Google Apps Script sofre bloqueios de CORS
- GET com URL permite leitura da resposta mesmo após redirect
- Base64 codifica o JSON grande para passar via URL

**Limitações:**
- URL máxima: ~2000 caracteres (navegadores modernos)
- Para bancos pequenos/médios funciona bem
- Se os dados crescerem muito, pode ser necessário migrar para POST com CORS

---

## Fluxo de Sincronização

### Ao fazer login:
1. App chama `loadFromSheet()` → GET action=read
2. Se `{empty: true}` → chama `saveToSheet()` para popular com dados iniciais
3. Dados são salvos no localStorage do navegador

### Após cada ação (venda, cadastro, edição):
1. App atualiza o objeto `db` em memória
2. Chama `saveDB()` que:
   - Salva no localStorage (`farm_db`)
   - Chama `saveToSheet()` para sincronizar com a planilha

### Auto-save:
- A cada 10 segundos, se houver alterações pendentes, salva automaticamente

---

## Autenticação

- **Admin**: senha simples `adm123`
- **Vendedor**: seleção de nome (sem senha)
- **Sem OAuth**: Google Sign-In foi removido

---

## Formas de Pagamento

| Chave | Label |
|-------|-------|
| dinheiro | 💵 Dinheiro |
| pix | 📲 PIX |
| debito | 💳 Débito |
| credito_1_6 | 💳 Crédito 1–6x |
| credito_7_10 | 💳 Crédito 7–10x |
| convenio | 🏥 Convênio |

---

## Regras de Desenvolvimento

### Quando mexer no Apps Script:
- Nova aba na planilha que precisa ser lida/escrita
- Mudança na lógica de parsing de dados
- Adicionar nova função de sincronização

### Quando NÃO precisa mexer no Apps Script:
- Mudanças puramente no app (UI, cálculos, novas telas)
- Mudanças nos dados existentes (já funciona automaticamente)
- Correções no app.js (só precisa deploy no Vercel)

### ~90% das novas funcionalidades só precisam de mudanças no app.js

---

## Compartilhamento

- Planilha: "Qualquer pessoa com o link pode editar"
- Apps Script: implantado como "Qualquer pessoa pode acessar"
- Vercel: sem proteção SSO

---

## Segurança

- App de uso interno (farmácia)
- Admin requer senha `adm123`
- Vendedores não têm acesso a funções administrativas
- Dados sensíveis ficam visíveis na planilha compartilhada

---

## Estrutura de Arquivos

```
App Jua/
├── index.html          # HTML principal
├── css/styles.css      # Estilos
├── js/app.js           # Lógica completa do app
├── ARQUITETURA.md      # Este documento
└── README.md          # Documentação do projeto
```

---

## Vendedores Padrão

LAIS, IVAN, LIVIA, JADILSON, CARLA, BETANIA

---

## Produtos Iniciais (49 itens)

Inclui: HISTAMIN, OMEGA 3, MILIMETRIC, SHAMPOO JOHNSON, BEM SAUDE, DIPIRONA, BEPANTRIZ, PAMPERS, ALBENDAZOL, DORFLEX, etc.
