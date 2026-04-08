# Documentação Completa — App Jua

## 1. Visão Geral
O **App Jua** (Popular Farma Juazeiro) é uma aplicação web progressiva projetada para o controle de vendas internas em farmácias. Sua principal característica é o uso do **Google Sheets** como banco de dados persistente, permitindo que a equipe visualize e edite dados diretamente na planilha enquanto o aplicativo fornece uma interface otimizada para lançamentos e gestão.

## 2. Arquitetura Técnica

A arquitetura é composta por quatro camadas principais:

### 2.1. Frontend (Interface do Usuário)
- **Tecnologia**: HTML5, CSS3 (Vanilla) e JavaScript (Vanilla ES5).
- **Hospedagem**: Vercel.
- **Estado Local**: Utiliza `localStorage` para persistência offline e cache de dados.
- **Responsividade**: Layout adaptado para dispositivos móveis e desktops.

### 2.2. Camada de Proxy (API Serverless)
- **Tecnologia**: Vercel Edge Functions (`api/proxy.js`).
- **Função**: Atua como uma ponte entre o navegador e o Google Apps Script para contornar restrições de CORS (Cross-Origin Resource Sharing) e facilitar o envio de payloads maiores via POST.

### 2.3. Backend (Lógica de Negócio)
- **Tecnologia**: Google Apps Script (GAS).
- **Função**: Processa as requisições do App, realiza o parse dos dados, gerencia a concorrência (merge de dados) e sincroniza as informações com as abas da planilha.

### 2.4. Banco de Dados (Persistência)
- **Tecnologia**: Google Sheets.
- **Estrutura**:
  - **Aba "DB"**: Armazena todo o estado do sistema (JSON) na célula `A1`.
  - **Abas "Produtos", "Vendedores", "Vendas"**: Funcionam como visualizações denormalizadas para leitura humana e relatórios.

---

## 3. Fluxo de Dados e Sincronização

### 3.1. Processo de Leitura (Download)
1. O App faz um GET para o Proxy → Apps Script.
2. O Apps Script lê a célula `A1` da aba "DB".
3. Os dados são retornados como JSON para o App.
4. O App compara o `lastUpdate` do servidor com o local para decidir se atualiza o cache.

### 3.2. Processo de Escrita (Upload)
1. Após qualquer alteração (venda, edição), o App atualiza o objeto central `db`.
2. O App envia o objeto completo via POST (através do proxy) para o Apps Script.
3. **Mecanismo de Merge**: O Apps Script compara IDs de vendas e timestamps para garantir que dados novos de outros vendedores não sejam sobrescritos, mesclando as listas de vendas, produtos e vendedores.
4. O JSON resultante é salvo em `A1` e as abas de visualização são reconstruídas.

---

## 4. Funcionalidades Principais

| Módulo | Descrição |
|--------|-----------|
| **Painel (Dashboard)** | Exibe métricas em tempo real: Total vendido, Itens, Ticket Médio e Ranking de Vendedores. |
| **Lançamento de Vendas** | Interface de carrinho de compras com busca de produtos, seleção de vendedor e formas de pagamento. |
| **Gestão de Produtos** | Cadastro e edição de preços (custo/venda), estoque, comissões e código EAN. |
| **Gestão de Vendedores** | Controle de status (Ativo/Inativo) e visualização de desempenho individual. |
| **Histórico e Relatórios** | Lista de todas as vendas com opção de cancelamento (exclusivo Admin) e detalhamento por grupo de venda. |
| **Fechamento** | Resumo financeiro para conferência de caixa por forma de pagamento. |

---

## 5. Avaliação Técnica

### Pontos Fortes
- **Custo Zero**: Infraestrutura baseada em ferramentas gratuitas (Google e Vercel).
- **Simplicidade de Uso**: Interface intuitiva e direta.
- **Transparência**: O dono da farmácia pode acompanhar tudo pela planilha em tempo real.
- **Resiliência**: O sistema de merge no Apps Script é uma solução criativa para evitar conflitos em um ambiente multi-usuário sem banco de dados SQL tradicional.

### Riscos e Limitações
- **Escalabilidade**: Como o banco de dados inteiro é lido/escrito a cada transação, o desempenho cairá proporcionalmente ao crescimento do histórico de vendas.
- **Segurança**: A senha de Admin (`adm123`) é estática e o link da planilha precisa de proteção rigorosa.
- **Arquitetura Monolítica**: O arquivo `app.js` é muito extenso, dificultando manutenções complexas ou testes automatizados.

---

## 6. Próximos Passos Sugeridos
1. **Refatoração**: Modularizar o `app.js` em componentes ou arquivos menores por funcionalidade.
2. **Otimização de DB**: Migrar para uma estrutura onde o histórico antigo de vendas seja arquivado em outras células/abas para diminuir o tamanho do JSON trafegado.
3. **Segurança**: Implementar um sistema de login mais robusto (ex: Firebase Auth ou integração melhor com Google OAuth).
4. **Offline Avançado**: Melhorar a fila de sincronização para garantir que o app funcione perfeitamente mesmo com instabilidade severa de internet.

## 7. Regras de Exclusão de Produtos

Para garantir a integridade dos dados históricos, o sistema possui uma trava de segurança na exclusão de produtos:

- **Restrição**: Produtos que possuem qualquer registro de venda associado (mesmo que a venda tenha sido cancelada) não podem ser excluídos permanentemente através da interface. Nesses casos, o botão de "Excluir" é substituído pelo texto "Excluir indisponível".
- **Opção 1 (Recomendada) - Inativar**: O operador deve utilizar a opção "Inativar". Isso remove o produto da tela de lançamentos e buscas, mas preserva os dados históricos para relatórios de lucratividade e métricas do painel.
- **Opção 2 - Exclusão Total**: Caso seja estritamente necessário remover o produto, todos os registros de vendas associados a ele devem ser removidos do banco de dados primeiro.

---
**Documentação gerada em**: 08/04/2026  
**Responsável**: Tecsperts tecnologia

