import React, { useState } from "react";
import { Character } from "../types";
import { X, Wand2, Image as ImageIcon, Sliders, Sparkles, Check, Download, RefreshCw, Upload } from "lucide-react";
import { playCuteChime } from "../utils/sound";

interface PortraitStudioModalProps {
  character?: Character | null;
  onClose: () => void;
  onApplyAvatar: (imageUrl: string) => void;
}

export const PortraitStudioModal: React.FC<PortraitStudioModalProps> = ({
  character,
  onClose,
  onApplyAvatar,
}) => {
  const [mode, setMode] = useState<"generate" | "edit">("generate");
  const [prompt, setPrompt] = useState(
    character
      ? `A delicate pastel anime watercolor portrait of ${character.name}, ${character.tags.join(
          ", "
        )}, dreamy soft lighting, subtle pink and mint stardust accents, romantic atmosphere.`
      : "A delicate pastel anime watercolor character portrait, soft pink blush, stardust in hair, elegant gaze, dreamy gentle lighting."
  );

  // High quality affordances: 1K, 2K, 4K
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  // Aspect ratios: 1:1, 3:4, 4:3, 9:16, 16:9
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  // Model affordances
  const [modelChoice, setModelChoice] = useState<string>("gemini-nano-banana-2.1");

  // Edit mode state
  const [sourceImage, setSourceImage] = useState<string>(character?.avatarUrl || "");
  const [editPrompt, setEditPrompt] = useState("Add a delicate flower crown of pink roses and soft glowing starlight particles.");

  // Output
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const stylePresets = [
    { label: "Pink Pearl Watercolor", value: "delicate pastel anime watercolor, soft pink aesthetic, subtle stardust, gentle emotion" },
    { label: "Victorian Romance", value: "Victorian light novel illustration, ornate lace attire, romantic brooding atmosphere, soft warm shadows" },
    { label: "Celestial Dream", value: "ethereal celestial concept art, glowing constellation hair, mint and gold pastel tones, luminous" },
    { label: "Modern Lofi", value: "cozy modern lofi aesthetic, oversized knit cardigan, warm coffee shop backlight, soft film grain" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);
    setApplied(false);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size: imageSize,
          aspectRatio,
          modelChoice,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      setGeneratedImage(data.imageUrl);
      playCuteChime("sparkle");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not generate portrait. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !editPrompt.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);
    setApplied(false);

    try {
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editPrompt.trim(),
          imageBase64: sourceImage,
          modelChoice,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to edit image.");
      }

      setGeneratedImage(data.imageUrl);
      playCuteChime("sparkle");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not edit portrait. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (!generatedImage) return;
    onApplyAvatar(generatedImage);
    setApplied(true);
    playCuteChime("save");
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fffef7] w-full max-w-3xl max-h-[92vh] rounded-[28px] border border-[#f0c8cf] shadow-[0_20px_50px_#bd879038] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-[#fff6e6] border-b border-[#f3d7da] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f6b6c5] text-white flex items-center justify-center text-lg shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#a9657a] m-0 flex items-center gap-1.5">
                <span>Character Portrait Atelier</span>
                <span className="text-sm text-[#d48d95]">♥</span>
              </h3>
              <p className="text-[11px] text-[#977180] m-0">
                High-quality visual generation & editing for character cards
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

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 bg-[#fff9ea] border-b border-[#f3d9dc] flex gap-2">
          <button
            onClick={() => setMode("generate")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 ${
              mode === "generate"
                ? "bg-[#fffef7] text-[#a9657a] border-[#f0c8cf] -mb-px shadow-2xs"
                : "bg-transparent text-[#977180] border-transparent hover:text-[#a9657a]"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-[#d48d95]" />
            <span>Generate New Image (gemini-nano-banana-2.1)</span>
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 ${
              mode === "edit"
                ? "bg-[#fffef7] text-[#a9657a] border-[#f0c8cf] -mb-px shadow-2xs"
                : "bg-transparent text-[#977180] border-transparent hover:text-[#a9657a]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#527f72]" />
            <span>Edit Existing Image with Prompt</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-[#8d606f]">
          {errorMsg && (
            <div className="p-3 bg-[#fff0f3] border border-[#f7ccd5] rounded-xl text-[#b6536b] text-xs">
              {errorMsg}
            </div>
          )}

          {mode === "generate" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#b57889] mb-1.5">
                  Art Style Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {stylePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt((p) => `${p}, ${preset.value}`)}
                      className="px-2.5 py-1 rounded-full bg-[#fff6e6] border border-[#ebd0d6] text-[10px] text-[#977180] hover:bg-[#fbe0e5] hover:text-[#b66d85] cursor-pointer transition-colors"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#b57889] mb-1.5">
                  Portrait Prompt *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-white border border-[#ead0c8] rounded-xl text-xs outline-none focus:border-[#d48d95] leading-relaxed"
                  placeholder="Describe your character's visual features, clothing, expression, background..."
                />
              </div>

              {/* Controls Grid: Resolution, Aspect Ratio, Model */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#fff8eb] rounded-2xl border border-[#eed7db]">
                {/* Image Size Affordance (1K, 2K, 4K) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                    Image Resolution (Size):
                  </label>
                  <div className="flex gap-1.5">
                    {(["1K", "2K", "4K"] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setImageSize(sz)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          imageSize === sz
                            ? "bg-[#e8a3b5] text-white border-[#d48d95] shadow-xs"
                            : "bg-white text-[#977180] border-[#ead0c8] hover:bg-[#fff0f4]"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                    Aspect Ratio:
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#ead0c8] rounded-lg text-xs outline-none focus:border-[#d48d95]"
                  >
                    <option value="1:1">1:1 (Square Avatar)</option>
                    <option value="3:4">3:4 (Portrait Card)</option>
                    <option value="4:3">4:3 (Classic Landscape)</option>
                    <option value="9:16">9:16 (Story / Phone)</option>
                    <option value="16:9">16:9 (Cinematic Banner)</option>
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                    Model:
                  </label>
                  <select
                    value={modelChoice}
                    onChange={(e) => setModelChoice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#ead0c8] rounded-lg text-xs outline-none focus:border-[#d48d95]"
                  >
                    <option value="gemini-nano-banana-2.1">gemini-nano-banana-2.1 (HQ)</option>
                    <option value="gemini-3-pro-image">gemini-3-pro-image (High Res)</option>
                    <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Fast)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-3 bg-[#e8a3b5] hover:bg-[#d48d95] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Painting in {imageSize} resolution... ♡</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Character Portrait ({imageSize})</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#b57889] mb-1.5">
                    Original Image Source:
                  </label>
                  <div className="p-3 bg-[#fff8eb] border border-dashed border-[#e6c4cb] rounded-2xl flex flex-col items-center justify-center gap-2 min-h-[160px]">
                    {sourceImage ? (
                      <div className="relative group">
                        <img
                          src={sourceImage}
                          alt="Source"
                          className="max-h-36 rounded-xl object-contain border border-[#edc5cb]"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-[#ab828e] text-xs">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                        Chưa có ảnh gốc. Tải ảnh từ máy lên nha.
                      </div>
                    )}
                    <label className="mt-1 px-3 py-1.5 bg-white border border-[#ead0c8] rounded-xl text-[11px] text-[#977180] hover:bg-[#fbe0e5] cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Chọn ảnh...
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#b57889]">
                    Edit Instructions *
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    rows={4}
                    className="w-full p-2.5 bg-white border border-[#ead0c8] rounded-xl text-xs outline-none focus:border-[#d48d95]"
                    placeholder="E.g.: Add a glowing floral circlet, change the background to a starry night castle garden, give them a warm smile..."
                  />
                  <div className="text-[10px] text-[#aa8790]">
                    gemini-nano-banana-2.1 understands both your source image and text prompt to make delicate aesthetic adjustments.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEdit}
                disabled={loading || !sourceImage || !editPrompt.trim()}
                className="w-full py-3 bg-[#e8a3b5] hover:bg-[#d48d95] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Applying aesthetic edits... ♡</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Apply Edits to Image</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Preview Section */}
          {generatedImage && (
            <div className="mt-5 p-4 bg-[#fbf5ee] border border-[#f0c8cf] rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
              <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white shrink-0">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="font-serif font-bold text-sm text-[#bc7c8c] flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#d48d95]" /> Artwork Created Successfully!
                </div>
                <p className="text-[11px] text-[#977180] m-0">
                  You can set this portrait directly on {character ? `"${character.name}"` : "the character card"} or download it to your device.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-3.5 py-1.5 bg-[#a2c3b1] hover:bg-[#8eb39f] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    {applied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Applied to Card!
                      </>
                    ) : (
                      <>
                        <span>♡</span> Set as Character Avatar
                      </>
                    )}
                  </button>

                  <a
                    href={generatedImage}
                    download={`${character?.name || "character"}-portrait.png`}
                    className="px-3 py-1.5 bg-white border border-[#edd1d6] text-[#977180] hover:bg-[#fff0f4] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
