#!/usr/bin/env node

/**
 * Script de Setup do Divertirx
 * Inicializa o banco de dados e verifica configurações
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Configurando Divertirx...')

// Diretório raiz do projeto
const projectRoot = path.join(__dirname, '..')

// Criar diretório de database se não existir
const dbPath = path.join(projectRoot, 'database')
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true })
  console.log('📁 Diretório database/ criado')
}

// Verificar se .env existe, senão criar a partir do .env.example
const envPath = path.join(projectRoot, '.env')
const envExamplePath = path.join(projectRoot, '.env.example')

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8')
  fs.writeFileSync(envPath, envContent)
  console.log('📝 Arquivo .env criado a partir do .env.example')
  console.log('⚠️  IMPORTANTE: Preencha suas chaves de API no arquivo .env')
} else if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env já existe')
} else {
  console.log('❌ ERRO: Não encontrado .env.example')
  process.exit(1)
}

// Mostrar instruções finais
console.log('\n✅ Configurações concluídas!')
console.log('\n📋 Próximos passos:')
console.log('1. Edite o arquivo .env com suas chaves de API')
console.log('2. Execute: npm install')
console.log('3. Execute: npm run dev')
console.log('\n🚀 Para deploy no EasyPanel:')
console.log('docker-compose up -d')
console.log('\n')
