'use client';

import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatAI/ChatInterface';
import FlowSelector from '../components/Flow/FlowSelector';

export default function Home() {
  const [clientData, setClientData] = useState(null);
  const [showFlow, setShowFlow] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
              📺
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                DivertiX
              </h1>
              <p className="text-xs text-gray-400">Internet e TV Inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              IA Online
            </span>
            {clientData && (
              <button
                onClick={() => setShowFlow(!showFlow)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm font-medium"
              >
                Meu Plano
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-4 text-sm">
          <span className="bg-purple-600 px-3 py-1 rounded-full font-bold">1 TESTE LIFETIME</span>
          <span className="text-gray-300">Teste gratuito que não expira • Escolha entre Internet VPN ou TV • 1 por pessoa (CPF + IP)</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4">
        {/* Chat Section */}
        <div className="flex-1 min-h-[600px] lg:min-h-0">
          <ChatInterface 
            onClientRegistered={setClientData}
            clientData={clientData}
          />
        </div>

        {/* Flow Section (conditional) */}
        {showFlow && clientData && (
          <div className="w-full lg:w-96 animate-fade-in">
            <FlowSelector clientData={clientData} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 p-4 bg-black/20">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>© 2026 DivertiX • To-Ligado.com • Atendimento por IA humanizada</p>
          <p className="mt-1">Teste gratuito • Sem compromisso • Cancele quando quiser</p>
        </div>
      </footer>
    </main>
  );
}
