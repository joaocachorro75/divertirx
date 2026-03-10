#!/bin/bash
# Script de build rápido para testar Dockerfile antes do EasyPanel

echo "🔨 Construindo imagem Docker do Divertirx..."

cd /home/node/.openclaw/workspace-validador/divertirx

# Criar arquivo .env se não existir (apenas para teste)
if [ ! -f .env ]; then
  echo "⚠️  Arquivo .env não encontrado. Copiando .env.example..."
  cp .env.example .env
  echo "📝 Preencha suas chaves de API no .env antes de deploy!"
fi

# Build da imagem
docker build -t divertirx:latest .

echo "✅ Build concluído!"
echo "🚀 Para rodar localmente:"
echo "docker run -p 3000:3000 --env-file .env -v \$(pwd)/database:/app/database divertirx:latest"
