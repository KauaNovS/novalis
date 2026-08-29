# 🚀 Quick Start - Novalis

Este guia vai te levar do zero ao rodando em 5 minutos.

## ⚡ Pré-requisitos

```bash
# Verificar versões
node --version      # Deve ser 18+
npm --version       # Deve ser 9+
docker --version    # Necessário para banco de dados
git --version       # Necessário para clonar
```

## 📥 1. Clonar & Setup

```bash
# Clonar o repositório
git clone https://github.com/KauaNovS/novalis.git
cd novalis

# Copiar variáveis de ambiente
cp .env.example .env

# Instalar dependências
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 🐳 2. Subir Banco de Dados

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Ver logs (se necessário)
docker-compose logs -f postgres
```

**Aguarde ~10 segundos para o banco estar pronto**

## 🗄️ 3. Migrações do Banco

```bash
cd backend

# Rodar migrações
npm run db:migrate

# (Opcional) Popular com dados de teste
npm run db:seed
```

## ▶️ 4. Rodar em Desenvolvimento

### Terminal 1 - Backend
```bash
cd backend
npm run dev

# Deve mostrar:
# 🚀 Novalis API running on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev

# Deve mostrar:
# 📡 Next.js running on http://localhost:3000
```

## 🌐 5. Acessar

- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Frontend**: http://localhost:3000
- **PgAdmin**: http://localhost:5050
  - Email: `admin@novalis.local`
  - Password: `admin`

## 📡 6. Testando a API

```bash
# Health check
curl http://localhost:5000/health

# Listar empreendimentos
curl http://localhost:5000/api/empreendimentos

# Listar unidades
curl http://localhost:5000/api/unidades
```

## 🧪 7. Rodando Testes

```bash
cd backend

# Testes unitários
npm test

# Com coverage
npm run test:coverage

# E2E (mais lento)
npm run test:e2e
```

## 🛑 Parar Tudo

```bash
# Parar containers
docker-compose down

# Parar os servidores (Ctrl+C nos terminais)
```

## 📚 Documentação Completa

- [README.md](README.md) - Visão geral
- [docs/ARQUITETURA.md](docs/ARQUITETURA.md) - Arquitetura do sistema
- [docs/API.md](docs/API.md) - Endpoints e tipos
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deploy em produção

## 🐛 Troubleshooting

### Porta 5432 já em uso
```bash
# Verificar o que está usando
lsof -i :5432

# Ou mudar a porta no docker-compose.yml
```

### Banco não conecta
```bash
# Reiniciar o container
docker-compose restart postgres

# Ou resetar tudo
docker-compose down -v
docker-compose up -d
npm run db:migrate
```

### npm ci vs npm install
Use `npm ci` para reproduzir exatamente as dependências do projeto.

## ✅ Próximas Etapas

1. ✅ Backend rodando
2. ✅ Frontend rodando
3. ⬜ Implementar módulos de importação
4. ⬜ Conectar UI aos endpoints
5. ⬜ Deploy em produção

---

**Está travado?** Abre uma issue no GitHub! 🎯
