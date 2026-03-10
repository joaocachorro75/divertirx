// Cliente para Google Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

export async function generateGeminiResponse({ message, history, systemPrompt, model = 'gemini-2.5-flash' }) {
  try {
    const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    // Construir o corpo da requisição no formato Gemini
    const contents = []
    
    // Adicionar histórico se existir
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })
      }
    }
    
    // Adicionar mensagem atual com system prompt embutido (Gemini não tem role separado)
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUsuario: ${message}` : message
    contents.push({
      role: 'user',
      parts: [{ text: fullPrompt }]
    })

    const body = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1000,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gemini API error: ${error}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        text: data.candidates[0].content.parts[0].text,
        usage: data.usageMetadata,
        success: true
      }
    }
    
    throw new Error('Resposta inválida do Gemini')

  } catch (error) {
    console.error('Erro Gemini:', error)
    return {
      text: 'Desculpe, não consegui processar sua mensagem agora. Tente novamente em instantes.',
      success: false,
      error: error.message
    }
  }
}

// Testar conexão
export async function testGeminiConnection() {
  try {
    const result = await generateGeminiResponse({
      message: 'Olá',
      systemPrompt: 'Você é a Divertirx.',
      model: 'gemini-2.5-flash'
    })
    return result.success
  } catch (error) {
    return false
  }
}
