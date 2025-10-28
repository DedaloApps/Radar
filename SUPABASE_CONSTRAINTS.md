# Constraints da Tabela `documents` no Supabase

Este documento lista todas as constraints CHECK necessárias na tabela `documents` para o sistema funcionar corretamente.

## ✅ Estado Atual das Constraints

### 1. `documents_fonte_check`
**Valores permitidos para o campo `fonte`:**

```sql
CHECK (fonte = ANY (ARRAY[
  'parlamento'::text,
  'stakeholders'::text
]));
```

- **'parlamento'** - Usado por scrapers legislativos (comissões, páginas gerais)
- **'stakeholders'** - Usado por scrapers de stakeholders (sindicatos, patronato, etc.)

---

### 2. `documents_categoria_check`
**Valores permitidos para o campo `categoria`:**

```sql
CHECK (categoria = ANY (ARRAY[
  -- Comissões Parlamentares
  'comissao_01'::text,
  'comissao_02'::text,
  'comissao_03'::text,
  'comissao_04'::text,
  'comissao_05'::text,
  'comissao_06'::text,
  'comissao_07'::text,
  'comissao_08'::text,
  'comissao_09'::text,
  'comissao_10'::text,
  'comissao_11'::text,
  'comissao_12'::text,
  'comissao_13'::text,
  'comissao_14'::text,
  'comissao_15'::text,

  -- Páginas Gerais
  'geral_iniciativas'::text,
  'geral_perguntas'::text,
  'geral_votacoes'::text,
  'geral_sumulas'::text,

  -- Stakeholders
  'stake_concertacao'::text,
  'stake_laboral'::text,
  'stake_ambiente'::text,
  'stake_agricultura'::text,
  'stake_economia'::text,
  'stake_saude'::text,
  'stake_imobiliario'::text
]));
```

**Categorias de Stakeholders:**
- **stake_concertacao** - Concertação Social (CGTP, UGT, CAP, CCP, CTP)
- **stake_laboral** - Trabalho e Laboral (ACT, CITE, AIMA)
- **stake_ambiente** - Ambiente (APA, IGAMAOT, DGAV, DGEG, ADENE, ERSE)
- **stake_agricultura** - Agricultura (DGADR, INIAV)
- **stake_economia** - Economia/Finanças (IAPMEI, AdC, AT, Banco de Portugal, etc.)
- **stake_saude** - Saúde (INFARMED, ERS, IGAS)
- **stake_imobiliario** - Imobiliário/Habitação (CMVM, DGTerritório, IHRU)

---

### 3. `documents_tipo_conteudo_check` ⚠️ **REQUER ATUALIZAÇÃO**
**Valores permitidos para o campo `tipo_conteudo`:**

```sql
-- ❌ CONSTRAINT ANTIGA (FALTA 'noticia')
CHECK (tipo_conteudo = ANY (ARRAY[
  'agenda'::text,
  'audicao'::text,
  'audiencia'::text,
  'iniciativa'::text,
  'peticao'::text,
  'geral'::text,
  'pergunta'::text,
  'requerimento'::text,
  'votacao'::text,
  'sumula'::text
]));

-- ✅ CONSTRAINT CORRETA (COM 'noticia')
CHECK (tipo_conteudo = ANY (ARRAY[
  'agenda'::text,
  'audicao'::text,
  'audiencia'::text,
  'iniciativa'::text,
  'peticao'::text,
  'geral'::text,
  'pergunta'::text,
  'requerimento'::text,
  'votacao'::text,
  'sumula'::text,
  'noticia'::text        -- ← ADICIONAR ESTE!
]));
```

**Tipos de Conteúdo:**
- **agenda** - Agendas de comissões
- **audicao** - Audições (formato antigo)
- **audiencia** - Audiências (formato atual)
- **iniciativa** - Iniciativas legislativas
- **peticao** - Petições
- **geral** - Conteúdo genérico
- **pergunta** - Perguntas parlamentares
- **requerimento** - Requerimentos
- **votacao** - Resultados de votações
- **sumula** - Súmulas da Conferência de Líderes
- **noticia** - Notícias de stakeholders ← **NOVO**

---

## 🔧 Como Atualizar a Constraint `tipo_conteudo_check`

Execute este SQL no **Supabase SQL Editor**:

```sql
-- 1. Remover a constraint antiga
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_tipo_conteudo_check;

-- 2. Adicionar a constraint nova COM 'noticia'
ALTER TABLE documents
ADD CONSTRAINT documents_tipo_conteudo_check
CHECK (tipo_conteudo = ANY (ARRAY[
  'agenda'::text,
  'audicao'::text,
  'audiencia'::text,
  'iniciativa'::text,
  'peticao'::text,
  'geral'::text,
  'pergunta'::text,
  'requerimento'::text,
  'votacao'::text,
  'sumula'::text,
  'noticia'::text        -- ← NOVO: Para stakeholders
]));
```

---

## 🧪 Como Verificar as Constraints

Execute este SQL para ver todas as constraints CHECK da tabela `documents`:

```sql
SELECT
  conname AS nome_constraint,
  pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conrelid = 'documents'::regclass
  AND contype = 'c'
ORDER BY conname;
```

---

## 📊 Resumo de Uso por Scraper

| Scraper | fonte | tipo_conteudo | categoria |
|---------|-------|---------------|-----------|
| **comissoes.js** | parlamento | agenda, audicao, audiencia, iniciativa, peticao | comissao_01 a comissao_15 |
| **paginasGerais.js** | parlamento | iniciativa, pergunta, requerimento, votacao, sumula | geral_* |
| **stakeholders.js** | stakeholders | **noticia** | stake_* |

---

## 🚨 Troubleshooting

### Erro: `documents_fonte_check constraint violated`
**Causa**: Valor de `fonte` não está na lista permitida.
**Solução**: Adicionar valor à constraint ou usar "parlamento" ou "stakeholders".

### Erro: `documents_categoria_check constraint violated`
**Causa**: Valor de `categoria` não está na lista permitida.
**Solução**: Adicionar categoria à constraint ou usar uma das existentes.

### Erro: `documents_tipo_conteudo_check constraint violated`
**Causa**: Valor de `tipo_conteudo` não está na lista permitida.
**Solução**: Adicionar 'noticia' à constraint (ver seção acima).

---

## 📝 Notas

- As constraints CHECK garantem integridade de dados mas requerem manutenção quando novos tipos são adicionados
- Sempre verificar constraints antes de adicionar novos scrapers
- Manter este documento atualizado quando constraints mudarem

Última atualização: 2025-10-28
