import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { checkTestLimit, saveTestRecord, getUserHistory } from '@/lib/db-client'
import { generateAIResponse } from '@/lib/ai-chat'
import { createTestClientOnPix, createTestClientServX } from '@/lib/api-onpix'

// Sistema de prompt para IA humanizada
const SYSTEM_PROMPT = `
Você é a Divertirx, uma assistente amigável e humanizada que ajuda usuários a encontrar entretenimento na internet.

SUAS REGRAS IMPORTANTES:
1. Você só pode oferecer 2 serviços: Internet VPN Ilimitada (R$20/mês) ou TV via Internet (R$25/mês)
2. Cada pessoa só pode fazer 1 teste NO LIFETIME (não importa o tempo)
3. Se a pessoa já fez teste, responda: "Já fizemos seu teste! Você usou: [serviço escolhido]"
4. Se a pessoa quer testar, pergunte qual serviço prefere: Internet VPN ou TV via Internet
5. Se escolher TV, pergunte qual servidor quer testar (ex: Filmes, Esporte, Adulto)
6. Ao criar teste, informe credenciais e prazo (4 horas)
7. Se quiser contratar, informe os preços e peça pagamento via PIX
8. Se quiser renovar, peça o usuário e faça o processo

SEU TON:
- Seja amigável, use emojis moderadamente
- Seja direto e objetivo
- Não use menus de números (1, 2, 3)
- Use conversa natural como um atendente de true

Comece sempre com uma saudação acolhedora e apresente os serviços.
`

export async function POST(request) {
  try {
    const data = await request.json()
    const { 
      message, 
      userId, 
      ip,
      chatHistory = []
    } = data

    // Verificar se usuário já fez teste
    const existingTest = await checkTestLimit(userId, ip)
    
    // Se já testou, informar e encerrar
    if (existingTest) {
      return NextResponse.json({
        response: `Já fizemos seu teste! 🎁 Você usou: ${existingTest.service_type === 'internet' ? 'Internet VPN Ilimitada' : 'TV via Internet'}.\n\nObrigado por usar a Divertirx!`,
        newMessageId: uuidv4()
      })
    }

    // Pegar histórico para contexto
    const history = getUserHistory(chatHistory)
    
    // Gerar resposta da IA
    const aiResponse = await generateAIResponse({
      message,
      history,
      systemPrompt: SYSTEM_PROMPT
    })

    // Se a IA detectou que usuário quer criar teste
    if (aiResponse.wantsTest) {
      const testType = aiResponse.testType // 'internet' ou 'tv'
      const serverId = aiResponse.serverId // se for TV

      // Criar teste no painel correspondente
      let testResult
      if (testType === 'internet') {
        testResult = await createTestClientServX(userId, 4)
      } else if (testType === 'tv') {
        testResult = await createTestClientOnPix(serverId, userId, 4)
      }

      if (testResult.success) {
        // Salvar registro de teste
        await saveTestRecord(userId, ip, testType, serverId, testResult.credentials)

        return NextResponse.json({
          response: `🔥 Seu teste foi criado com sucesso! 🎉\n\n${testResult.credenciaisFormatadas}\n\nDuração: 4 horas\nBoa diversão!`,
          newMessageId: uuidv4(),
          testCreated: true,
          credentials: testResult.credentials
        })
      } else {
        return NextResponse.json({
          response: `⚠️ Não consegui criar seu teste no momento. Por favor, tente novamente ou entre em contato com suporte.`,
          newMessageId: uuidv4()
        })
      }
    }

    return NextResponse.json({
      response: aiResponse.text,
      newMessageId: uuidv4()
    })

  } catch (error) {
    console.error('Erro no chat:', error)
    return NextResponse.json({
      response: 'Opa! Não consegui processar sua mensagem. Pode tentar de novo?',
      newMessageId: uuidv4(),
      error: error.message
    }, { status: 500 })
  }
}
