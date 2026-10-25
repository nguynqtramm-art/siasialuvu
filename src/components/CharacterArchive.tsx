import React, { useState } from "react";
import { Character } from "../types";
import { Search, Plus, Sparkles, Filter, Trash2, Wand2, X, RefreshCw } from "lucide-react";
import { playCuteChime } from "../utils/sound";

interface CharacterArchiveProps {
  characters: Character[];
  onSaveCharacter: (character: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onClearAllCharacters?: () => void;
  onLoadDemoCharacters?: () => void;
  onClose: () => void;
  onOpenChat: (character: Character) => void;
  onOpenPortraitStudio: (character: Character) => void;
  onOpenIntelligenceStudio: (character: Character) => void;
  onShowToast: (message: string) => void;
}

export const CharacterArchive: React.FC<CharacterArchiveProps> = ({
  characters,
  onSaveCharacter,
  onDeleteCharacter,
  onClearAllCharacters,
  onLoadDemoCharacters,
  onClose,
  onOpenChat,
  onOpenPortraitStudio,
  onOpenIntelligenceStudio,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // In-app deletion dialog states (no window.confirm!)
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [plot, setPlot] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Extract all unique tags
  const allTags = ["All", ...Array.from(new Set(characters.flatMap((c) => c.tags).filter(Boolean)))];

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setTagsInput("");
    setDescription("");
    setLink("");
    setPlot("");
    setAvatarUrl("");
    setShowAddForm(false);
  };

  const handleEdit = (character: Character) => {
    setEditingId(character.id);
    setName(character.name || "");
    setTagsInput(Array.isArray(character.tags) ? character.tags.join(", ") : "");
    setDescription(character.description || "");
    setLink(character.link || "");
    setPlot(character.plot || "");
    setAvatarUrl(character.avatarUrl || "");
    setShowAddForm(true);

    const formEl = document.getElementById("addFormSection");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanLink = link.trim();
    const cleanPlot = plot.trim();

    if (!cleanName) {
      onShowToast("Bà nhập tên character nha!");
      return;
    }
    if (!cleanLink) {
      onShowToast("Link character phải là URL hợp lệ nha!");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    const newChar: Character = {
      id: editingId || `char-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      name: cleanName,
      tags: tags.length > 0 ? tags : ["General"],
      description: description.trim(),
      link: cleanLink,
      plot: cleanPlot || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveCharacter(newChar);
    playCuteChime("save");
    onShowToast(editingId ? "Đã cập nhật character ♡" : "Đã thêm character mới ♡");
    resetForm();
  };

  // Safe in-app delete execution
  const executeDelete = () => {
    if (!characterToDelete) return;
    const deletedName = characterToDelete.name;
    onDeleteCharacter(characterToDelete.id);
    playCuteChime("pop");
    onShowToast(`Đã xóa character "${deletedName}".`);
    setCharacterToDelete(null);
  };

  // Safe in-app clear all execution
  const executeClearAll = () => {
    if (onClearAllCharacters) {
      onClearAllCharacters();
      playCuteChime("pop");
      onShowToast("Đã xóa toàn bộ nhân vật hiện có.");
    }
    setShowClearAllConfirm(false);
  };

  const filteredCharacters = characters.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === "All" || c.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <section className="mt-5 p-4 sm:p-7 bg-[#fffdf1ed] border border-[#edc8cb] rounded-[24px] shadow-[0_12px_35px_#b989901a] backdrop-blur-[12px] animate-fadeIn relative">
      {/* Panel Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-serif text-[#c47b91] text-2xl sm:text-[26px] m-0 flex items-center gap-2">
            <span>Character Archive</span>
            <Sparkles className="w-5 h-5 text-[#d48d95]" />
          </h2>
          <p className="text-xs leading-relaxed text-[#a27b83] mt-2 mb-0">
            Every character has a story waiting to be discovered. Explore, chat, edit or manage your collection.
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-[#fff7e8] text-[#b7778c] border border-[#edc6cb] px-3 py-2 rounded-xl text-xs hover:bg-[#fff0f4] transition-colors cursor-pointer whitespace-nowrap"
        >
          ← Back
        </button>
      </div>

      {/* Archive Search & Add / Delete Toolbar */}
      <div className="flex flex-wrap gap-2.5 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ab828e]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search character, tag, description..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#ead0c8] bg-[#fffef7] text-xs text-[#795e6c] outline-none focus:border-[#d48d95] focus:ring-2 focus:ring-[#f6b6c533]"
          />
        </div>

        <button
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#fffdf7] border border-[#e9a4b6] bg-[#e8a3b5] hover:bg-[#d48d95] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? "Close Form" : "Add Character"}</span>
        </button>

        {characters.length > 0 && onClearAllCharacters && (
          <button
            type="button"
            onClick={() => setShowClearAllConfirm(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#b55866] border border-[#f0c8cf] bg-[#fff6e6] hover:bg-[#feecee] hover:border-[#e58a98] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Delete all existing characters in the archive"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#b55866]" />
            <span>Delete Existing Characters</span>
          </button>
        )}
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 text-[11px] scrollbar-none">
          <Filter className="w-3 h-3 text-[#aa8790] shrink-0" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedTag === tag
                  ? "bg-[#e8a3b5] text-white font-bold shadow-2xs"
                  : "bg-[#fff6e6] text-[#977180] border border-[#ebd0d6] hover:bg-[#fbe0e5]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Add / Edit Character Form */}
      {showAddForm && (
        <form
          id="addFormSection"
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 mb-5 bg-[#fff8e8] border border-[#f0d3d0] rounded-2xl animate-fadeIn space-y-3.5 text-xs text-[#8d606f]"
        >
          <div className="font-serif font-bold text-sm text-[#bc7c8c] flex items-center justify-between pb-2 border-b border-[#f2d8cf]">
            <span>{editingId ? "Edit Character ✧" : "Add New Character ♡"}</span>
            <button
              type="button"
              onClick={resetForm}
              className="text-[#aa8790] hover:text-[#d48d95] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                Character Name *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên nhân vật..."
                className="w-full px-3 py-2 rounded-xl border border-[#ead0c8] bg-[#fffef7] text-xs outline-none focus:border-[#d48d95]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                Tags / Category (comma separated)
              </label>
              <input
                type="text"
                maxLength={150}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Fantasy, Romance, Angst, Slow Burn..."
                className="w-full px-3 py-2 rounded-xl border border-[#ead0c8] bg-[#fffef7] text-xs outline-none focus:border-[#d48d95]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                Short Description / Bio *
              </label>
              <textarea
                required
                rows={3}
                maxLength={600}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuổi, tính cách, bối cảnh hoặc mô tả ngắn..."
                className="w-full px-3 py-2 rounded-xl border border-[#ead0c8] bg-[#fffef7] text-xs outline-none focus:border-[#d48d95] resize-y"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                LINK — Character Chat URL *
              </label>
              <input
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-[#ead0c8] bg-[#fffef7] text-xs outline-none focus:border-[#d48d95]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                PLOT — Google Docs / Story URL (optional)
              </label>
              <input
                type="url"
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
                placeholder="https://docs.google.com/document/..."
                className="w-full px-3 py-2 rounded-xl border border-[#ead0c8] bg-[#fffef7] text-xs outline-none focus:border-[#d48d95]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#b57889] mb-1">
                Character Portrait Avatar URL (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://... or generate with AI in Atelier"
                  className="flex-1 px-3 py-2 rounded-xl border border-[#ead0c8] bg-[#fffef7] text-xs outline-none focus:border-[#d48d95]"
                />
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-xl object-cover border border-[#edc5cb]"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#e8a3b5] hover:bg-[#d48d95] text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              ♡ Save Character
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-2 bg-[#fff8e8] border border-[#ead0c8] text-[#9b7180] hover:bg-[#fff0f4] rounded-xl font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <p className="text-[10px] text-[#aa8790] m-0 pt-1">
            LINK là trang chat nhân vật. PLOT là tài liệu chứa cốt truyện. Hãy kiểm tra quyền truy cập của Google Docs nếu muốn người khác đọc được nha!
          </p>
        </form>
      )}

      {/* Character Strips List */}
      <div className="grid gap-3.5">
        {characters.length === 0 ? (
          /* Empty State when all characters are deleted */
          <div className="text-center py-10 px-5 border border-dashed border-[#e7b9c4] rounded-2xl bg-[#fffcf5] text-xs leading-relaxed space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#fbe0e5] text-[#d48d95] grid place-items-center text-xl shadow-xs">
              ♥
            </div>
            <div className="text-base text-[#a9657a] font-bold">
              No Characters Yet ♥
            </div>
            <p className="text-[#977180] max-w-md mx-auto m-0 leading-normal">
              Tất cả nhân vật có sẵn đã được xóa sạch. Bà có thể bắt đầu tạo nhân vật mới của riêng mình hoặc tải lại các nhân vật mẫu bất cứ lúc nào!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#e8a3b5] hover:bg-[#d48d95] text-white rounded-xl font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Character</span>
              </button>
              {onLoadDemoCharacters && (
                <button
                  type="button"
                  onClick={() => {
                    onLoadDemoCharacters();
                    onShowToast("Đã tải lại 3 nhân vật mẫu ♡");
                  }}
                  className="px-3.5 py-2 bg-[#fff8e8] border border-[#ead0c8] text-[#977180] hover:bg-[#fff0f4] rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#d48d95]" />
                  <span>Tải lại nhân vật mẫu (Demo)</span>
                </button>
              )}
            </div>
          </div>
        ) : filteredCharacters.length === 0 ? (
          /* Search filtering yielded no results */
          <div className="text-center py-10 px-4 border border-dashed border-[#e7b9c4] rounded-2xl text-[#ae8290] text-xs leading-loose">
            Chưa tìm thấy character nào khớp với từ khóa "{searchQuery}" ♡ Hãy thử từ khóa khác nha.
          </div>
        ) : (
          filteredCharacters.map((character, index) => {
            const gradientClass = `character-strip-${index % 4}`;

            return (
              <article
                key={character.id}
                className={`relative min-h-[145px] p-4 sm:p-5 sm:pb-14 border border-white/80 rounded-[20px] overflow-hidden shadow-[0_7px_18px_#b8899015] hover:shadow-[0_10px_24px_#b8899026] transition-all duration-200 ${gradientClass}`}
              >
                {/* Decorative stars in top right */}
                <div
                  className="absolute top-2.5 right-3 text-white/70 pointer-events-none select-none flex items-center gap-1"
                  aria-hidden="true"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-xs">♥</span>
                  <Sparkles className="w-3 h-3 text-white/70" />
                </div>

                <div className="relative z-1 max-w-full flex items-start gap-3.5">
                  {/* Avatar if exists */}
                  {character.avatarUrl && (
                    <img
                      src={character.avatarUrl}
                      alt={character.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/90 shadow-xs shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-[#a9657a] text-lg sm:text-[21px] font-bold leading-tight m-0 mb-1.5 break-words">
                      {character.name}
                    </h3>

                    <div className="flex gap-1.5 flex-wrap mb-2">
                      {character.tags.map((tagText, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] tracking-wide rounded-full px-2 py-0.5 bg-[#fffaf0b8] text-[#a56f7d] font-medium border border-white/60 shadow-2xs"
                        >
                          {tagText}
                        </span>
                      ))}
                    </div>

                    <p className="m-0 text-[#86636c] text-xs leading-relaxed max-w-[620px] break-words line-clamp-3">
                      {character.description || "Chưa có mô tả cho nhân vật này."}
                    </p>
                  </div>
                </div>

                {/* Primary Resource Links (Bottom Right) */}
                <div className="mt-4 sm:mt-0 sm:absolute sm:right-3 sm:bottom-3 z-10 flex items-center justify-end gap-1.5 flex-wrap">
                  {/* LINK ↗ button */}
                  <a
                    href={character.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 min-w-[70px] px-2.5 py-1.5 rounded-xl bg-[#fffaf0e8] hover:bg-white text-[#ad6f81] text-[10px] font-black tracking-wider border border-white/80 shadow-2xs transition-all hover:-translate-y-0.5"
                    title="Open character chat URL"
                  >
                    <span>LINK ↗</span>
                  </a>

                  {/* PLOT ↗ button */}
                  {character.plot ? (
                    <a
                      href={character.plot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 min-w-[70px] px-2.5 py-1.5 rounded-xl bg-[#b6d6c7e8] hover:bg-[#a2c3b1] text-[#527f72] text-[10px] font-black tracking-wider border border-white/80 shadow-2xs transition-all hover:-translate-y-0.5"
                      title="Open Google Docs / Story outline"
                    >
                      <span>PLOT ↗</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onShowToast("Character này chưa có link Plot. Hãy bổ sung nhé ♡")}
                      className="inline-flex items-center justify-center gap-1 min-w-[70px] px-2.5 py-1.5 rounded-xl bg-[#fffaf088] text-[#ad6f81] opacity-60 text-[10px] font-black tracking-wider border border-white/40 cursor-not-allowed"
                      title="Chưa có link plot"
                    >
                      <span>PLOT ↗</span>
                    </button>
                  )}

                  {/* Roleplay Chatbot Button */}
                  <button
                    type="button"
                    onClick={() => onOpenChat(character)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#e8a3b5] hover:bg-[#d48d95] text-white text-[10px] font-black tracking-wider shadow-2xs transition-all hover:-translate-y-0.5 cursor-pointer"
                    title="Live interactive roleplay chat"
                  >
                    <span>CHAT</span>
                  </button>
                </div>

                {/* Secondary AI & Admin controls */}
                <div className="mt-3 sm:mt-2 pt-2 border-t border-white/40 flex items-center justify-between text-[10px] text-[#977180]">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenIntelligenceStudio(character)}
                      className="px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-[#974e64] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Gemini story arc, bio polish & roleplay prompts"
                    >
                      <Sparkles className="w-3 h-3 text-[#d48d95]" />
                      <span>AI Story</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPortraitStudio(character)}
                      className="px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-[#527f72] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Generate or edit 1K/2K/4K character portraits"
                    >
                      <Wand2 className="w-3 h-3 text-[#527f72]" />
                      <span>Portrait</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(character)}
                      className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white text-[#977180] font-semibold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCharacterToDelete(character)}
                      className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-red-50 text-[#b55866] hover:text-red-700 font-semibold transition-colors cursor-pointer"
                      title="Delete this character"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* IN-APP CONFIRMATION MODAL: Delete Single Character */}
      {characterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fffef7] max-w-sm w-full p-5 rounded-3xl border border-[#f0c8cf] shadow-[0_20px_50px_#bd879038] text-center space-y-3 text-xs text-[#8d606f]">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#feecee] text-[#d4586d] grid place-items-center text-xl shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#a9657a] m-0">
              Xóa nhân vật này?
            </h4>
            <p className="text-[#977180] m-0 leading-relaxed">
              Bà có chắc muốn xóa nhân vật <strong>"{characterToDelete.name}"</strong> khỏi danh sách không? Thao tác này sẽ lưu ngay lập tức.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-[#e5687b] hover:bg-[#c94d60] text-white rounded-xl font-bold transition-colors cursor-pointer shadow-xs"
              >
                Xác nhận xóa
              </button>
              <button
                type="button"
                onClick={() => setCharacterToDelete(null)}
                className="flex-1 py-2.5 bg-[#fff8e8] border border-[#ead0c8] text-[#977180] hover:bg-[#fff0f4] rounded-xl font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL: Delete All Existing Characters */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fffef7] max-w-sm w-full p-5 rounded-3xl border border-[#f0c8cf] shadow-[0_20px_50px_#bd879038] text-center space-y-3 text-xs text-[#8d606f]">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#feecee] text-[#d4586d] grid place-items-center text-xl shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#a9657a] m-0">
              Xóa toàn bộ nhân vật?
            </h4>
            <p className="text-[#977180] m-0 leading-relaxed">
              Bà có chắc muốn xóa sạch toàn bộ <strong>{characters.length} nhân vật</strong> hiện có không? Danh sách sẽ trở về trạng thái trống.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={executeClearAll}
                className="flex-1 py-2.5 bg-[#e5687b] hover:bg-[#c94d60] text-white rounded-xl font-bold transition-colors cursor-pointer shadow-xs"
              >
                Xóa tất cả ({characters.length})
              </button>
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(false)}
                className="flex-1 py-2.5 bg-[#fff8e8] border border-[#ead0c8] text-[#977180] hover:bg-[#fff0f4] rounded-xl font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 text-center text-[10px] text-[#aa8790]">
        Pink Pearl · Character collection ♥
      </div>
    </section>
  );
};
