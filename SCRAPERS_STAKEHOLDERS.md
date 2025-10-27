# Sistema de Scrapers - Radar de Stakeholders

## Visão Geral

Sistema automatizado de scraping para coletar notícias e comunicados de organizações externas (sindicatos, patronato, ONGs, etc.) para o Radar Legislativo.

## Arquitetura

```
src/
├── scrapers/
│   └── stakeholders.js       ← Scraper principal (genérico)
├── services/
│   └── scheduler.js          ← Agendamento automático
├── models/
│   └── Document.js           ← Modelo de dados (Supabase)
└── controllers/
    └── stakeholderController.js ← API endpoints
```

## Stakeholders Configurados

### Concertação Social (5 organizações)

| ID | Nome | URL | Status |
|----|------|-----|--------|
| `cgtp` | CGTP-IN | https://www.cgtp.pt/accao-e-luta | ⚠️ Bloqueado (403) |
| `ugt` | UGT | https://www.ugt.pt/noticias | ⚠️ Bloqueado (403) |
| `cap` | CAP | https://www.cap.pt/noticias-cap | ⚠️ Bloqueado (403) |
| `ccp` | CCP | https://ccp.pt/noticias/ | ⚠️ Bloqueado (403) |
| `ctp` | CTP | https://ctp.org.pt/noticias | ⚠️ Bloqueado (403) |

### Outras Categorias Implementadas

- **Laboral**: ACT, CITE, AIMA
- **Ambiente**: APA, IGAMAOT, DGAV, DGEG, ADENE, ERSE
- **Agricultura**: DGADR, INIAV
- **Economia/Finanças**: IAPMEI, AdC, AT Aduaneiro, Banco de Portugal, Portugal Global, Portal Consumidor, DGAE
- **Saúde**: INFARMED, ERS, IGAS
- **Imobiliário/Habitação**: CMVM, DGTerritório, IHRU

## Funcionalidades Implementadas

### 1. Scraper Genérico com Múltiplos Seletores

Cada stakeholder tem configurados **múltiplos seletores CSS** como fallback:

```javascript
cgtp: {
  url: "https://www.cgtp.pt/accao-e-luta",
  nome: "CGTP-IN",
  categoria: "concertacao_social",
  seletores: [
    ".entry-title a",           // Tentativa 1
    "article h2 a",              // Tentativa 2
    ".post-title a",             // Tentativa 3
    "h2 a[href*='/accao-e-luta/']", // Tentativa 4
    ".content-item a"            // Tentativa 5
  ],
  seletorData: ".entry-date, .post-date, time, .published",
  seletorResumo: ".entry-summary, .entry-content, .excerpt, p",
  tipo_conteudo: "noticia",
}
```

### 2. Sistema de Retry Inteligente

- **3 tentativas** com backoff exponencial
- Delay entre tentativas: 3s, 6s, 9s
- User-Agent rotativo (5 variações)
- Headers HTTP completos (simulando navegador real)

### 3. Tratamento Robusto de Erros

```javascript
// Erros tratados:
- 403 Forbidden (proteção anti-scraping)
- 404 Not Found
- ECONNABORTED (timeout)
- ENOTFOUND (DNS)
- Duplicados na base de dados
```

### 4. Extração de Dados Avançada

```javascript
// Dados extraídos de cada notícia:
{
  tipo_conteudo: "noticia",
  tipo_radar: "stakeholders",    // Importante para filtros
  categoria: "concertacao_social",
  titulo: "...",
  data_publicacao: "2025-10-27", // Parseado de vários formatos
  url: "https://...",
  fonte: "cgtp",
  entidades: "CGTP-IN",
  resumo: "..."                   // Extraído ou gerado do título
}
```

### 5. Agendamento Automático (Scheduler)

```javascript
// Horários configurados:
- Segunda a Sexta, 9h-19h: a cada 15 minutos
- Noites e madrugadas: a cada 2 horas
- Fins de semana: 1x por dia às 10h
- Total estimado: 50-60 execuções/dia
```

## Como Usar

### 1. Executar Manualmente

```bash
# Executar todos os scrapers
node src/scrapers/runScraper.js

# Testar apenas stakeholders
node test-stakeholders.js
```

### 2. Via API

```bash
# Executar scraping manual (endpoint a criar)
curl -X POST http://localhost:3000/api/scrape/stakeholders

# Buscar documentos de stakeholders
curl http://localhost:3000/api/stakeholders/documents?categoria=concertacao_social

# Estatísticas
curl http://localhost:3000/api/stakeholders/stats
```

### 3. Filtrar por Categoria/Fonte

```bash
# Documentos da CGTP
curl http://localhost:3000/api/stakeholders/documents?fonte=cgtp

# Documentos de Concertação Social
curl http://localhost:3000/api/stakeholders/documents?categoria=concertacao_social

# Com limite
curl http://localhost:3000/api/stakeholders/documents?categoria=concertacao_social&limit=50
```

## Limitações e Desafios

