import React, { useState } from "react";
import { Character } from "../types";
import { Sparkles, Wand2, Feather, BookOpen, MessageSquare, Compass, X, RefreshCw, Copy, Check, ArrowRight } from "lucide-react";
import { playCuteChime } from "../utils/sound";

interface IntelligenceStudioModalProps {
  character: Character;
  onClose: () => void;
  onUpdateCharacter: (updated: Partial<Character>) => void;
}

export const IntelligenceStudioModal: React.FC<IntelligenceStudioModalProps> = ({
  character,
  onClose,
  onUpdateCharacter,
}) => {
  const [taskType, setTaskType] = useState<"generate_plot" | "polish_bio" | "roleplay_prompt" | "analyze_character">("generate_plot");
  const [tone, setTone] = useState("Slow-burn romance with gentle angst and stardust mystery");
  const [model, setModel] = useState("gemini-3.8-flash");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleRunTask = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setApplied(false);

    try {
      const response = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType,
          name: character.name,
          tags: character.tags,
          description: character.description,
          plot: character.plot || "",
          tone,
          model,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process intelligence request.");
      }

      setResult(data.result);
      playCuteChime("sparkle");
    } catch (err: any) {
      setError(err.message || "Failed to process task. Please try again.");
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

  const applyToCharacter = () => {
    if (!result) return;
    if (taskType === "generate_plot") {
      onUpdateCharacter({ plot: result });
    } else if (taskType === "polish_bio") {
      onUpdateCharacter({ description: result });
    } else if (taskType === "roleplay_prompt") {
      onUpdateCharacter({ systemPrompt: result });
    }
    setApplied(true);
    playCuteChime("save");
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-sm animate-fadeIn text-xs text-[#8d606f]">
      <div className="bg-[#fffef7] w-full max-w-3xl max-h-[92vh] rounded-[28px] border border-[#f0c8cf] shadow-[0_20px_50px_#bd879038] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-[#fff6e6] border-b border-[#f3d7da] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f6b6c5] text-white flex items-center justify-center text-lg shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#a9657a] m-0 flex items-center gap-1.5">
                <span>Gemini Intelligence Atelier: {character.name}</span>
                <span className="text-sm text-[#d48d95]">♥</span>
              </h3>
              <p className="text-[11px] text-[#977180] m-0">
                Story arc outlines, poetic bio polishing, roleplay prompts & trope analysis
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

        {/* Task selector bar */}
        <div className="p-3 bg-[#fff9ea] border-b border-[#f3d9dc] flex flex-wrap gap-2">
          <button
            onClick={() => {
              setTaskType("generate_plot");
              setModel("gemini-4-argon");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              taskType === "generate_plot"
                ? "bg-[#e8a3b5] text-white shadow-xs"
                : "bg-white text-[#977180] border border-[#ecd0d6] hover:bg-[#fff0f4]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Story & Plot Generator
          </button>

          <button
            onClick={() => {
              setTaskType("polish_bio");
              setModel("gemini-3.8-flash");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              taskType === "polish_bio"
                ? "bg-[#e8a3b5] text-white shadow-xs"
                : "bg-white text-[#977180] border border-[#ecd0d6] hover:bg-[#fff0f4]"
            }`}
          >
            <Feather className="w-3.5 h-3.5" /> Polish Bio & Voice
          </button>

          <button
            onClick={() => {
              setTaskType("roleplay_prompt");
              setModel("gemini-3.8-flash");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              taskType === "roleplay_prompt"
                ? "bg-[#e8a3b5] text-white shadow-xs"
                : "bg-white text-[#977180] border border-[#ecd0d6] hover:bg-[#fff0f4]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Roleplay Greeting & System
          </button>

          <button
            onClick={() => {
              setTaskType("analyze_character");
              setModel("gemini-3.1-flash-lite");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              taskType === "analyze_character"
                ? "bg-[#e8a3b5] text-white shadow-xs"
                : "bg-white text-[#977180] border border-[#ecd0d6] hover:bg-[#fff0f4]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Trope & Chemistry Breakdown
          </button>
        </div>

        {/* Configuration settings */}
        <div className="p-4 bg-[#fffcf5] border-b border-[#f3d7da] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#b57889] mb-1">
              Atmosphere / Tone:
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-[#ead0c8] rounded-xl text-xs outline-none focus:border-[#d48d95]"
              placeholder="e.g. Poetic melancholy, playful slow-burn, cold regal angst..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#b57889] mb-1">
              Gemini Model:
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#ead0c8] rounded-xl text-xs outline-none focus:border-[#d48d95]"
            >
              <option value="gemini-4-argon">gemini-4-argon (Deep Literary Reasoning)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (General Creative Writing)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Instant Generation)</option>
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <button
            onClick={handleRunTask}
            disabled={loading}
            className="w-full py-2.5 bg-[#e8a3b5] hover:bg-[#d48d95] disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting with {model}... ♡</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Run {taskType.replace("_", " ").toUpperCase()}</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-[#fff0f3] border border-[#f7ccd5] rounded-xl text-[#b6536b]">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-[#fff9ea] rounded-2xl border border-[#eed4d8] leading-relaxed whitespace-pre-wrap text-[#795662] shadow-2xs font-sans">
                {result}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  className="px-3.5 py-1.5 bg-white border border-[#ead0c8] text-[#977180] hover:bg-[#fff0f4] rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Output"}</span>
                </button>

                {taskType !== "analyze_character" && (
                  <button
                    type="button"
                    onClick={applyToCharacter}
                    className="px-3.5 py-1.5 bg-[#a2c3b1] hover:bg-[#8eb39f] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {applied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Applied to {character.name}!
                      </>
                    ) : (
                      <>
                        <span>♡</span> Apply directly to {character.name}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
