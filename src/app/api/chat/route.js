import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Você é a assistente virtual da DivertiX, uma plataforma de vendas de Internet VPN Ilimitada e TV via Internet no Brasil.

SERVIÇOS OFERECIDOS:
1. Internet VPN Ilimitada - R$20/mês - 100 Mbps, sem limite, funciona em qualquer lugar
2. TV via Internet - R$25/mês - Canais HD, OnDemand, funciona em Smart TV, celular e computador

PROMOÇÃO: 1 TESTE LIFETIME por pessoa (CPF + IP únicos). O teste não expira!

COMPORTAMENTO:
- Seja amigável, use emojis naturalmente
- Se o usuário mostrar interesse, peça os dados: Nome, CPF, WhatsApp, Cidade
- Quando tiver todos os dados, confirme e diga que vai criar o teste
- NÃO mencione "painel de usuário" - mostre os dados de acesso DIRETAMENTE no chat

Quando for criar o teste, retorne um JSON no formato:
{"action": "create_test", "data": {"name": "...", "cpf": "...", "phone": "...", "city": "...", "choice": "tv ou internet"}}`;

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

function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('tv') || lowerMsg.includes('televisão')) {
    return `Que legal que você quer testar nossa TV! 📺

Me passa seus dados que já crio seu teste:
- Nome completo
- CPF
- WhatsApp
- Cidade`;
  }
  
  if (lowerMsg.includes('internet') || lowerMsg.includes('vpn')) {
    return `Perfeito! Nossa Internet VPN é top! 🌐

Me passa seus dados:
- Nome completo
- CPF
- WhatsApp
- Cidade`;
  }

  return `Olá! 👋 Bem-vindo à DivertiX!

Oferecemos:
📺 TV via Internet - R$25/mês  
🌐 Internet VPN - R$20/mês

🎁 **1 TESTE LIFETIME GRÁTIS!**

Qual você quer testar?`;
}

function extractData(message) {
  const cpfMatch = message.match(/\d{3}[\.]?\d{3}[\.]?\d{3}[-]?\d{2}/);
  const phoneMatch = message.match(/(\(?(\d{2})\)?\s*(\d{4,5})[-\s]?(\d{4}))/);
  const words = message.split(/\s+/);
  
  // Tenta identificar nome (geralmente as primeiras palavras capitalizadas)
  const nameWords = words.filter(w => /^[A-Z][a-z]+$/.test(w)).slice(0, 3);
  
  return {
    cpf: cpfMatch ? cpfMatch[0].replace(/\D/g, '') : null,
    phone: phoneMatch ? phoneMatch[1].replace(/\D/g, '') : null,
    name: nameWords.length > 0 ? nameWords.join(' ') : null,
  };
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
      
      // Verificar se a IA quer criar teste
      const createActionMatch = aiResponse.match(/\{"action":\s*"create_test"[^}]+\}/);
      if (createActionMatch) {
        try {
          const actionData = JSON.parse(createActionMatch[0]);
          // Chamar API de registro
          const registerResponse = await fetch(new URL('/api/register', request.url), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actionData.data),
          });
          const registerResult = await registerResponse.json();
          
          if (registerResult.success) {
            return NextResponse.json({
              response: `🎉 Pronto! Teste criado!`,
              testCreated: {
                username: registerResult.username,
                password: registerResult.password,
                server: registerResult.server,
                expiresAt: registerResult.expiresAt,
              },
            });
          }
        } catch (e) {
          console.error('Erro ao processar criação:', e);
        }
      }
      
      return NextResponse.json({
        response: aiResponse.replace(/\{"action":\s*"create_test"[^}]+\}/g, '').trim(),
        action: null,
        source: 'ai',
      });
    } catch (aiError) {
      console.log('IA falhou, usando fallback:', aiError.message);
      
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
      response: `Oi! Tô com um probleminha técnico, mas não deixo você na mão! 😅

Pode me dizer se você quer **Internet VPN** ou **TV**?`,
      action: null,
      source: 'error',
    });
  }
}
