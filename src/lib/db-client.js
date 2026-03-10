import Database from 'better-sqlite3'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

// Ensure database directory exists
const dbDir = path.join(process.cwd(), 'database')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Initialize database
const db = new Database(path.join(dbDir, 'clients.db'))

// Initialize tables
db.exec(`
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

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )
`)

console.log('✅ Banco de dados inicializado')

// Generate hash for anonymization
function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32)
}

// Check if user already has a test
export async function checkTestLimit(userId, ip) {
  const userHash = generateHash(userId)
  const ipHash = generateHash(ip)
  
  const stmt = db.prepare('SELECT * FROM tests WHERE user_hash = ? AND ip_hash = ?')
  const test = stmt.get(userHash, ipHash)
  
  return test || null
}

// Save test record
export async function saveTestRecord(userId, ip, serviceType, serverId, credentials) {
  const userHash = generateHash(userId)
  const ipHash = generateHash(ip)
  const createdAt = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours

  const credentialsJson = JSON.stringify(credentials)

  const stmt = db.prepare(
    `INSERT INTO tests (user_hash, ip_hash, service_type, server_id, created_at, expires_at, credentials)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
  
  const result = stmt.run(userHash, ipHash, serviceType, serverId || null, createdAt, expiresAt, credentialsJson)
  
  return { success: true, id: result.lastInsertRowid }
}

// Save message to history
export async function saveMessage(userId, role, content) {
  const userHash = generateHash(userId)
  const timestamp = new Date().toISOString()

  const stmt = db.prepare(
    `INSERT INTO chat_history (user_hash, role, content, timestamp) 
     VALUES (?, ?, ?, ?)`
  )
  
  stmt.run(userHash, role, content, timestamp)
}

// Get user history
export function getUserHistory(messages) {
  // Filter only relevant messages (last 10)
  return messages.slice(-10).map(msg => ({
    role: msg.role,
    content: msg.content
  }))
}

// Format credentials for message
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

// Close database
export function closeDatabase() {
  db.close()
}

// Initialize when module loads
console.log('📦 Database module loaded')
