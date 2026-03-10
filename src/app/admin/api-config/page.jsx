'use client'

import { useState, useEffect } from 'react'
import { getAllProviders } from '@/lib/ai-config'

export default function AIConfigPage() {
  const [config, setConfig] = useState({
    provider: 'groq',
    model: '',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 1000,
  })
  const [providers, setProviders] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const prods = getAllProviders()
    setProviders(prods)
    setAvailableModels(prods[0]?.models || [])
  }, [])

  useEffect(() => {
    const provider = providers.find(p => p.key === config.provider)
    setAvailableModels(provider?.models || [])
    if (provider?.models?.length > 0 && !config.model) {
      setConfig(prev => ({ ...prev, model: provider.models[0].id }))
    }
  }, [config.provider, providers])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setMessage('✅ Configuração salva com sucesso!')
      } else {
        setMessage('❌ Erro ao salvar configuração')
      }
    } catch (error) {
      setMessage('❌ Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/ai-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const data = await response.json()
      if (data.success) {
        setMessage('✅ Conexão testada com sucesso!')
      } else {
        setMessage(`❌ Erro: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">🤖 Configuração de IA</h1>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-white/80 mb-2">Provedor de IA</label>
          <select
            value={config.provider}
            onChange={(e) => setConfig({ ...config, provider: e.target.value, model: '' })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          >
            {providers.map((p) => (
              <option key={p.key} value={p.key} className="bg-purple-900">
                {p.name} {p.isLocal && '(Local)'}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-white/80 mb-2">Modelo</label>
          <select
            value={config.model}
            onChange={(e) => setConfig({ ...config, model: e.target.value })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id} className="bg-purple-900">
                {m.name} ({m.context.toLocaleString()} tokens)
              </option>
            ))}
          </select>
        </div>

        {/* API Key (hidden if local) */}
        {config.provider !== 'ollama' && (
          <div>
            <label className="block text-white/80 mb-2">
              Chave API
              <span className="text-white/40 text-sm ml-2">(será criptografada)</span>
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={config.provider === 'groq' ? 'gsk_...' : config.provider === 'openrouter' ? 'sk-or-...' : 'sk-...'}
              className="w-full bg-white/10 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/30"
            />
          </div>
        )}

        {/* Temperature */}
        <div>
          <label className="block text-white/80 mb-2">
            Temperatura: <span className="text-purple-400">{config.temperature}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>Preciso (0)</span>
            <span>Balanceado (0.7)</span>
            <span>Criativo (2)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-white/80 mb-2">Máximo de Tokens</label>
          <select
            value={config.maxTokens}
            onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={500} className="bg-purple-900">500 (rápido)</option>
            <option value={1000} className="bg-purple-900">1.000 (padrão)</option>
            <option value={2000} className="bg-purple-900">2.000 (detalhado)</option>
            <option value={4000} className="bg-purple-900">4.000 (completo)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={testConnection}
            disabled={loading}
            className="flex-1 bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {loading ? 'Testando...' : '🔌 Testar Conexão'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Salvando...' : '💾 Salvar Configuração'}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-white/80">
        <h3 className="font-semibold mb-2 text-blue-400">ℹ️ Dicas de Provedores</h3>
        <ul className="space-y-2 text-sm">
          <li><strong>Groq:</strong> ⚡ Ultra rápido, bom custo-benefício</li>
          <li><strong>OpenRouter:</strong> 🌐 Acesso a múltiplos modelos (GPT, Claude, etc)</li>
          <li><strong>OpenAI:</strong> 🎯 Modelos mais avançados, preço premium</li>
          <li><strong>Ollama:</strong> 🏠 Grátis, privacidade total, requer instalação local</li>
        </ul>
      </div>
    </div>
  )
}
