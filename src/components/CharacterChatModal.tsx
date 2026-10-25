import React, { useState, useEffect, useRef } from "react";
import { Character, ChatMessage } from "../types";
import { X, Send, Sparkles, RefreshCw, Copy, Check, MessageSquare } from "lucide-react";
import { playCuteChime } from "../utils/sound";

interface CharacterChatModalProps {
  character: Character | null;
  onClose: () => void;
}

export const CharacterChatModal: React.FC<CharacterChatModalProps> = ({ character, onClose }) => {
  const isAuthor = !character || character.id === "author";
  const charName = character?.name || "siasiailu (Pink Pearl)";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.8-flash");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize system prompt and greeting
  useEffect(() => {
    let initialSystem = "";
    let initialGreeting = "";

    if (isAuthor) {
      initialSystem = `You are "siasiailu" (creator of Pink Pearl Archive), a warm, poetic, creative, and gentle light novel author and character creator. You speak in a sweet, supportive tone (incorporating sweet phrases like "bạn ơi", "mình nè", or gentle emojis like 🌸, ✨). You love talking about characters, tropes like slow-burn and angst, giving writing advice, and helping brainstorm plots.`;
      initialGreeting = `Xin chào bạn nha! Mình là siasiailu nè. Bạn đang muốn tìm hiểu về character nào hay muốn chúng mình cùng ấp ủ một cốt truyện mới thế? ✨`;
    } else {
      initialSystem = `You are ${character.name}, a character in an immersive roleplay universe.
Tags / Personality: ${character.tags.join(", ")}
Character Background & Bio: ${character.description}
${character.plot ? `Story Plot Lore: ${character.plot}` : ""}
${character.systemPrompt ? `Specific Character Instructions: ${character.systemPrompt}` : ""}

Roleplay Guidelines:
1. Stay deeply in character at all times.
2. Embody your distinct speech pattern, vocabulary, and personality.
3. Use gentle asterisks for actions or physical mannerisms (e.g., *tilts head slightly, eyes softening under the moonlight*).
4. Provide engaging, evocative dialogue that encourages the user to continue the scene.`;

      initialGreeting =
        character.greeting ||
        (character.description
          ? `*The quiet atmosphere shifts as ${character.name} looks over at you thoughtfully.* "${character.description.slice(0, 80)}... You shouldn't be wandering around this place alone."`
          : `*Looking up quietly as you approach.* "...Are you looking for someone?"`);
    }

    setSystemPrompt(initialSystem);

    // Initial greeting message
    setMessages([
      {
        id: "greet-0",
        role: "assistant",
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [character, isAuthor]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    playCuteChime("pop");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction: systemPrompt,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get character response");
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || "...",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      playCuteChime("sparkle");
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `(Hệ thống: ${err.message || "Không thể kết nối được tới nhân vật lúc này. Vui lòng thử lại nha ♡"})`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const quickStarters = isAuthor
    ? [
        "Giới thiệu cho mình một character có vibe slow-burn nhé ♡",
        "Làm sao để viết một nhân vật vừa lạnh lùng vừa dịu dàng?",
        "Tạo một cốt truyện kỳ ảo dưới trăng giúp mình đi!",
      ]
    : [
        `*Bước tới gần và chào nhẹ nhàng.* "Xin chào, cậu đang nghĩ gì thế?"`,
        `"Bí mật lớn nhất mà cậu đang giấu là gì?"`,
        `*Đưa cho cậu một tách trà ấm.* "Trời hôm nay lạnh thật đấy."`,
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fffef7] w-full max-w-2xl h-[90vh] max-h-[720px] rounded-[28px] border border-[#f0c8cf] shadow-[0_20px_50px_#bd879038] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-[#fff6e6] border-b border-[#f3d7da] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#f6b6c5] via-[#fff2b4] to-[#b6d6c7] border-2 border-white shadow-sm flex items-center justify-center text-xl shrink-0">
              {character?.avatarUrl ? (
                <img src={character.avatarUrl} alt={charName} className="w-full h-full object-cover" />
              ) : isAuthor ? (
                "🌸"
              ) : (
                <Sparkles className="w-5 h-5 text-[#a9657a]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#a9657a] m-0">{charName}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fce4e9] text-[#b56f86] font-medium border border-[#f2c7ce]">
                  Interactive Roleplay
                </span>
              </div>
              <p className="text-[11px] text-[#977180] m-0 truncate max-w-[280px] sm:max-w-md">
                {character?.tags?.join(" · ") || "Author Companion & Storyteller"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-[#fffaf0] border border-[#ecd2d7] text-[#a56f7d] hover:bg-[#fff0f4] transition-colors cursor-pointer"
              title="View / Customize Roleplay Instruction"
            >
              Role System ⚙
            </button>
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
        </div>

        {/* Collapsible System Prompt Configuration */}
        {showSystemPrompt && (
          <div className="p-3 bg-[#fff9ea] border-b border-[#f3d9dc] text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#b57889] text-[11px]">
                System Instruction & Roleplay Persona:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#a27b83]">Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-[11px] bg-white border border-[#e8c7cd] rounded-lg px-2 py-0.5 text-[#8d606f]"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Expressive RP)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
                  <option value="gemini-4-argon">gemini-4-argon (Complex Deep Lore)</option>
                </select>
              </div>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full p-2 bg-white border border-[#edd1d6] rounded-xl text-[11px] text-[#785b67] outline-none focus:border-[#d48d95]"
            />
          </div>
        )}

        {/* Messages Thread */}
        <div ref={scrollRef} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-[#fffdfa]">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} group`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#fbe0e5] border border-white text-xs flex items-center justify-center text-[#d48d95] shrink-0 mt-0.5 shadow-sm">
                    {isAuthor ? "🌸" : "✧"}
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 sm:px-4 sm:py-3 text-xs leading-relaxed relative ${
                    isUser
                      ? "bg-[#e8a3b5] text-white rounded-br-xs shadow-[0_3px_10px_#e8a3b538]"
                      : "bg-[#fff6e6] text-[#795662] border border-[#f0d4d8] rounded-bl-xs shadow-sm"
                  }`}
                >
                  {/* Text content with styled dialogue / actions */}
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>

                  <div
                    className={`flex items-center justify-between gap-3 text-[9px] mt-1.5 pt-1 border-t ${
                      isUser
                        ? "border-white/20 text-white/80"
                        : "border-[#f1dadc] text-[#ab828e]"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      className="opacity-60 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2 items-center text-xs text-[#b7778c] italic bg-[#fff8eb] p-2.5 rounded-xl border border-[#eed4d8] w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d48d95]" />
              <span>{charName} is thinking & writing... ♡</span>
            </div>
          )}
        </div>

        {/* Quick Conversation Starters */}
        <div className="px-4 py-2 bg-[#fffaf2] border-t border-[#f5dedf] flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-[10px] font-bold text-[#b57889] shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#d48d95]" /> Starters:
          </span>
          {quickStarters.map((starter, i) => (
            <button
              key={i}
              onClick={() => handleSend(starter)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#ebd2d7] text-[#977180] hover:bg-[#fff0f4] hover:text-[#b66d85] whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#fff6e6] border-t border-[#f3d7da] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Say something or act with asterisks (*smiles*)...`}
            className="flex-1 px-4 py-2.5 bg-white border border-[#ebd0d5] rounded-2xl text-xs text-[#795e6c] outline-none focus:border-[#d48d95] focus:ring-2 focus:ring-[#f6b6c533]"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-[#e8a3b5] hover:bg-[#d48d95] disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
