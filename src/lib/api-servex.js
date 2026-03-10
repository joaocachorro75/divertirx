import axios from 'axios'

// Configuração do proxy para acessar servex.ws
const SERVEX_API_KEY = process.env.SERVEX_API_KEY

// Função para criar cliente de teste no ServX
export async function createTestClientServX(username, durationHours = 4) {
  try {
    // Gerar senha aleatória
    const password = Math.random().toString(36).slice(-8)
    
    // Preparar dados para API
    const data = {
      username: username,
      password: password,
      duration: durationHours * 60, // minutos
      limit_connections: 2,
      server_id: null // Será preenchido com o servidor padrão
    }

    // Endpoint da API do ServX (ajustar conforme estrutura real)
    const response = await axios.post(
      'https://servex.ws/api/users/create',
      data,
      {
        headers: {
          'Authorization': `Bearer ${SERVEX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    // Formatar credenciais
    const credentials = {
      username: username,
      password: password,
      server: response.data.server_name || 'Servidor Padrão',
      duration: durationHours,
      connections: 2
    }

    // Formatar mensagem legível
    const formattedCredentials = `
✅ *Acesso Liberado!* ✅

👤 *Login:* ${username}
🔑 *Senha:* ${password}
🔗 *Limite:* ${credentials.connections} Conexão
🗓️ *Vencimento:* ${durationHours} horas
📡 *Servidor:* ${credentials.server}

Obrigado por escolher our services! ✨
    `.trim()

    return {
      success: true,
      credentials,
      credenciaisFormatadas: formattedCredentials
    }

  } catch (error) {
    console.error('Erro ao criar cliente ServX:', error.response?.data || error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Função para verificar servidores disponíveis
export async function getAvailableServers() {
  try {
    const response = await axios.get(
      'https://servex.ws/api/servers',
      {
        headers: {
          'Authorization': `Bearer ${SERVEX_API_KEY}`
        },
        timeout: 10000
      }
    )

    return response.data.map(server => ({
      id: server.id,
      name: server.name,
      status: server.status,
      category: server.category
    }))

  } catch (error) {
    console.error('Erro ao buscar servidores:', error)
    return []
  }
}

// Função para criar cliente personalizado
export async function createCustomClientServX(data) {
  try {
    const response = await axios.post(
      'https://servex.ws/api/users/create',
      data,
      {
        headers: {
          'Authorization': `Bearer ${SERVEX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    return {
      success: true,
      data: response.data
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
