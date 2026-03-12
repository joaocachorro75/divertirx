'use client';

import React, { useState } from 'react';

export default function FlowSelector({ clientData }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    city: '',
    choice: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChoice = (choice) => {
    setFormData({ ...formData, choice });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);
      setStep(3);
    } catch (error) {
      setResult({ success: false, error: error.message });
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="bg-gray-900/50 rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-4 text-white">🎁 Escolha seu Teste</h2>
        <p className="text-gray-300 mb-6 text-sm">
          Lembre-se: 1 teste lifetime por pessoa (CPF + IP)
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => handleChoice('internet')}
            className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <div className="font-bold">Internet VPN</div>
                <div className="text-sm text-blue-200">100 Mbps • Ilimitada • R$20/mês</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleChoice('tv')}
            className="w-full p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl transition text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📺</span>
              <div>
                <div className="font-bold">TV via Internet</div>
                <div className="text-sm text-purple-200">Canais HD • OnDemand • R$25/mês</div>
              </div>
            </div>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Após o teste, você pode assinar o plano completo
        </p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-gray-900/50 rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-4 text-white">📝 Complete seu cadastro</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">CPF</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
              maxLength="14"
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">WhatsApp</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Cidade</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              placeholder="Sua cidade"
            />
          </div>

          <input type="hidden" name="choice" value={formData.choice} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-xl font-bold transition"
          >
            {isSubmitting ? 'Processando...' : 'Criar meu Teste 🚀'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-2 text-gray-400 hover:text-white text-sm"
          >
            ← Voltar
          </button>
        </form>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="bg-gray-900/50 rounded-2xl border border-white/10 p-6 text-center">
        {result?.success ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2 text-white">Teste criado com sucesso!</h2>
            <div className="bg-gray-800 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-gray-400">Usuário:</p>
              <p className="font-mono text-lg text-white">{result.username}</p>
              <p className="text-sm text-gray-400 mt-2">Senha:</p>
              <p className="font-mono text-lg text-white">{result.password}</p>
              <p className="text-sm text-gray-400 mt-2">Servidor:</p>
              <p className="text-lg text-white">{result.server}</p>
            </div>
            <p className="text-sm text-gray-300">
              Guarde esses dados! Você receberá no WhatsApp também.
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-xl font-bold mb-2 text-white">Ops! Algo deu errado</h2>
            <p className="text-gray-300 mb-4">{result?.error || 'Tente novamente daqui a pouco'}</p>
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Tentar de novo
            </button>
          </>
        )}
      </div>
    );
  }

  return null;
}
