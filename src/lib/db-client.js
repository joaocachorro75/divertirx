import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'clients.db');

let db = null;

export function getDB() {
  if (!db) {
    db = new Database(dbPath);
    initDB();
  }
  return db;
}

function initDB() {
  // Tabela de clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      city TEXT,
      ip_address TEXT NOT NULL,
      choice TEXT CHECK(choice IN ('internet', 'tv')),
      status TEXT DEFAULT 'teste' CHECK(status IN ('teste', 'ativo', 'cancelado')),
      onpix_user_id TEXT,
      onpix_username TEXT,
      onpix_password TEXT,
      servex_user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      test_expires_at DATETIME
    )
  `);

  // Tabela de logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);

  // Tabela de conversas
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT,
      message TEXT NOT NULL,
      role TEXT CHECK(role IN ('user', 'assistant')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);
}

export function createClient(clientData) {
  const db = getDB();
  
  const stmt = db.prepare(`
    INSERT INTO clients (
      id, name, cpf, phone, email, city, ip_address, choice, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const id = uuidv4();
  
  try {
    stmt.run(
      id,
      clientData.name,
      clientData.cpf,
      clientData.phone,
      clientData.email || null,
      clientData.city || null,
      clientData.ip,
      clientData.choice,
      'teste'
    );

    // Log
    db.prepare('INSERT INTO logs (client_id, action, details) VALUES (?, ?, ?)')
      .run(id, 'CLIENT_CREATED', JSON.stringify({ choice: clientData.choice }));

    return { success: true, id, ...clientData };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: clients.cpf')) {
      return { success: false, error: 'CPF já registrado' };
    }
    throw error;
  }
}

export function getClientByCPF(cpf) {
  const db = getDB();
  return db.prepare('SELECT * FROM clients WHERE cpf = ?').get(cpf);
}

export function getClientById(id) {
  const db = getDB();
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

export function updateClientOnPixData(id, { userId, username, password }) {
  const db = getDB();
  
  const stmt = db.prepare(`
    UPDATE clients 
    SET onpix_user_id = ?, onpix_username = ?, onpix_password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(userId, username, password, id);
  
  // Log
  db.prepare('INSERT INTO logs (client_id, action, details) VALUES (?, ?, ?)')
    .run(id, 'ONPIX_ACCOUNT_CREATED', JSON.stringify({ username }));
  
  return { success: true };
}

export function listClients() {
  const db = getDB();
  return db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
}

export function saveConversation(clientId, message, role) {
  const db = getDB();
  db.prepare('INSERT INTO conversations (client_id, message, role) VALUES (?, ?, ?)')
    .run(clientId, message, role);
}

export function getConversationHistory(clientId) {
  const db = getDB();
  return db.prepare(
    'SELECT * FROM conversations WHERE client_id = ? ORDER BY created_at ASC LIMIT 50'
  ).all(clientId);
}
