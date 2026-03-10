# 🚀 Como publicar no GitHub

## Passo 1: Criar Repository no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. **Repository name:** `divertirx`
3. **Description:** `IA Chat humanizada para testes e contratações de VPN e TV`
4. **Public** (recomendado)
5. **Marcar:** ☑️ "Add a README file"
6. Clique em **Create repository**

---

## Passo 2: Conectar seu repo local ao GitHub

No terminal, execute:

```bash
cd /home/node/.openclaw/workspace-validador/divertirx

# Adicionar remote do GitHub
git remote add origin https://github.com/validador/divertirx.git

# Fazer push inicial
git branch -M main
git push -u origin main
```

Se pedir credentials:
- **Username:** seu GitHub username
- **Password:** seu GitHub Personal Access Token (PAT)

---

## 🔑 Como criar Personal Access Token (PAT)

1. Vá em [github.com/settings/tokens](https://github.com/settings/tokens)
2. Clique em **Generate new token** → **Generate new token (classic)**
3. Configure:
   - **Note:** `Divertirx Deployment`
   - **Expiration:** 1 year
   - **Scopes:** ✓ `repo` (full control)
4. Clique em **Generate token**
5. Copie o token (não veja mais depois!)
6. Use esse token como senha no git push

---

## ✅ Pronto!

Após o push, seu repo estará em:
```
https://github.com/validador/divertirx
```

Agora no EasyPanel:
1. Vá em **GitHub Repositories**
2. Conecte sua conta GitHub
3. Selecione `validador/divertirx`
4. Configure variáveis de ambiente
5. Deploy! 🚀

---

## 📋 Variáveis de Ambiente no EasyPanel

| Variável | Onde pegar |
|----------|------------|
| `GROQ_API_KEY` | https://console.groq.com |
| `ONPIX_USERNAME` | Seu login OnPix |
| `ONPIX_PASSWORD` | Sua senha OnPix |
| `SERVEX_API_KEY` | Painel → Configurações → API Key |
