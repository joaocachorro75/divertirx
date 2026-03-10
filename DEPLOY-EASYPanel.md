# Divertirx - GitHub Repository

## 🚀 Deploy no EasyPanel via GitHub

### Passo 1: Conectar GitHub ao EasyPanel
1. No EasyPanel, vá em **GitHub Repositories**
2. Conecte sua conta GitHub
3. Selecione o repo `validador/divertirx`

### Passo 2: Criar App
1. **New App** → Escolha **"GitHub Repository"**
2. Selecione o repo: `validador/divertirx`
3. Branch: `main`
4. Dockerfile Path: `/divertirx/Dockerfile`

### Passo 3: Variáveis de Ambiente
Adicione estas variáveis no painel do EasyPanel:

| Variável | Descrição |
|----------|-----------|
| `GROQ_API_KEY` | Sua chave Groq (IA) |
| `ONPIX_USERNAME` | Login do painel OnPix |
| `ONPIX_PASSWORD` | Senha do painel OnPix |
| `SERVEX_API_KEY` | API Key do ServX |

### Passo 4: Deploy
1. Clique em **Deploy**
2. Aguarde o build terminar
3. App estará pronto em `https://seu-app.easypanel.app`

---

## 🐳 Deploy Manual com Docker Compose

```bash
git clone https://github.com/validador/divertirx.git
cd divertirx

# Criar .env
cp .env.example .env
# preencher com suas chaves

# Subir
docker-compose up -d
```

---

## 📋 Estrutura do Repo

```
divertirx/
├── Dockerfile              # Para deploy no EasyPanel
├── docker-compose.yml      # Para deploy local
├── .env.example            # Template de config
├── README.md               # Este arquivo
├── DOCUMENTACAO-PROJETO.md # Documentação completa
├── package.json
├── next.config.mjs
├── setup.js               # Script de setup
├── build.sh               # Script de build
└── src/
    ├── app/
    ├── components/
    ├── lib/
    └── hooks/
```

---

## 🔐 Segurança

- **NÃO commitar** `.env` com chaves reais
- Usar `.env.example` como template
- Chaves são sensíveis → guardadas no EasyPanel

---

**Repo oficial:** `https://github.com/validador/divertirx`
