import React, { useState } from "react";
import { Search, Globe, ExternalLink, Sparkles, BookOpen, X, RefreshCw, Copy, Check } from "lucide-react";
import { playCuteChime } from "../utils/sound";

interface SearchGroundingModalProps {
  onClose: () => void;
  onInsertToNotes?: (content: string) => void;
}

export const SearchGroundingModal: React.FC<SearchGroundingModalProps> = ({
  onClose,
  onInsertToNotes,
}) => {
  const [query, setQuery] = useState("");
  const [characterContext, setCharacterContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ uri?: string; title?: string }>>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTopics = [
    "Victorian noble titles & secret fan courtship signals",
    "Mythology of the siren song and ocean pearls",
    "Joseon dynasty royal palace etiquette and attire colors",
    "Celestial constellations and moon phase symbolism in poetry",
    "Psychology of the quiet tsundere slow burn romance",
  ];

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery || query).trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSources([]);
    setSearchQueries([]);

    try {
      const response = await fetch("/api/search-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          characterContext: characterContext.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Search grounding failed.");
      }

      setResult(data.result);
      if (data.groundingMetadata) {
        if (Array.isArray(data.groundingMetadata.webSearchQueries)) {
          setSearchQueries(data.groundingMetadata.webSearchQueries);
        }
        if (Array.isArray(data.groundingMetadata.groundingChunks)) {
          const links = data.groundingMetadata.groundingChunks
            .map((chunk: any) => chunk.web)
            .filter((w: any) => w && w.uri);
          setSources(links);
        }
      }
      playCuteChime("sparkle");
    } catch (err: any) {
      setError(err.message || "Failed to search Google data.");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fffef7] w-full max-w-2xl max-h-[92vh] rounded-[28px] border border-[#f0c8cf] shadow-[0_20px_50px_#bd879038] flex flex-col overflow-hidden text-xs text-[#8d606f]">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-[#fff6e6] border-b border-[#f3d7da] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#b6d6c7] text-[#527f72] flex items-center justify-center text-lg shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#a9657a] m-0 flex items-center gap-1.5">
                <span>Lore & Worldbuilding Grounding</span>
                <Globe className="w-3.5 h-3.5 text-[#527f72]" />
              </h3>
              <p className="text-[11px] text-[#977180] m-0">
                Real-time Google Search data with gemini-3.8-flash for authentic story details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-bubble-close
            aria-label="Close"
            title="Close"
            className="p-1.5 rounded-xl text-[#b7778c] hover:bg-[#fce4e9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input section */}
        <div className="p-5 border-b border-[#f3dedf] bg-[#fffcf5] space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#b57889] mb-1">
              Search Topic, History, Folklore or Setting:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="e.g. Victorian masquerade ball etiquette, celestial folklore..."
                className="flex-1 px-3 py-2 bg-white border border-[#ead0c8] rounded-xl text-xs outline-none focus:border-[#d48d95]"
              />
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-[#e8a3b5] hover:bg-[#d48d95] disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Ground</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#aa8790] block mb-1">
              Inspiration Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(topic);
                    handleSearch(topic);
                  }}
                  className="px-2.5 py-1 bg-[#fff6e6] hover:bg-[#fce4e9] border border-[#ecd0d6] rounded-full text-[10px] text-[#977180] cursor-pointer transition-colors"
                >
                  ✦ {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result view */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-[#fff0f3] border border-[#f7ccd5] rounded-xl text-[#b6536b]">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-10 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#d48d95] mx-auto" />
              <div className="font-serif italic text-sm text-[#c47b91]">
                Querying Google Search and synthesizing lore details... ♡
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-fadeIn">
              {searchQueries.length > 0 && (
                <div className="p-2.5 bg-[#f6faee] rounded-xl border border-[#d9ebd0] text-[11px] text-[#527f72] flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Grounded search queries: <strong>{searchQueries.join(", ")}</strong>
                  </span>
                </div>
              )}

              <div className="p-4 bg-[#fff9ea] rounded-2xl border border-[#eed4d8] leading-relaxed whitespace-pre-wrap text-[#795662] shadow-2xs">
                {result}
              </div>

              {sources.length > 0 && (
                <div className="p-3 bg-[#fdf5f7] rounded-xl border border-[#f1d8de] space-y-1.5">
                  <div className="font-bold text-[10px] text-[#b57889] flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-[#d48d95]" /> Grounded Web Sources & References:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sources.slice(0, 5).map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white border border-[#ead0c8] rounded-lg text-[10px] text-[#b56f86] hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-2.5 h-2.5" /> {src.title || src.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={copyResult}
                  className="px-3.5 py-1.5 bg-[#e8a3b5] hover:bg-[#d48d95] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Lore Notes"}</span>
                </button>

                {onInsertToNotes && (
                  <button
                    type="button"
                    onClick={() => {
                      onInsertToNotes(result);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-[#b6d6c7] hover:bg-[#a2c3b1] text-[#527f72] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Insert into Plot
                  </button>
                )}
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center py-12 border border-dashed border-[#e8c6ce] rounded-2xl text-[#b58b97] space-y-1">
              <Globe className="w-8 h-8 mx-auto opacity-30 text-[#d48d95]" />
              <p className="m-0 font-serif">Enter a research topic to pull up-to-date facts and lore.</p>
              <p className="text-[10px] text-[#bda0a8] m-0">Grounding provided by Google Search tool</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
