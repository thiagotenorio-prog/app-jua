# Controle de Vendas — Farmácia

Sistema web para controle de vendas, estoque e fechamento de período em farmácia.

## Stack

- HTML5 + CSS3 + JavaScript (Vanilla)
- Armazenamento: localStorage + Google Sheets (futuro)
- Deploy: Vercel (estático)

## Estrutura do Projeto

```
/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos
├── js/
│   └── app.js          # Lógica da aplicação
├── vercel.json         # Configuração de deploy
└── .gitignore
```

## Como fazer deploy na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Importe o projeto — a Vercel detecta automaticamente como site estático
4. Deploy! O app estará disponível em `https://seu-projeto.vercel.app`

### Deploy via CLI

```bash
npm i -g vercel
vercel
```

## Como subir no GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/controle-vendas-farmacia.git
git push -u origin main
```

## Integração Google Sheets (futuro)

A função `setSheetsConfig(spreadsheetId, apiKey)` está preparada para sincronização. Para ativar:

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Habilite a **Google Sheets API**
3. Gere uma **API Key** com acesso à Sheets API
4. Compartilhe sua planilha com o e-mail da service account
5. Chame `setSheetsConfig('SEU_SPREADSHEET_ID', 'SUA_API_KEY')` no console ou adicione no código

## Perfis de acesso

- **Vendedor**: pode lançar vendas
- **Administrador**: acesso completo (senha: `adm123`)

## Funcionalidades

- Lançamento de vendas por vendedor
- Controle de estoque
- Múltiplas formas de pagamento
- Ranking de vendedores
- Fechamento de período (impressão/PDF)
- Exportação CSV
- Histórico de vendas
- Persistência em localStorage
