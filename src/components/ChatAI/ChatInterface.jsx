'use client';

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ChatInterface({ onClientRegistered, clientData }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! 👋 Bem-vindo à DivertiX!

Sou sua assistente virtual e estou aqui para te ajudar a descobrir nossos serviços de internet e TV.

🎁 **Promoção especial: 1 TESTE LIFETIME**
- Teste gratuito que não expira
- Escolha: Internet VPN ou TV
- 1 teste por pessoa (identificado por CPF + IP)

Como posso te ajudar hoje? 😊`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages,
          clientData,
        }),
      });

      const data = await response.json();

      // Se retornou dados de teste criado, mostrar no chat
      if (data.testCreated) {
        const successMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `🎉 **Teste criado com sucesso!**

Aqui estão seus dados de acesso:

📱 **Usuário:** \`${data.testCreated.username}\`
🔑 **Senha:** \`${data.testCreated.password}\`
🖥️ **Servidor:** ${data.testCreated.server || 'PIX GOLD'}
⏰ **Expira em:** ${data.testCreated.expiresAt || '4 horas'}

**Como usar:**
1. Baixe o app do player IPTV
2. Digite usuário e senha acima
3. Pronto! Aproveite!

Guarde esses dados com carinho! 💜`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, successMessage]);
      } else {
        // Resposta normal da IA
        const aiMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }

      if (data.clientData) {
        onClientRegistered(data.clientData);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Ops! Tive um problema técnico. Pode tentar novamente?',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickChoice = async (choice) => {
    const message = choice === 'internet' 
      ? 'Quero testar a Internet VPN'
      : 'Quero testar a TV';
    setInput(message);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-2xl border border-white/10 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 bg-purple-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <h3 className="font-semibold text-white">DivertiX Assistant</h3>
            <p className="text-xs text-gray-400">Sempre online para te ajudar</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-white/5'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {msg.content}
              </pre>
            </div>
          </div>
        ))}

        {/* Quick Actions - Only on first message */}
        {!clientData && messages.length === 1 && (
          <div className="flex flex-wrap gap-2 justify-center pt-4">
            <button
              onClick={() => handleQuickChoice('internet')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full text-sm font-medium transition transform hover:scale-105"
            >
              🌐 Quero Internet VPN
            </button>
            <button
              onClick={() => handleQuickChoice('tv')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-full text-sm font-medium transition transform hover:scale-105"
            >
              📺 Quero TV
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-gray-900/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-xl font-medium transition"
          >
            {isLoading ? '...' : 'Enviar'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          DivertiX • Internet VPN R$20/mês • TV R$25/mês • Teste gratuito
        </p>
      </div>
    </div>
  );
}
