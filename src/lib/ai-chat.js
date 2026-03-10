import { Groq } from 'groq-sdk'
import { saveMessage } from './db-client'

// Inicializar cliente Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_placeholder'
})

// Função para gerar resposta da IA
export async function generateAIResponse({ message, history, systemPrompt }) {
  try {
    // Preparar mensagens para API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    // Chamar API do Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1000
    })

    const responseText = chatCompletion.choices[0]?.message?.content || 'Desculpe, não entendi. Pode repetir?'

    // Salvar mensagem no histórico
    if (process.env.NODE_ENV === 'production') {
      try {
        await saveMessage('system', 'assistant', responseText)
      } catch (err) {
        console.error('Erro ao salvar mensagem:', err)
      }
    }

    // Tentar parsear se a IA quer criar teste
    let wantsTest = false
    let testType = null
    let serverId = null

    // Detectar intenção da IA (lógica simples)
    const lowerResponse = responseText.toLowerCase()
    if (lowerResponse.includes('internet') || lowerResponse.includes('vpn')) {
      wantsTest = lowerResponse.includes('criar') || lowerResponse.includes('testar') || lowerResponse.includes('fazer')
      testType = 'internet'
    } else if (lowerResponse.includes('tv') || lowerResponse.includes('canal')) {
      wantsTest = lowerResponse.includes('criar') || lowerResponse.includes('testar') || lowerResponse.includes('fazer')
      testType = 'tv'
      // Tentar extrair servidor se mencionado
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
      text: 'Opa! Não consegui processar sua mensagem. Pode tentar de novo? 😅',
      wantsTest: false,
      testType: null,
      serverId: null
    }
  }
}

// Função para gerar system prompt dinâmico baseado em contexto
export function createSystemPrompt(context = {}) {
  const basePrompt = `Você é a Divertirx, uma assistente amigável e humanizada que ajuda usuários a encontrar entretenimento na internet.

 SUAS REGRAS IMPORTANTES:
 1. Você só pode oferecer 2 serviços: Internet VPN Ilimitada (R$20/mês) ou TV via Internet (R$25/mês)
 2. Cada pessoa só pode fazer 1 teste NO LIFETIME (não importa o tempo)
 3. Se a pessoa já fez teste, responda: "Já fizemos seu teste! 🎁 Você usou: [serviço escolhido]"
 4. Se a pessoa quer testar, pergunte qual serviço prefere: Internet VPN ou TV via Internet
 5. Se escolher TV, pergunte qual servidor quer testar
 6. Ao criar teste, informe credenciais e prazo (4 horas)
 7. Se quiser contratar, informe os preços e peça pagamento via PIX
 8. Se quiser renovar, peça o usuário e faça o processo

 SEU TON:
 - Seja amigável, use emojis moderadamente
 - Seja direto e objetivo
 - Não use menus de números (1, 2, 3)
 - Use conversa natural como um atendente de true

 Comece sempre com uma saudação acolhedora e apresente os serviços.`

  return basePrompt
}
