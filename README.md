# 📺 Divertirx - Canal de Diversão na Internet

IA humanizada para testes e contratações de serviços de internet e TV.

---

## 🎯 O que é

Divertirx é uma plataforma de conversação com IA que oferece:

- **Internet VPN Ilimitada** - R$20/mês
- **TV via Internet** - R$25/mês

Sistema de **1 teste lifetime por pessoa** (sem expiração).

---

## 📋 Regras

| Regra | Detalhe |
|-------|---------|
| 1 teste por pessoa | CPF + IP + servidor (único no lifetime) |
| 1 teste servidor TV específico | Não pode repetir no mesmo servidor |
| Escolha definitiva | Escolhe internet OU TV uma vez só |

---

## 🛠️ Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **IA:** OpenAI / Groq (chat humanizado)
- **Backend:** API Routes + Database (SQLite)
- **Painéis:** ServX API + OnPix API
- **Deploy:** Docker + EasyPanel

---

## 📁 Estrutura

```
divertirx/
├── README.md
├── package.json
├── next.config.mjs
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── app/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   └── api/
│   │       ├── chat/route.js
│   │       └── admin/
│   │           ├── clients/route.js
│   │           └── servers/route.js
│   ├── components/
│   │   ├── ChatAI/
│   │   │   └── ChatInterface.jsx
│   │   ├── Flow/
│   │   │   ├── InternetVPN.jsx
│   │   │   └── TVInternet.jsx
│   │   └── AdminPanel/
│   │       ├── ClientList.jsx
│   │       └── ServerSelector.jsx
│   ├── lib/
│   │   ├── ai-chat.js
│   │   ├── api-servex.js
│   │   ├── api-onpix.js
│   │   └── db-client.js
│   └── styles/
├── database/
│   └── clients.db
└── admin/
    ├── page.jsx
    └── components/
```

---

## 🚀 Começando

```bash
cd divertirx

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# preencher com suas APIs

# Dev mode
npm run dev

# Build para produção
npm run build

# Docker
docker-compose up -d
```

---

## 🔑 Variáveis de Ambiente

```env
# OpenAI/Groq
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...

# APIs dos Painéis
ONPIX_PROXY=5.161.155.252:80
ONPIX_USERNAME=...
ONPIX_PASSWORD=...
SERVEX_API_KEY=sx_...
```

---

## 📖 Próximos Passos

1. Criar estrutura de banco de dados (SQLite)
2. Implementar IA humanizada (system prompt)
3. Criar fluxo de escolha cliente
4. Integração com APIs (ServX + OnPix)
5. Painel admin (gerenciar clientes/servidores/planos)
6. Deploy no EasyPanel

---

**Feito com 💜 para a To-Ligado.com**