### Proteção Anti-Scraping (403 Forbidden)

**Problema**: Todos os 5 sites de Concertação Social bloqueiam requests automáticos.

**Causas**:
- Cloudflare ou WAF similar
- Rate limiting por IP
- Detecção de comportamento não-humano
- Verificação de JavaScript/cookies

**Soluções Implementadas** ✅:
1. Múltiplos User-Agents rotativos
2. Headers HTTP completos
3. Sistema de retry com backoff
4. Suporte a RSS feeds (configurado)

**Soluções Futuras** 🔮:
1. **Puppeteer/Playwright**: Navegador headless real
2. **Proxy Rotativo**: Serviços como ScraperAPI, BrightData
3. **RSS Feeds**: Implementar parser de RSS/Atom
4. **APIs Oficiais**: Negociar acesso direto
5. **Captcha Solver**: Para sites com Cloudflare

## Implementação de RSS (Próximos Passos)

```javascript
// Adicionar dependência
npm install rss-parser

// Função de parsing RSS
async function parseRSS(rssUrl, stakeholderId, config) {
  const Parser = require('rss-parser');
  const parser = new Parser();

  const feed = await parser.parseURL(rssUrl);

  return feed.items.map(item => ({
    tipo_conteudo: config.tipo_conteudo,
    tipo_radar: "stakeholders",
    categoria: config.categoria,
    titulo: item.title,
    data_publicacao: new Date(item.pubDate).toISOString().split('T')[0],
    url: item.link,
    fonte: stakeholderId,
    entidades: config.nome,
    resumo: item.contentSnippet || item.summary,
  }));
}
```

## Estrutura de Dados

### Tabela: `documents`

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  tipo_conteudo TEXT,           -- "noticia", "comunicado", etc.
  tipo_radar TEXT,              -- "parlamento" | "stakeholders"
  categoria TEXT,               -- "concertacao_social", "laboral", etc.
  titulo TEXT NOT NULL,
  data_publicacao DATE,
  url TEXT UNIQUE NOT NULL,     -- Usado para evitar duplicados
  fonte TEXT,                   -- "cgtp", "ugt", etc.
  entidades TEXT,               -- Nome completo: "CGTP-IN"
  resumo TEXT,
  conteudo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices importantes
CREATE INDEX idx_documents_tipo_radar ON documents(tipo_radar);
CREATE INDEX idx_documents_categoria ON documents(categoria);
CREATE INDEX idx_documents_fonte ON documents(fonte);
CREATE INDEX idx_documents_url ON documents(url);
```

## Monitorização e Logs

```javascript
// Logs estruturados durante scraping:
🔍 Scraping CGTP-IN (cgtp)...
   URL: https://www.cgtp.pt/accao-e-luta
   ✓ Seletor funcionou: "article h2 a" (15 elementos)
   📊 Encontrados: 15 documentos
   ✅ Novo: Greve dos trabalhadores do Metro de Lisboa marcada para...
   ✅ CGTP-IN: 12 novos, 3 duplicados
```

## Testes

### Script de Teste Completo

```bash
node test-stakeholders.js
```

**Output esperado**:
```
======================================================================
🔍 TESTANDO: CGTP-IN (cgtp)
   URL: https://www.cgtp.pt/accao-e-luta
======================================================================
   → Fazendo request...
   ✓ Status: 200
   ✓ Tamanho da resposta: 245.32 KB

   🔍 Testando seletores:
   ✅ "article h2 a": 15 elementos

   📄 Primeiros 3 resultados:
      1. Greve dos trabalhadores do Metro...
         URL: /accao-e-luta/2025/10/greve-metro
```

## Troubleshooting

### Erro: "fetch failed" (Supabase)
```bash
# Verificar variáveis de ambiente
cat .env | grep SUPABASE

# Testar conexão
node -e "import('./src/config/supabase.js').then(m => m.testConnection())"
```

### Erro: "Status 403"
```
Soluções:
1. Verificar se o site tem RSS feed
2. Testar com Puppeteer
3. Usar serviço de proxy
4. Contactar administrador do site
```

### Nenhum documento encontrado
```
Possíveis causas:
1. Seletores CSS desatualizados → Inspecionar HTML do site
2. Estrutura do site mudou → Atualizar configuração
3. Site usa JavaScript para carregar conteúdo → Usar Puppeteer
```

## Próximos Passos

- [ ] Implementar parser de RSS feeds
- [ ] Adicionar Puppeteer para sites bloqueados
- [ ] Criar endpoint para scraping manual
- [ ] Dashboard de monitorização
- [ ] Alertas quando scraper falha
- [ ] Backup/restore de configurações
- [ ] Testes unitários
- [ ] CI/CD automation

## Contribuir

Para adicionar novo stakeholder:

1. Adicionar configuração em `STAKEHOLDERS_CONFIG`
2. Testar seletores com `test-stakeholders.js`
3. Verificar se tem RSS feed
4. Documentar aqui

## Licença

Propriedade do projeto Radar Legislativo.
