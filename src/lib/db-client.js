import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import crypto from 'crypto'

// Criar conexão com banco de dados
const db = new sqlite3.Database('./database/clients.db')
const runAsync = promisify(db.run).bind(db)
const getAsync = promisify(db.get).bind(db)

// Garantir que banco esteja inicializado
export async function initDatabase() {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_hash TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      service_type TEXT NOT NULL CHECK(service_type IN ('internet', 'tv')),
      server_id TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      credentials TEXT
    )
  `)

  await runAsync(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `)

  console.log('✅ Banco de dados inicializado')
}

// Gerar hash para anonimização
function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32)
}

// Verificar se usuário já fez teste
export async function checkTestLimit(userId, ip) {
  const userHash = generateHash(userId)
  const ipHash = generateHash(ip)
  
  const test = await getAsync(
    'SELECT * FROM tests WHERE user_hash = ? AND ip_hash = ?',
    [userHash, ipHash]
  )
  
  return test || null
}

// Salvar registro de teste
export async function saveTestRecord(userId, ip, serviceType, serverId, credentials) {
  const userHash = generateHash(userId)
  const ipHash = generateHash(ip)
  const createdAt = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 horas

  const credentialsJson = JSON.stringify(credentials)

  const result = await runAsync(
    `INSERT INTO tests (user_hash, ip_hash, service_type, server_id, created_at, expires_at, credentials)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userHash, ipHash, serviceType, serverId || null, createdAt, expiresAt, credentialsJson]
  )
  
  return { success: true, id: result.lastID }
}

// Salvar mensagem no histórico
export async function saveMessage(userId, role, content) {
  const userHash = generateHash(userId)
  const timestamp = new Date().toISOString()

  await runAsync(
    `INSERT INTO chat_history (user_hash, role, content, timestamp) 
     VALUES (?, ?, ?, ?)`,
    [userHash, role, content, timestamp]
  )
}

// Pegar histórico do usuário
export function getUserHistory(messages) {
  // Filtrar apenas mensagens relevantes (últimas 10)
  return messages.slice(-10).map(msg => ({
    role: msg.role,
    content: msg.content
  }))
}

// Formatar credenciais para mensagem
export function formatCredentials(credentials, serviceType) {
  if (serviceType === 'internet') {
    return `
✅ *Acesso Liberado!* ✅

👤 *Login:* ${credentials.username}
🔑 *Senha:* ${credentials.password}
🔗 *Limite:* ${credentials.connections} Conexão
📡 *Servidor:* ${credentials.server}
🗓️ *Duração:* ${credentials.duration} horas

Obrigado por escolher nossos serviços! ✨
    `.trim()
  } else {
    return `
📺 *Acesso à TV Liberado!* 📺

👤 *Login:* ${credentials.username}
🔑 *Senha:* ${credentials.password}
🔗 *Limite:* ${credentials.connections} Conexão
📡 *Servidor:* ${credentials.server}
✅ *Package:* ${credentials.package_id}
🗓️ *Duração:* ${credentials.duration} horas

Obrigado por escolher nossos serviços TV! ✨
    `.trim()
  }
}

// Fechar conexão
export function closeDatabase() {
  db.close()
}

// Inicializar quando o módulo for carregado (server-side only)
if (typeof process !== 'undefined' && !process.browser && process.env.NODE_ENV !== 'test') {
  initDatabase()
}
