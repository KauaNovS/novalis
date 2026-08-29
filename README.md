# NOVALIS - Sistema de Inteligência Imobiliária

Plataforma inteligente de ingestão, processamento e estruturação de dados imobiliários. Transforma documentos complexos (PDFs, planilhas, imagens) em dados estruturados e relacionados.

## 🎯 Visão Geral

**Novalis** é uma solução end-to-end para:
- Importar Tabelões, Books, Espelhos de Vendas, Tabelas de Preços
- Extrair dados com OCR + Vision Computing
- Mapear unidades para plantas automaticamente
- Enriquecer dados com imagens e características
- Gerar APIs estruturadas para consumo

## 🏗️ Arquitetura

```
Ingestão → Intelligence Engine → Parser → Matching → Validation → API
   (PDF)      (OCR/Vision)      (Extract)  (Link)    (Consistency)  (JSON)
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 14+ (via Docker)

### Setup Local

```bash
# Clonar e instalar dependências
git clone https://github.com/KauaNovS/novalis.git
cd novalis

# Configurar variáveis de ambiente
cp .env.example .env

# Subir banco de dados
docker-compose up -d

# Instalar dependências do backend
cd backend && npm install

# Instalar dependências do frontend
cd ../frontend && npm install

# Rodar migrações
cd ../backend && npm run db:migrate

# Iniciar em modo desenvolvimento
npm run dev
```

### URLs Locais
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

## 📁 Estrutura do Projeto

```
novalis/
├── backend/              # API Node.js
│   ├── src/
│   │   ├── modules/
│   │   │   ├── ingestao/      # Upload e processamento
│   │   │   ├── intelligence/  # OCR, Vision
│   │   │   ├── parser/        # Extração de dados
│   │   │   ├── matcher/       # Matching engine
│   │   │   ├── validator/     # Validação
│   │   │   ├── db/            # ORM models
│   │   │   └── api/           # Controllers & routes
│   │   ├── config/
│   │   └── utils/
│   ├── tests/
│   └── package.json
│
├── frontend/             # React/Next.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
│
├── shared/              # Tipos e schemas
│   ├── types.ts
│   └── schemas.ts
│
├── docs/               # Documentação
├── docker-compose.yml
├── .github/
│   └── workflows/      # CI/CD
├── .env.example
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente

Veja `.env.example` para todas as variáveis necessárias.

Principais:
- `DATABASE_URL`: PostgreSQL
- `AWS_S3_BUCKET`: Para armazenar imagens/PDFs
- `OPENAI_API_KEY`: Para Vision Computing (opcional)
- `JWT_SECRET`: Para autenticação

## 📚 Tipos de Importação

### 1. TABELÃO
Importar lista de empreendimentos de uma incorporadora
```bash
POST /api/import/tabelao
Content-Type: multipart/form-data
```

### 2. BOOK
Importar material de lançamento com plantas e imagens
```bash
POST /api/import/book
Content-Type: multipart/form-data
```

### 3. ESPELHO DE VENDAS
Importar matriz de unidades com status
```bash
POST /api/import/espelho
Content-Type: multipart/form-data
```

### 4. TABELA DE PREÇOS
Importar valores e condições
```bash
POST /api/import/precos
Content-Type: multipart/form-data
```

### 5. FINANCIAMENTO
Importar planos de pagamento
```bash
POST /api/import/financiamento
Content-Type: multipart/form-data
```

## 🔗 Endpoints Principais

### Empreendimentos
- `GET /api/empreendimentos` - Listar
- `GET /api/empreendimentos/:id` - Detalhe completo
- `POST /api/empreendimentos` - Criar

### Unidades
- `GET /api/unidades?empreendimento_id=:id` - Listar por empreendimento
- `GET /api/unidades/:id` - Detalhe com planta
- `PUT /api/unidades/:id` - Atualizar

### Plantas
- `GET /api/plantas?empreendimento_id=:id`
- `GET /api/plantas/:id/imagens`

## 📊 Matching Engine

O sistema automaticamente mapeia:
- Unidades → Plantas (baseado em: final, tipologia, andar, área)
- Unidades → Características (pé direito duplo, terraço, etc)
- Plantas → Imagens (perspectivas e layouts)

Veja `backend/src/modules/matcher/` para detalhes.

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Com coverage
npm run test:coverage

# E2E
npm run test:e2e
```

## 🚢 Deploy

### Vercel (Frontend)
```bash
vercel deploy
```

### Railway/Render (Backend)
```bash
git push origin main  # Triggers auto-deploy
```

Veja `docs/DEPLOYMENT.md` para detalhes completos.

## 📝 Documentação

- [Arquitetura](docs/ARQUITETURA.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Schemas JSON](docs/SCHEMAS.md)

## 🤝 Contribuindo

1. Crie uma branch (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

MIT - Veja LICENSE para detalhes

## 👤 Autor

Kauã Santos Novaes - [@KauaNovS](https://github.com/KauaNovS)

---

**Status**: 🚀 Em desenvolvimento  
**Última atualização**: 2026-08-28
