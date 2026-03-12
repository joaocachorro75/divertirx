import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Você é a assistente virtual da DivertiX, uma plataforma de vendas de Internet VPN Ilimitada e TV via Internet no Brasil.

SERVIÇOS OFERECIDOS:
1. Internet VPN Ilimitada - R$20/mês
2. TV via Internet - R$25/mês

PROMOÇÃO: 1 TESTE LIFETIME por pessoa (CPF + IP únicos)

Seja amigável, use emojis e ajude o cliente a escolher.`;

async function callNVIDIA(message, history) {
  const apiKey = process.env.NVIDIA_API_KEY;
  const baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY não configurada');
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.5-397b-a17b',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API retornou ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta da API em formato inesperado');
    }
    
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Erro na chamada NVIDIA:', error);
    throw error;
  }
}

// Fallback simpático quando a IA não funciona
function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('tv')) {
    return `Oi! 📺 Que legal que você quer conhecer nossa TV! 

Oferecemos TV via internet por apenas **R$25/mês** com canais em HD e acesso em qualquer dispositivo.

🎁 **Teste Lifetime grátis!** Não expira, mas é só 1 por pessoa.

Qual seu nome para eu começar seu cadastro?`;
  }
  
  if (lowerMsg.includes('internet') || lowerMsg.includes('vpn')) {
    return `Oi! 🌐 Nossa Internet VPN é top!

**R$20/mês** - Ilimitada, 100 Mbps, funciona em qualquer lugar.

🎁 **Teste Lifetime grátis!** Só 1 teste por pessoa (CPF + IP).

Como posso te chamar?`;
  }

  return `Olá! 👋 Bem-vindo à DivertiX!

Oferecemos:
📺 TV via Internet - R$25/mês  
🌐 Internet VPN - R${'2'}0/mês

🎁 **1 TESTE LIFETIME GRÁTIS** (não expira!)

Qual você quer testar?`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json({
        response: 'Oi! Pode me dizer o que você precisa? 😊',
        action: null,
      });
    }

    // Tentar IA
    try {
      const aiResponse = await callNVIDIA(message, history);
      return NextResponse.json({
        response: aiResponse,
        action: null,
        source: 'ai',
      });
    } catch (aiError) {
      console.log('IA falhou, usando fallback:', aiError.message);
      
      // Usar resposta fallback
      const fallbackResponse = getFallbackResponse(message);
      return NextResponse.json({
        response: fallbackResponse,
        action: null,
        source: 'fallback',
      });
    }

  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json({
      response: `Oi! Tô com um probleminha técnico aqui, mas puxa vida, não deixa eu te deixar na mão! 😅

Pode me dizer se você quer **Internet VPN** ou **TV**? Aí eu já te ajudo!`,
      action: null,
      source: 'error',
    });
  }
}
