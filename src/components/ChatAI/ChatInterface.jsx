'use client'

import { useState, useRef, useEffect } from 'react'
import { useMessages } from '@/hooks/useMessages'

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const { 
    messages, 
    addMessage, 
    addSystemMessage,
    isLoading: messagesLoading 
  } = useMessages()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mensagem inicial do sistema
  useEffect(() => {
    if (messages.length === 0) {
      addSystemMessage({
        role: 'system',
        content: 'Olá! 👋 Bem-vindo à Divertirx, seu canal de diversão na internet. 🎬 O que você prefere: internet VPN ilimitada ou TV via Internet?'
      })
    }
  }, [messages.length, addSystemMessage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    addMessage({ role: 'user', content: userMessage })
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: sessionStorage.getItem('divertirx_userId') || 
                  (sessionStorage.setItem('divertirx_userId', crypto.randomUUID()), sessionStorage.getItem('divertirx_userId')),
          ip: 'client_ip', // Capturar IP do lado do cliente se necessário
        }),
      })

      if (!response.ok) throw new Error('Erro ao processar mensagem')

      const data = await response.json()
      addMessage({ role: 'assistant', content: data.response })

    } catch (error) {
      console.error('Erro:', error)
      addMessage({
        role: 'assistant',
        content: 'Opa! Não consegui processar sua mensagem. Pode tentar de novo? 😅'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-xl bg-white/5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
                  : 'bg-white/10 text-white rounded-bl-none backdrop-blur-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de entrada */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
          className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✉️
        </button>
      </form>
    </div>
  )
}
