import { useState } from 'react';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sql?: string;
  tables?: string[];
  confidence?: number;
  reasoning?: string;
};

export function InvestigatorChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello. I am the KSP Investigator Copilot. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    const apiUrl = (import.meta.env.VITE_API_BASE || 'http://localhost:8000') + '/api/v1/chat/query';
    
    // Call the API
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'session-123', message: input, lang: 'en' })
    })
    .then(res => res.json())
    .then(data => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer || 'Sorry, I could not generate an answer.',
        sql: data.sql,
        tables: data.tablesUsed,
        confidence: data.confidence,
        reasoning: data.reasoningSummary || "No reasoning provided."
      };
      setMessages(prev => [...prev, aiMsg]);
      setSelectedMsg(aiMsg);
    })
    .catch(err => {
      console.error(err);
      const errMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Error communicating with the backend API.' };
      setMessages(prev => [...prev, errMsg]);
    });
  };

  return (
    <div className="flex h-full w-full bg-tactical-950 text-tactical-100 font-sans">
      {/* Left Pane: Sessions */}
      <div className="w-64 border-r border-tactical-800 bg-tactical-900 flex flex-col">
        <div className="p-4 border-b border-tactical-800 font-bold text-tactical-300">
          Past Sessions
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <button className="w-full text-left p-2 rounded bg-tactical-800 text-sm hover:bg-tactical-700 transition">
            Robbery hotspots in Blr...
          </button>
          <button className="w-full text-left p-2 rounded text-tactical-400 text-sm hover:bg-tactical-800 transition">
            Repeat offenders Mysuru
          </button>
        </div>
      </div>

      {/* Center Pane: Chat */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] p-4 rounded-lg shadow-md cursor-pointer border ${msg.sender === 'user' ? 'bg-blue-900/40 border-blue-500/50 text-blue-50' : 'bg-tactical-800 border-tactical-600 text-tactical-100'}`}
                onClick={() => msg.sender === 'ai' && setSelectedMsg(msg)}
              >
                <div className="text-sm">{msg.text}</div>
                {msg.sender === 'ai' && msg.sql && (
                  <div className="mt-2 text-xs text-blue-400 font-semibold opacity-70">
                    Click to view reasoning
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input Bar */}
        <div className="p-4 border-t border-tactical-800 bg-tactical-900">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <button className="p-2 text-tactical-400 hover:text-white rounded-full bg-tactical-800" title="Voice Input">
              🎤
            </button>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask a plain-language question about crime data (English or Kannada)..."
              className="flex-1 bg-tactical-950 border border-tactical-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
            <button 
              onClick={handleSend}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Pane: Reasoning */}
      {selectedMsg && (
        <div className="w-96 border-l border-tactical-800 bg-tactical-900 flex flex-col">
          <div className="p-4 border-b border-tactical-800 flex justify-between items-center">
            <span className="font-bold text-tactical-300">Explainable AI</span>
            <button onClick={() => setSelectedMsg(null)} className="text-tactical-500 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="text-xs uppercase text-tactical-500 font-bold mb-2">Confidence Score</h3>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-tactical-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{width: `${(selectedMsg.confidence || 0) * 100}%`}}></div>
                </div>
                <span className="text-sm font-mono text-emerald-400">{Math.round((selectedMsg.confidence || 0) * 100)}%</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs uppercase text-tactical-500 font-bold mb-2">Generated SQL</h3>
              <pre className="p-3 bg-tactical-950 border border-tactical-800 rounded text-xs font-mono overflow-x-auto text-blue-300 whitespace-pre-wrap">
                {selectedMsg.sql}
              </pre>
            </div>

            <div>
              <h3 className="text-xs uppercase text-tactical-500 font-bold mb-2">Tables Touched</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMsg.tables?.map(t => (
                  <span key={t} className="px-2 py-1 bg-tactical-800 border border-tactical-700 rounded text-xs text-tactical-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase text-tactical-500 font-bold mb-2">Reasoning Summary</h3>
              <p className="text-sm text-tactical-300">
                {selectedMsg.reasoning}
              </p>
            </div>
            
            <div className="pt-4 border-t border-tactical-800">
              <button className="w-full py-2 bg-tactical-800 hover:bg-tactical-700 text-tactical-200 text-sm font-bold rounded transition">
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
