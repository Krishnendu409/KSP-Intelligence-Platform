import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu, Search, Send, Bot, User, Loader2, ChevronDown, ChevronUp, MapPin
} from 'lucide-react';
import { apiFetch } from '../shared/api/apiFetch';

export interface AICopilotPanelProps {
  onClose?: () => void;
  isFullPage?: boolean;
}

interface CopilotAnswer {
  answer: string;
  intent: string;
  tablesUsed: string[];
  filtersUsed: Record<string, unknown>;
  confidence: number;
  reasoningSummary: string;
  visualizationType: string;
  data: unknown;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  reasoning?: CopilotAnswer | null;
  isError?: boolean;
}

const QUICK_PROMPTS = [
  'Show trend for the last 30 days in my district',
  'Are there any anomalies or emerging hotspots?',
  'Find repeat offenders across districts',
  'Search cases mentioning theft',
];

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({ isFullPage = false }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'init',
    role: 'assistant',
    content: 'KSP Intelligence Copilot online. I answer using only real backend queries — every response shows exactly which tables and filters were used, plus a confidence score. No language model is involved (ADR 0007).',
    timestamp: new Date(),
  }]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [activePanel, setActivePanel] = useState<'chat' | 'fir'>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChatMessage = async (text?: string) => {
    const msgText = (text || chatInput).trim();
    if (!msgText || isSending) return;
    setChatInput('');

    setChatMessages(prev => [...prev, {
      id: `u-${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date(),
    }]);
    setIsSending(true);

    try {
      const res = await apiFetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText }),
      });
      const data: CopilotAnswer = await res.json();
      if (!res.ok) throw new Error((data as any).error || 'Copilot request failed');

      setChatMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        reasoning: data,
      }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: err.message || 'Could not reach the backend.',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleRunSearch = async (e?: React.FormEvent, qStr?: string) => {
    if (e) e.preventDefault();
    const q = (qStr || inputQuery).trim();
    if (!q) return;
    setIsSearching(true);
    try {
      const res = await apiFetch(`/api/search/cases?q=${encodeURIComponent(q)}&limit=15`);
      const results = res.ok ? await res.json() : [];
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`flex flex-col bg-tactical-900 text-tactical-100 overflow-hidden ${
      isFullPage ? 'h-full w-full border border-tactical-700 rounded-lg' : 'h-full w-full border-0 rounded-none'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-tactical-950 border-b border-tactical-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold tracking-wider text-white">KSP INTELLIGENCE COPILOT</h3>
            <div className="text-xxs font-mono text-accent-cyan">Deterministic · no LLM in the analytical path</div>
          </div>
        </div>
      </div>

      {/* Panel Tabs */}
      <div className="flex border-b border-tactical-800 bg-tactical-950/50 shrink-0">
        {(['chat', 'fir'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActivePanel(tab)}
            className={`flex-1 py-2 text-xxs font-mono font-bold uppercase tracking-wider transition-colors ${
              activePanel === tab
                ? 'text-accent-cyan border-b-2 border-accent-cyan bg-tactical-800/40'
                : 'text-tactical-400 hover:text-tactical-200'
            }`}
          >
            {tab === 'chat' ? 'Intelligence Chat' : 'FIR Search (BM25)'}
          </button>
        ))}
      </div>

      {/* CHAT PANEL */}
      {activePanel === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border ${
                  msg.role === 'user' ? 'bg-accent-cyan/20 border-accent-cyan/40' : 'bg-tactical-800 border-tactical-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-accent-cyan" /> : <Bot className="w-3.5 h-3.5 text-tactical-300" />}
                </div>
                <div className="flex-1 max-w-[85%] flex flex-col">
                  <div className={`px-3 py-2.5 rounded-lg text-xs font-mono leading-relaxed ${
                    msg.isError
                      ? 'bg-accent-red/10 border border-accent-red/30 text-accent-red'
                      : msg.role === 'user'
                        ? 'bg-accent-cyan/15 border border-accent-cyan/30 text-tactical-100'
                        : 'bg-tactical-800/90 border border-tactical-700 text-tactical-100'
                  }`}>
                    {msg.content}
                  </div>

                  {msg.reasoning && (
                    <div className="mt-1">
                      <button
                        onClick={() => setExpandedReasoning(expandedReasoning === msg.id ? null : msg.id)}
                        className="flex items-center gap-1 text-xxs font-mono text-accent-cyan hover:underline"
                      >
                        {expandedReasoning === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        Show reasoning ({Math.round(msg.reasoning.confidence)}% confidence)
                      </button>
                      {expandedReasoning === msg.id && (
                        <div className="mt-1.5 p-2.5 rounded bg-tactical-950 border border-tactical-700 text-xxs font-mono text-tactical-300 space-y-1">
                          <div><span className="text-tactical-500">Intent:</span> {msg.reasoning.intent}</div>
                          <div><span className="text-tactical-500">Tables used:</span> {msg.reasoning.tablesUsed.join(', ') || '—'}</div>
                          <div><span className="text-tactical-500">Filters:</span> {JSON.stringify(msg.reasoning.filtersUsed)}</div>
                          <div><span className="text-tactical-500">Reasoning:</span> {msg.reasoning.reasoningSummary}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-tactical-500 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-tactical-400 text-xs font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying backend...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <div className="px-3 py-2 border-t border-tactical-800 flex flex-wrap gap-1.5 shrink-0 bg-tactical-950/30">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendChatMessage(p)}
                disabled={isSending}
                className="px-3 py-1.5 md:px-2 md:py-0.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 hover:border-accent-cyan text-xs md:text-xxs font-mono text-tactical-300 hover:text-white transition-all disabled:opacity-40 whitespace-normal text-left"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="px-3 py-2.5 border-t border-tactical-800 flex gap-2 shrink-0 bg-tactical-950/50">
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
              placeholder="Ask about trends, hotspots, repeat offenders, or search cases... (Enter to send)"
              rows={2}
              disabled={isSending}
              className="flex-1 min-w-0 bg-tactical-900 border border-tactical-600 rounded px-3 py-2 md:px-3 md:py-1.5 text-sm md:text-xs font-mono text-white focus:border-accent-cyan focus:outline-none resize-none disabled:opacity-40"
            />
            <button
              onClick={() => sendChatMessage()}
              disabled={isSending || !chatInput.trim()}
              className="px-4 py-2 md:px-3 md:py-1.5 rounded bg-accent-cyan hover:bg-accent-cyan/90 text-tactical-950 font-mono font-bold text-sm md:text-xs transition-colors disabled:opacity-40 flex items-center justify-center shrink-0"
            >
              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* FIR SEARCH PANEL */}
      {activePanel === 'fir' && (
        <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
          <div className="bg-tactical-800/80 border border-tactical-700 rounded p-3">
            <label className="block text-xs font-mono font-bold text-accent-cyan mb-1.5 uppercase flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Full-text FIR search (BM25)</span>
            </label>
            <form onSubmit={handleRunSearch} className="flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="e.g. theft, robbery, a station name..."
                className="flex-1 bg-tactical-900 border border-tactical-600 rounded px-3 py-1.5 text-xs font-mono text-white focus:border-accent-cyan focus:outline-none"
              />
              <button type="submit" disabled={isSearching} className="px-3 py-1.5 rounded bg-accent-cyan hover:bg-accent-cyan/90 text-tactical-950 font-mono font-bold text-xs transition-colors shrink-0 disabled:opacity-50">
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'SEARCH'}
              </button>
            </form>
          </div>

          {searchResults && (
            <div className="flex-1 flex flex-col bg-tactical-800/60 border border-tactical-700 rounded p-3 overflow-hidden">
              <div className="text-xxs font-mono uppercase text-accent-cyan font-bold mb-2">
                {searchResults.length} MATCH{searchResults.length === 1 ? '' : 'ES'}
              </div>
              {searchResults.length === 0 ? (
                <div className="text-xs font-mono text-tactical-400">No cases matched.</div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2">
                  {searchResults.map((fir) => (
                    <div key={fir.CaseMasterID} className="p-2.5 rounded bg-tactical-900/90 border border-tactical-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs text-white">CRIME NO: {fir.CrimeNo}</span>
                      </div>
                      <div className="text-xxs font-mono text-tactical-300 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-tactical-400" />
                        <span>Case #{fir.CaseMasterID}</span>
                      </div>
                      <p className="text-xxs font-mono text-tactical-200 line-clamp-2">{fir.BriefFacts}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
