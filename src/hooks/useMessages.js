import { useState, useCallback, useEffect } from 'react'

export function useMessages() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar histórico ao montar
  useEffect(() => {
    const storedMessages = sessionStorage.getItem('divertirx_messages')
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }
  }, [])

  // Salvar histórico a cada mudança
  useEffect(() => {
    sessionStorage.setItem('divertirx_messages', JSON.stringify(messages))
  }, [messages])

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      ...message,
      id: message.id || Date.now().toString(),
      timestamp: new Date().toISOString()
    }])
  }, [])

  const addSystemMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      ...message,
      id: message.id || 'system-' + Date.now(),
      timestamp: new Date().toISOString()
    }])
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    sessionStorage.removeItem('divertirx_messages')
  }, [])

  return {
    messages,
    addMessage,
    addSystemMessage,
    clearMessages,
    isLoading
  }
}
