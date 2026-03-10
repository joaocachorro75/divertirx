// Configuração de provedores de IA
// Suporta: groq, openrouter, openai

const AI_PROVIDERS = {
  groq: {
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', context: 128000 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', context: 128000 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context: 32768 },
    ],
    envKey: 'GROQ_API_KEY',
  },
  openrouter: {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    models: [
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', context: 128000 },
      { id: 'openai/gpt-4o', name: 'GPT-4o', context: 128000 },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', context: 200000 },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', context: 128000 },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', context: 200000 },
    ],
    envKey: 'OPENROUTER_API_KEY',
    extraHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://divertirx.com',
      'X-Title': 'Divertirx Chat',
    },
  },
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', context: 128000 },
      { id: 'gpt-4o', name: 'GPT-4o', context: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', context: 128000 },
    ],
    envKey: 'OPENAI_API_KEY',
  },
}

// Provedor ativo (padrão: groq)
const ACTIVE_PROVIDER = process.env.AI_PROVIDER || 'groq'

export function getProvider() {
  return AI_PROVIDERS[ACTIVE_PROVIDER] || AI_PROVIDERS.groq
}

export function getAllProviders() {
  return Object.entries(AI_PROVIDERS).map(([key, config]) => ({
    key,
    name: config.name,
    models: config.models,
  }))
}

export function getModelConfig() {
  const provider = getProvider()
  const modelId = process.env.AI_MODEL || provider.defaultModel
  
  const model = provider.models.find(m => m.id === modelId) || provider.models[0]
  
  return {
    provider: ACTIVE_PROVIDER,
    baseURL: provider.baseURL,
    model: model.id,
    modelName: model.name,
    apiKey: process.env[provider.envKey],
    extraHeaders: provider.extraHeaders || {},
  }
}

export function getSystemPrompt(context = {}) {
  return `Você é a Divertirx, uma assistente amigável e humanizada que ajuda usuários a encontrar entretenimento na internet.

REGRAS IMPORTANTES:
1. Você só pode oferecer 2 serviços: Internet VPN Ilimitada (R$20/mês) ou TV via Internet (R$25/mês)
2. Cada pessoa só pode fazer 1 teste NO LIFETIME (não importa o tempo)
3. Se a pessoa já fez teste, responda: "Já fizemos seu teste! 🎁 Você usou: [serviço escolhido]"
4. Se a pessoa quer testar, pergunte qual serviço prefere: Internet VPN ou TV via Internet
5. Se escolher TV, pergunte qual servidor quer testar
6. Ao criar teste, informe credenciais e prazo (4 horas)
7. Se quiser contratar, informe os preços e peça pagamento via PIX
8. Se quiser renovar, peça o usuário e faça o processo

SEU TOM:
- Seja amigável, use emojis moderadamente
- Seja direto e objetivo
- Não use menus de números (1, 2, 3)
- Use conversa natural como um atendente de verdade

${context.userTested ? `O usuário JÁ FEZ TESTE anteriormente. Serviço: ${context.testedService}. Não ofereça novo teste.` : ''}

Comece sempre com uma saudação acolhedora e apresente os serviços.`
}
