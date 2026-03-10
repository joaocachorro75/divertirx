# Divertirx - IA Chat para TV e Internet

[![Deploy to EasyPanel](https://easypanel.io/deploy-button.svg)](https://easypanel.io)

IA humanizada para testes e contratações de serviços de internet (VPN) e TV via Internet.

---

## 🎯 O que é

**Divertirx** oferece:

- 🛰️ **Internet VPN Ilimitada** - R$20/mês
- 📺 **TV via Internet** - R$25/mês

Sistema de **1 teste lifetime por pessoa** (não expira).

---

## 🚀 Deploy Rápido

### EasyPanel (Recomendado)

Clique no botão de deploy acima ou veja: [DEPLOY-EASYPanel.md](DEPLOY-EASYPanel.md)

### Docker Local

```bash
git clone https://github.com/validador/divertirx.git
cd divertirx
cp .env.example .env
# preencha suas chaves no .env
docker-compose up -d
```

---

## 📋 Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| 1 teste por pessoa lifetime | CPF + IP hash no SQLite |
| 1 teste servidor TV específico | Não repete no mesmo servidor |
| IA humanizada | Sem menus de números, conversa natural |
| Preços fixos | Internet R$20, TV R$25 |

---

## 🔧 Stack

- **Next.js 14** (App Router)
- **Groq AI** (LLaMA 3.3 70B)
- **SQLite** (banco de dados)
- **Tailwind CSS** (UI)
- **Docker** (deploy)

---

## 📄 Licença

MIT License - feito para To-Ligado.com
