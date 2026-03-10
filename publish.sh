#!/bin/bash
# Script para publicar o Divertirx no GitHub

echo "🚀 Publicando Divertirx no GitHub..."

cd /home/node/.openclaw/workspace-validador/divertirx

# Verificar se já tem remote
if git remote | grep -q origin; then
    echo "⚠️  Remote 'origin' já existe."
    echo "Current remote: $(git remote get-url origin)"
    read -p "Quer atualizar o remote? (s/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Enter GitHub repository URL (ex: https://github.com/usuario/divertirx.git): " REPO_URL
        git remote set-url origin "$REPO_URL"
    fi
else
    read -p "Enter GitHub repository URL (ex: https://github.com/usuario/divertirx.git): " REPO_URL
    git remote add origin "$REPO_URL"
fi

# Fazer push
echo "📤 Fazendo push para o remote..."
git push -u origin main

echo ""
echo "✅ Publicado com sucesso!"
echo "Acesse seu repo em: $(git remote get-url origin | sed 's/\.git$//')"
