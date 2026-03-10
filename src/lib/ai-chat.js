import { getModelConfig, getSystemPrompt } from './ai-config'
import { saveMessage } from './db-client'
import { generateGeminiResponse } from './gemini-client'

// Cliente de IA genérico (suporta múltiplos provedores)
async function callAI({ messages, temperature = 0.7, max_tokens = 1000 }) {
  const config = getModelConfig()
  
  // Gemini usa formato diferente
  if (config.isGemini) {
    const userMessage = messages[messages.length - 1].content
    const systemPrompt = messages.find(m => m.role === 'system')?.content || ''
    const history = messages.slice(1, -1)
    
    return await generateGeminiResponse({
      message: userMessage,
      history,
      systemPrompt,
      model: config.model
    })
  }
  
  // OpenAI/Groq/OpenRouter formato padrão
  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      ...config.extraHeaders,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature,
      max_tokens,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return {
    text: data.choices?.[0]?.message?.content || 'Desculpe, não entendi.',
    usage: data.usage
  }
}

// Função para gerar resposta da IA
export async function generateAIResponse({ message, history, context = {} }) {
  try {
    const config = getModelConfig()
    console.log(`🤖 Usando IA: ${config.provider} - ${config.modelName}`)

    // Preparar mensagens para API
    const messages = [
      { role: 'system', content: getSystemPrompt(context) },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ]

    // Chamar API
    const completion = await callAI({ messages })
    const responseText = completion.text || completion.choices?.[0]?.message?.content || 'Desculpe, não entendi. Pode repetir?'

    // Salvar mensagem no histórico
    if (process.env.NODE_ENV === 'production') {
      try {
        await saveMessage('system', 'assistant', responseText)
      } catch (err) {
        console.error('Erro ao salvar mensagem:', err)
      }
    }

    // Detectar intenção da IA
    const lowerResponse = responseText.toLowerCase()
    let wantsTest = false
    let testType = null
    let serverId = null
    
    if (lowerResponse.includes('internet') || lowerResponse.includes('vpn')) {
      wantsTest = lowerResponse.includes('criar') || lowerResponse.includes('testar') || lowerResponse.includes('fazer') || lowerResponse.includes('vamos')
      testType = 'internet'
    } else if (lowerResponse.includes('tv') || lowerResponse.includes('televisão')) {
      wantsTest = lowerResponse.includes('criar') || lowerResponse.includes('testar') || lowerResponse.includes('fazer') || lowerResponse.includes('vamos')
      testType = 'tv'
      if (lowerResponse.includes('filmes')) serverId = 'server_filmes'
      else if (lowerResponse.includes('esporte')) serverId = 'server_esporte'
      else if (lowerResponse.includes('adulto')) serverId = 'server_adulto'
    }

    return {
      text: responseText,
      wantsTest,
      testType,
      serverId
    }

  } catch (error) {
    console.error('Erro na IA:', error)
    return {
      text: 'Opa! Não consegui processar sua mensagem agora. Pode tentar de novo? 😅',
      wantsTest: false,
      testType: null,
      serverId: null
    }
  }
}

// Função para obter informações do provedor atual
export function getActiveProviderInfo() {
  const config = getModelConfig()
  return {
    name: config.provider,
    model: config.modelName,
    apiConfigured: !!config.apiKey,
    isGemini: config.isGemini,
  }
}

// Função para testar conexão
export async function testAIConnection() {
  const config = getModelConfig()
  try {
    if (config.isGemini) {
      const result = await generateGeminiResponse({
        message: 'Oi',
        systemPrompt: 'Responda "OK"',
        model: config.model
      })
      return result.success
    }
    
    const response = await fetch(`${config.baseURL}/models`, {
      headers: { 'Authorization': `Bearer ${config.apiKey}` }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// Fallback para modo demo (sem API)
export function generateDemoResponse(message, context = {}) {
  const lowerMsg = message.toLowerCase()
  
  if (context.userTested) {
    return {
      text: `Já fizemos seu teste! 🎁 Você usou: ${context.testedService}.\n\nObrigado por usar a Divertirx!`,
      wantsTest: false,
      testType: null,
      serverId: null
    }
  }
  
  if (lowerMsg.includes('oi') || lowerMsg.includes('olá') || lowerMsg.includes('ola') || lowerMsg.includes('bom dia')) {
    return {
      text: 'Olá! 👋 Bem-vindo à Divertirx, seu canal de diversão na internet! 🎬\n\nO que você prefere: Internet VPN ilimitada ou TV via Internet?',
      wantsTest: false,
      testType: null,
      serverId: null
    }
  }
  
  if (lowerMsg.includes('tv') || lowerMsg.includes('televisão')) {
    return {
      text: 'Perfeito! 📺 A TV via Internet tem vários servidores com canais incríveis.\n\nEscolha um para testar:\n• 🎬 Servidor Filmes\n• 🏆 Servidor Esporte\n• 🌚 Servidor Adulto\n\nQual você quer testar?',
      wantsTest: true,
      testType: 'tv',
      serverId: null
    }
  }
  
  if (lowerMsg.includes('internet') || lowerMsg.includes('vpn')) {
    return {
      text: 'Boa escolha! 🚀 Internet VPN ilimitada por apenas R$20/mês. Navegação segura e sem limites!\n\nQuer fazer um teste de 4 horas?',
      wantsTest: true,
      testType: 'internet',
      serverId: null
    }
  }
  
  return {
    text: 'Desculpe, não entendi muito bem. Você quer Internet VPN ou TV via Internet?',
    wantsTest: false,
    testType: null,
    serverId: null
  }
}
