#!/bin/bash
# Script de deploy rápido no EasyPanel (via SSH)

echo "🚀 Deploy do Divertirx no EasyPanel..."

# Configurações (ajuste para seu ambiente)
EASY_PANEL_HOST="seu.easypanel.com"
EASY_PANEL_USER="root"
EASY_PANEL_PATH="/opt/easypanel/apps/divertirx"
LOCAL_PATH="/home/node/.openclaw/workspace-validador/divertirx"

# Verificar se Hard Links estão disponíveis
if [ ! -f $LOCAL_PATH/.env ]; then
  echo "❌ ERRO: Arquivo .env não encontrado!"
  echo "Preencha suas chaves de API no .env antes de deploy!"
  exit 1
fi

echo "📦 Enviando arquivos para o servidor..."
rsync -avz --exclude=node_modules --exclude=.next --exclude=database $LOCAL_PATH/ $EASY_PANEL_USER@$EASY_PANEL_HOST:$EASY_PANEL_PATH/

echo "🔨 Construindo no servidor..."
ssh $EASY_PANEL_USER@$EASY_PANEL_HOST "cd $EASY_PANEL_PATH && docker-compose up -d --build"

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://divertirx.suadominio.com"
