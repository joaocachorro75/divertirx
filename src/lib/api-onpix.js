import axios from 'axios'

// Configuração do proxy para acessar onpix.sigmab.pro
const PROXY_URL = process.env.ONPIX_PROXY || 'http://5.161.155.252:80'
const ONPIX_API_BASE = 'http://onpix.sigmab.pro/api'

// Estado de autenticação
let authToken = null
let authUser = null

// Função para autenticar na API do OnPix
async function authenticateOnPix() {
  try {
    const response = await axios.post(
      `${ONPIX_API_BASE}/auth/login`,
      {
        username: process.env.ONPIX_USERNAME,
        password: process.env.ONPIX_PASSWORD
      },
      {
        httpAgentOptions: {
          proxy: PROXY_URL ? { host: 'http://' + PROXY_URL.split(':')[0], port: parseInt(PROXY_URL.split(':')[1]) } : undefined
        },
        timeout: 15000
      }
    )

    authToken = response.data.token
    authUser = response.data.user

    return {
      success: true,
      token: authToken,
      user: authUser
    }

  } catch (error) {
    console.error('Erro ao autenticar OnPix:', error.response?.data || error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Função para obter token (com cache)
export async function getOnPixAuthToken() {
  if (authToken) return { success: true, token: authToken }

  const authResult = await authenticateOnPix()
  return authResult
}

// Função para criar cliente de teste no OnPix (TV)
export async function createTestClientOnPix(serverId, username, durationHours = 4) {
  try {
    // Garantir que está autenticado
    const auth = await getOnPixAuthToken()
    if (!auth.success) {
      return { success: false, error: 'Não autenticado no OnPix' }
    }

    // Gerar senha aleatória
    const password = Math.random().toString(36).slice(-8)

    // Determinar package baseado no tipo de servidor (ex: com ou sem adulto)
    const isAdult = serverId?.includes('adulto') || serverId?.includes('18')
    
    // Mapeamento de packages (ajustar conforme packages reais)
    const packages = {
      // Sem adulto
      'server_filmes': 'XKjLMPR104', // PIX ARENA sem adulto
      'server_esporte': '0RvWGa8Le3', // PIX SUPREME sem adulto
      'server_padrao': 'XKjLMPR104',
      // Com adulto
      'server_adulto': 'lze15VAL5K' // PIX ARENA com adulto
    }

    const packageId = packages[serverId] || packages['server_padrao']

    // Preparar dados para API
    const data = {
      package_id: packageId,
      username: username,
      password: password,
      limit_connections: 2,
      duration_days: Math.ceil(durationHours / 24), // Converter horas em dias
      server_id: serverId
    }

    // Endpoint para criar cliente
    const response = await axios.post(
      `${ONPIX_API_BASE}/clients/create`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    // Formatar credenciais
    const credentials = {
      username: username,
      password: password,
      server: serverId || 'Servidor Padrão',
      duration: durationHours,
      package_id: packageId,
      connections: 2
    }

    // Formatar mensagem legível
    const formattedCredentials = `
📺 *Acesso à TV Liberado!* 📺

👤 *Login:* ${username}
🔑 *Senha:* ${password}
🔗 *Limite:* ${credentials.connections} Conexão
📡 *Servidor:* ${serverId || 'Padrão'}
✅ *Package:* ${packageId}

Obrigado por escolher our services TV! ✨
    `.trim()

    return {
      success: true,
      credentials,
      credenciaisFormatadas: formattedCredentials
    }

  } catch (error) {
    console.error('Erro ao criar cliente OnPix:', error.response?.data || error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Função para obter servidores de TV disponíveis
export async function getTVServers() {
  try {
    const auth = await getOnPixAuthToken()
    if (!auth.success) {
      return { success: false, error: 'Não autenticado' }
    }

    // Endpoint para listagem de servidores/packages
    const response = await axios.get(
      `${ONPIX_API_BASE}/packages`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        timeout: 15000
      }
    )

    // Processar packages para formatar como servidores
    const servers = response.data.packages?.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      category: pkg.category,
      has_adult: pkg.has_adult,
      price: pkg.price
    })) || []

    return { success: true, servers }

  } catch (error) {
    console.error('Erro ao buscar servidores TV:', error)
    return { success: false, error: error.message }
  }
}

// Função para renovar cliente
export async function renewClientOnPix(clientId, days) {
  try {
    const auth = await getOnPixAuthToken()
    if (!auth.success) {
      return { success: false, error: 'Não autenticado' }
    }

    const response = await axios.post(
      `${ONPIX_API_BASE}/clients/renew`,
      {
        client_id: clientId,
        days: days
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    return { success: true, data: response.data }

  } catch (error) {
    console.error('Erro ao renovar cliente:', error)
    return { success: false, error: error.message }
  }
}
