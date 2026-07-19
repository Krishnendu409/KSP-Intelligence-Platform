import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, User, Car, Phone, Briefcase, History, HelpCircle } from "lucide-react";
import type { SearchResponse } from "@shared/client";
import { useInvestigationStore } from "../../workspace/store/useInvestigationStore";
import { apiFetch } from "../../shared/api/apiFetch";

async function searchCases(rawQuery: string): Promise<{ results: any[] }> {
  const cleaned = rawQuery.replace(/^(case|fir|person|phone|vehicle|evidence|district|threat):\s*/i, "").trim();
  if (!cleaned) return { results: [] };

  const res = await apiFetch(`/api/search/cases?q=${encodeURIComponent(cleaned)}&limit=20`);
  if (!res.ok) return { results: [] };
  const cases: any[] = await res.json();

  return {
    results: cases.map((c) => ({
      id: `CASE-${c.CaseMasterID}`,
      name: c.CrimeNo,
      type: "Case",
      subtitle: (c.BriefFacts || "").slice(0, 100),
      caseId: `CASE-${c.CaseMasterID}`,
      score: c.score,
    })),
  };
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_OPERATORS = [
  { operator: "phone:", description: "Search by phone number" },
  { operator: "vehicle:", description: "Search by plate number" },
  { operator: "case:", description: "Search by FIR number" },
  { operator: "district:", description: "Search by Bengaluru district" },
  { operator: "before:", description: "Events before date (YYYY-MM-DD)" },
  { operator: "after:", description: "Events after date (YYYY-MM-DD)" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { navigation, addRecentSearchQuery } = useInvestigationStore();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Execute Search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const matches = await searchCases(query);
        setResults(matches as any);
        addRecentSearchQuery(query.trim());
      } catch (e) {
        setResults({ results: [] });
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, addRecentSearchQuery]);

  const handleSelectResult = (item: any) => {
    const store = useInvestigationStore.getState();
    if (item.type === "Case") {
      store.setActiveCase(item.id.replace("CASE-", ""));
    } else {
      if (item.caseId) {
        store.setActiveCase(item.caseId);
      }
      store.setFocusedEntity(item.id, item.name || item.id);
    }
    onClose();
  };

  const appendOperator = (op: string) => {
    setQuery((prev) => {
      // Remove any existing operator from the beginning of the string
      const cleaned = prev.replace(/^(phone|vehicle|case|district|before|after|fir|person|evidence|threat):\s*/i, "").trim();
      
      return cleaned ? `${op} ${cleaned}` : op;
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Person': return <User className="w-4 h-4 text-accent-cyan" />;
      case 'Vehicle': return <Car className="w-4 h-4 text-accent-amber" />;
      case 'Phone': return <Phone className="w-4 h-4 text-accent-green" />;
      case 'Case': return <Briefcase className="w-4 h-4 text-accent-blue" />;
      default: return <Search className="w-4 h-4 text-tactical-500" />;
    }
  };

  if (!isOpen) return null;

  const showOperatorHints = query.includes(":") || query.trim() === "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-tactical-900/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-tactical-800 border border-tactical-600 shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center px-4 py-3 border-b border-tactical-600 bg-tactical-900/50">
          <Search className="w-5 h-5 text-accent-cyan mr-3" />
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-tactical-100 placeholder-tactical-500 font-mono text-sm"
            placeholder="Search intelligence (e.g. phone:9876543210 or Sharma)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="w-4 h-4 text-accent-cyan animate-spin mr-3" />}
          <button onClick={onClose} className="p-1 hover:bg-tactical-700 rounded text-tactical-400 hover:text-tactical-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* Recent searches & Operator hints when query is empty */}
          {!query && (
            <div className="flex flex-col gap-4">
              {navigation.recentSearches && navigation.recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xxs font-mono text-tactical-400 mb-2 uppercase tracking-wider">
                    <History className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {navigation.recentSearches.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(sq)}
                        className="px-2.5 py-1 rounded bg-tactical-900 border border-tactical-700 hover:border-accent-cyan text-xs font-mono text-tactical-200 hover:text-accent-cyan transition-colors"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-xxs font-mono text-tactical-400 mb-2 uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Search Operators</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SEARCH_OPERATORS.map((item) => (
                    <button
                      key={item.operator}
                      onClick={() => appendOperator(item.operator)}
                      className="flex items-center justify-between p-2 rounded bg-tactical-900/60 border border-tactical-700 hover:border-accent-cyan transition-colors text-left"
                    >
                      <span className="font-mono text-xs text-accent-cyan font-bold">{item.operator}</span>
                      <span className="font-mono text-xxs text-tactical-400">{item.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && !loading && results?.results?.length === 0 && (
            <div className="py-12 text-center text-tactical-500 font-mono text-sm">
              No results found for "{query}"
            </div>
          )}

          {results?.results && results.results.length > 0 && (
            <div className="flex flex-col gap-1">
              {results.results.map((res: any, idx: number) => (
                <div
                  key={`${res.id}-${idx}`}
                  onClick={() => handleSelectResult(res)}
                  className="flex flex-col p-3 rounded hover:bg-tactical-700/50 cursor-pointer transition-colors border border-transparent hover:border-tactical-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getIconForType(res.type)}
                      <span className="font-mono text-sm text-tactical-100 font-bold">{res.name}</span>
                    </div>
                    <span className="font-mono text-xxs px-2 py-0.5 rounded bg-tactical-700 text-tactical-400 border border-tactical-600">
                      Score: {res.score?.toFixed(2) || "1.00"}
                    </span>
                  </div>
                  {res.subtitle && (
                    <div className="mt-1.5 ml-7 text-xs font-mono text-accent-cyan/90 line-clamp-1">
                      {res.subtitle}
                    </div>
                  )}
                  {res.aliases && res.aliases.length > 0 && (
                    <div className="mt-1 ml-7 text-xs text-tactical-500">
                      Aliases: {res.aliases.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operator hint bar at bottom when typing */}
        {query && showOperatorHints && (
          <div className="px-4 py-2 border-t border-tactical-700 bg-tactical-900/80 flex items-center gap-3 overflow-x-auto">
            <span className="text-xxs font-mono text-tactical-500 shrink-0">Operators:</span>
            {SEARCH_OPERATORS.map((item) => (
              <button
                key={item.operator}
                onClick={() => appendOperator(item.operator)}
                className="text-xxs font-mono text-accent-cyan hover:underline shrink-0"
              >
                {item.operator}
              </button>
            ))}
          </div>
        )}

        <div className="px-4 py-2 border-t border-tactical-600 bg-tactical-900 flex justify-between items-center text-xxs font-mono text-tactical-500">
          <span>Command Palette • Federated Intelligence Search</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}

