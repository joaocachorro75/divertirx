import ChatInterface from '@/components/ChatAI/ChatInterface'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">📺 Divertirx</h1>
            <p className="text-white/80">Seu canal de diversão na internet</p>
          </div>
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
