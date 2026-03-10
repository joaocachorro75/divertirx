# 📺 Divertirx - Projeto

**Projeto:** Divertirx - IA Humanizada para Internet e TV
**Propósito:** Gerar testes e contratações via chat com IA

---

## 🏗️ Stack Tecnológica

| Camada | Tech |
|--------|------|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS |
| IA | Groq (LLaMA 3.3 70B) |
| DB | SQLite |
| Deploy | Docker + EasyPanel |
| APIs | ServX + OnPix |

---

## 📋 Regras de Negócio

### ✅ CRÍTICO - NÃO MUDAR

| Regra | Implementação |
|-------|---------------|
| **1 teste por pessoa lifetime** | Hash de CPF/Telefone + IP no SQLite |
| **1 teste servidor TV** | Verificar server_id no banco |
| **Semmenu de números** | IA conversa natural como atendente |
| **4 horas de teste** | Duração fixa no painel |
| **Preços fixos** | Internet R$20, TV R$25 |

---

## 🗃️ Banco de Dados (SQLite)

### Tabela: `tests`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | PK Auto |
| user_hash | TEXT | Hash do identificador do usuário |
| ip_hash | TEXT | Hash do IP do cliente |
| service_type | TEXT | 'internet' ou 'tv' |
| server_id | TEXT | ID do servidor (se TV) |
| created_at | TEXT | Timestamp ISO |
| expires_at | TEXT | Timestamp ISO (4h depois) |
| credentials | TEXT | JSON das credenciais |

### Tabela: `chat_history`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | PK Auto |
| user_hash | TEXT | Hash do usuário |
| role | TEXT | 'user' ou 'assistant' |
| content | TEXT | Conteúdo da mensagem |
| timestamp | TEXT | Timestamp ISO |

---

## 🔌 APIs dos Painéis

### OnPix (TV)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Autenticação |
| `/api/clients/create` | POST | Criar cliente |
| `/api/clients/renew` | POST | Renovar cliente |

**Proxy:** `http://5.161.155.252:80`

### ServX (VPN)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/users/create` | POST | Criar cliente |
| `/api/servers` | GET | Listar servidores |

**Auth:** Bearer Token na header

---

## 🧠 Prompt da IA (System)

```
Você é a Divertirx, uma assistente amigável e humanizada.

REGRAS:
1. Only 2 services: Internet VPN (R$20) ou TV (R$25)
2. 1 teste lifetime por pessoa (CPF+IP hash)
3. Se já testou: "Já fizemos seu teste! Você usou: [serviço]"
4. Se quer testar: pergunte qual serviço prefere
5. Se escolher TV: pergunte qual servidor
6. Ao criar teste: informe credenciais + 4 horas
7. Se quiser contratar: pedir PIX
8. Se quiser renovar: pedir usuário

TON:
- Amigável, emojis moderados
- Sem menus de números
- Como um atendente de true
```

---

## 📱 Fluxo de Conversa

```
✅ Início (primeira vez):
IA: "Olá! 👋 Bem-vindo à Divertirx. O que prefere: internet VPN ou TV?"

usuário: "TV"
IA: "Perfeito! 📺 Qual servidor quer testar?
• Servidor 1 - Filmes 🎬
• Servidor 2 - Esporte 🏆
• Servidor 3 - Adulto 🌚"

usuário: "Filmes"
IA: [cria teste no Servidor 1 e envia credenciais]

---

✅ Já testou:
IA: "Já fizemos seu teste! 🎁 Você usou: TV via Internet"

---

✅ Contratação:
IA: "Quer contratar agora? 📦
• Internet VPN: R$20/mês
• TV: R$25/mês
Pague via PIX!"
```

---

## 🐳 Deploy no EasyPanel

### Pre-requisitos:

- EasyPanel instalado
- Docker engine funcionando
- Variáveis de ambiente configuradas

### Passos:

1. **Clonar projeto:**
   ```bash
   git clone https://github.com/seu-repo/divertirx.git
   cd divertirx
   ```

2. **Configurar .env:**
   ```bash
   cp .env.example .env
   # preencher com suas chaves
   ```

3. **Subir containers:**
   ```bash
   docker-compose up -d
   ```

4. **Verificar:**
   ```bash
   docker ps
   # diverti_1 deve estar Running
   ```

---

## 🔐 Segurança

### O que fazer:
- ✅ Hash de CPF/Telefone antes de salvar no DB
- ✅ Rate limiting (já incluso no /api/chat)
- ✅ Input validation
- ✅ Environment variables para APIs

### O que evitar:
- ❌ Salvar CPFs em texto puro
- ❌ Logar credenciais no console
- ❌ Compartilhar chaves de API no código

---

## 📊 Monitoramento

### Comandos úteis:

```bash
# Logs
docker-compose logs -f divertirx

# Acessar container
docker exec -it divertirx sh

# Rebuild
docker-compose up -d --build
```

---

## 🛠️ Dev Local

```bash
# Instalar
npm install

# Run dev
npm run dev

# Build
npm run build

# Start prod
npm run start
```

---

## 📝 Próximos Passos

| Tarefa | Status |
|--------|--------|
| ✅ Criar estrutura base | pronto |
| ✅ DB schema | pronto |
| ✅ IA system prompt | pronto |
| ⏳ Testar APIs dos painéis | pendente |
| ⏳ Frontend completo | pendente |
| ⏳ Testes unitários | pendente |
| ⏳ Deploy EasyPanel | pendente |

---

**Feito com 💜 para a To-Ligado.com**  
**Validador + Robotic Team**
