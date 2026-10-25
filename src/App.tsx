import React, { useState, useEffect, useRef } from "react";
import { Character, PageContent } from "./types";
import { FallingStars } from "./components/FallingStars";
import { StarPopEffect } from "./components/StarPopEffect";
import { BubblePopEffect } from "./components/BubblePopEffect";
import { CharacterChatModal } from "./components/CharacterChatModal";

import { PortraitStudioModal } from "./components/PortraitStudioModal";
import { IntelligenceStudioModal } from "./components/IntelligenceStudioModal";
import { SearchGroundingModal } from "./components/SearchGroundingModal";
import { Sparkles, Globe, Wand2, MessageCircle, Edit3, Trash2, Plus, X, Search, Music, Play, Pause } from "lucide-react";
import { playCuteChime } from "./utils/sound";
import { MusicPlayer } from "./components/MusicPlayer";


const ADMIN_PASSWORD = "quynhtram1601";
const STORAGE_KEY = "siasiailuArchiveV1";
const PAGE_KEY = "siasiailuPageContentV1";


function RibbonIcon({ className = "w-6 h-6 text-[#c97894]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 11c-2.5-3-5.5-4-8-2-2.2 1.8-1.5 5 1 5.5 3 .6 5.5-1.5 7-3.5z" />
      <path d="M12 11c2.5-3 5.5-4 8-2 2.2 1.8 1.5 5-1 5.5-3 .6-5.5-1.5-7-3.5z" />
      <circle cx="12" cy="11" r="2.2" fill="currentColor" fillOpacity="0.45" />
      <path d="M10.5 13.2l-3 7" />
      <path d="M13.5 13.2l3 7" />
    </svg>
  );
}

function HeartBadge({ className = "w-3.5 h-3.5 text-[#c97894] fill-[#e9a9bb] inline-block align-middle" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

const DEFAULT_PAGE_CONTENT: PageContent = {
  profile: `<p>Welcome to my little corner of the internet &hearts;</p>
<p>This is where I collect my characters, stories, and little worlds. Feel free to explore!</p>`,
  rules: `<p>&bull; Please read the character description and plot before starting.</p>
<p>&bull; Be respectful and enjoy your story.</p>
<p>&bull; Character links and plot documents are provided on each card when available.</p>`,
};

function safeURL(value: string | undefined): string {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {}
  return "";
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [pageContent, setPageContent] = useState<PageContent>(DEFAULT_PAGE_CONTENT);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const [activeTile, setActiveTile] = useState<"profile" | "rules" | "characters" | null>(null);

  const handleNavClick = (section: "profile" | "rules" | "characters") => {
    setActiveTile(section);
    playCuteChime("pop");

    if (section === "profile") {
      setShowProfile((prev) => {
        const next = !prev;
        if (next) {
          setTimeout(() => {
            document.getElementById("profile")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }
        return next;
      });
    } else if (section === "rules") {
      setShowRules((prev) => {
        const next = !prev;
        if (next) {
          setTimeout(() => {
            document.getElementById("rules")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }
        return next;
      });
    } else if (section === "characters") {
      setShowCharacters((prev) => {
        const next = !prev;
        if (next) {
          setTimeout(() => {
            document.getElementById("archive")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }
        return next;
      });
    }
  };


  // Modals state
  const [modalMode, setModalMode] = useState<"login" | "profile" | "rules" | "character" | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Form states for modals
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [formError, setFormError] = useState("");
  const [contentEditorText, setContentEditorText] = useState("");

  // Character Editor form states
  const [charName, setCharName] = useState("");
  const [charDescription, setCharDescription] = useState("");
  const [charLink, setCharLink] = useState("");
  const [charPlot, setCharPlot] = useState("");
  const [charAvatar, setCharAvatar] = useState("");

  // Gemini Modals
  const [chatCharacter, setChatCharacter] = useState<Character | null | "author">(null);
  const [portraitCharacter, setPortraitCharacter] = useState<Character | null>(null);
  const [intelligenceCharacter, setIntelligenceCharacter] = useState<Character | null>(null);
  const [showLoreGrounding, setShowLoreGrounding] = useState<boolean>(false);
  const [showGlobalPortraitStudio, setShowGlobalPortraitStudio] = useState<boolean>(false);

  // Music State
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isMusicDrawerOpen, setIsMusicDrawerOpen] = useState(false);


  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => {
      setToastMessage((cur) => (cur === message ? null : cur));
    }, 2800);
    return () => clearTimeout(timer);
  };

  // Load saved characters and page content
  useEffect(() => {
    try {
      const savedChars = localStorage.getItem(STORAGE_KEY);
      if (savedChars !== null) {
        const parsed = JSON.parse(savedChars);
        if (Array.isArray(parsed)) {
          setCharacters(parsed);
        }
      } else {
        // Starts clean by default
        setCharacters([]);
      }
    } catch (e) {
      console.warn("Could not load characters:", e);
      setCharacters([]);
    }

    try {
      const savedContent = localStorage.getItem(PAGE_KEY);
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        if (parsed && typeof parsed === "object") {
          const rawProfile = parsed.profile || DEFAULT_PAGE_CONTENT.profile;
          const rawRules = parsed.rules || DEFAULT_PAGE_CONTENT.rules;
          setPageContent({
            profile: rawProfile.replaceAll("♡", "&hearts;"),
            rules: rawRules.replaceAll("♡", "&bull;"),
          });
        }
      }
    } catch (e) {
      console.warn("Could not load page content:", e);
    }
  }, []);

  const saveCharactersToStorage = (updated: Character[]) => {
    setCharacters(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Storage error:", err);
    }
  };

  const savePageContentToStorage = (updated: PageContent) => {
    setPageContent(updated);
    try {
      localStorage.setItem(PAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Storage error:", err);
    }
  };

  // Modal Handlers
  const handleOpenLogin = () => {
    setAdminPasswordInput("");
    setFormError("");
    setModalMode("login");
  };

  const handleOpenContentEditor = (type: "profile" | "rules") => {
    if (!isAdmin) return;
    setContentEditorText(type === "profile" ? pageContent.profile : pageContent.rules);
    setFormError("");
    setModalMode(type);
  };

  const handleOpenCharacterEditor = (char: Character | null = null) => {
    if (!isAdmin) return;
    setEditingCharacter(char);
    setCharName(char?.name || "");
    setCharDescription(char?.description || "");
    setCharLink(char?.link || "");
    setCharPlot(char?.plot || "");
    setCharAvatar(char?.avatarUrl || "");
    setFormError("");
    setModalMode("character");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingCharacter(null);
    setFormError("");
  };

  const handleSaveModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (modalMode === "login") {
      if (adminPasswordInput === ADMIN_PASSWORD) {
        setIsAdmin(true);
        playCuteChime("sparkle");
        showToast("Admin mode unlocked");
        handleCloseModal();
      } else {
        setFormError("Incorrect password. Please try again.");
      }
      return;
    }

    if (!isAdmin) {
      handleCloseModal();
      return;
    }

    if (modalMode === "profile" || modalMode === "rules") {
      const updated = {
        ...pageContent,
        [modalMode]: contentEditorText,
      };
      savePageContentToStorage(updated);
      playCuteChime("save");
      showToast(`Saved changes to ${modalMode}`);
      handleCloseModal();
      return;
    }

    if (modalMode === "character") {
      const trimmedName = charName.trim();
      if (!trimmedName) {
        setFormError("Please enter a character name.");
        return;
      }

      const characterData: Character = {
        id: editingCharacter ? editingCharacter.id : "ch_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: trimmedName,
        tags: editingCharacter?.tags || ["Story"],
        description: charDescription.trim(),
        link: safeURL(charLink),
        plot: safeURL(charPlot) || undefined,
        avatarUrl: safeURL(charAvatar) || editingCharacter?.avatarUrl || undefined,
        createdAt: editingCharacter?.createdAt || new Date().toISOString(),
      };

      let updatedList: Character[];
      if (editingCharacter) {
        updatedList = characters.map((c) => (c.id === editingCharacter.id ? characterData : c));
      } else {
        updatedList = [characterData, ...characters];
      }

      saveCharactersToStorage(updatedList);
      playCuteChime("save");
      showToast(editingCharacter ? "Updated character" : "Added new character");
      handleCloseModal();
    }
  };

  // Safe In-App Deletion
  const executeDeleteCharacter = () => {
    if (!characterToDelete) return;
    const deletedName = characterToDelete.name;
    const updated = characters.filter((c) => c.id !== characterToDelete.id);
    saveCharactersToStorage(updated);
    playCuteChime("pop");
    showToast(`Deleted "${deletedName}".`);
    setCharacterToDelete(null);
  };

  const executeClearAllCharacters = () => {
    saveCharactersToStorage([]);
    playCuteChime("pop");
    showToast("Deleted all existing characters.");
    setShowClearAllConfirm(false);
  };

  const handleApplyAvatar = (imageUrl: string) => {
    if (portraitCharacter) {
      const updated = characters.map((c) =>
        c.id === portraitCharacter.id ? { ...c, avatarUrl: imageUrl } : c
      );
      saveCharactersToStorage(updated);
      setPortraitCharacter({ ...portraitCharacter, avatarUrl: imageUrl });
      showToast(`Applied avatar to "${portraitCharacter.name}"`);
    } else {
      showToast("Portrait generated successfully");
    }
  };

  const handleUpdateFromIntelligence = (updatedFields: Partial<Character>) => {
    if (!intelligenceCharacter) return;
    const updated = characters.map((c) =>
      c.id === intelligenceCharacter.id ? { ...c, ...updatedFields } : c
    );
    saveCharactersToStorage(updated);
    setIntelligenceCharacter({ ...intelligenceCharacter, ...updatedFields });
    showToast(`Updated "${intelligenceCharacter.name}"`);
  };

  // Filtered characters
  const search = searchQuery.trim().toLowerCase();
  const filteredCharacters = characters.filter((character) => {
    const haystack = `${character.name} ${character.description}`.toLowerCase();
    return haystack.includes(search);
  });

  return (
    <>
      {/* Falling Stars, Star Pop, & Pink Bubble Pop Effect */}
      <FallingStars />
      <StarPopEffect />
      <BubblePopEffect />


      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#829d8b] text-white shadow-[0_6px_22px_rgba(130,157,139,0.35)] text-xs font-bold tracking-wide animate-fadeIn flex items-center gap-2"
        >
          <HeartBadge className="w-3.5 h-3.5 text-white fill-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="site-wrap">
        {/* Top bar */}
        <header className="topbar">
          <a className="brand font-serif italic text-[#a96f83]" href="#home">
            <span>siasiailu</span>
            <HeartBadge className="w-5 h-5 ml-1 text-[#c97894] fill-[#e9a9bb]" />
          </a>

          <div className="top-actions">
            {/* Music Player & Playlist trigger */}
            <button
              type="button"
              onClick={() => {
                setIsMusicDrawerOpen(true);
                playCuteChime("pop");
              }}
              className={`pill text-xs inline-flex items-center gap-1.5 cursor-pointer ${
                musicPlaying
                  ? "text-[#c97894] border-[#e4b7c5] bg-[#fff0f4] hover:bg-[#ffe3eb]"
                  : "text-[#715b5c] hover:text-[#c97894]"
              }`}
              title="Open Music Player & Playlist"
            >
              <Music className="w-3.5 h-3.5 text-[#c97894]" />
              <span>{musicPlaying ? "Music Playing ♫" : "Music & Playlist"}</span>
              {musicPlaying && (
                <span className="w-2 h-2 rounded-full bg-[#c97894] animate-pulse" />
              )}
            </button>


            <button
              onClick={() => setShowLoreGrounding(true)}
              className="pill hidden sm:inline-flex text-[#715b5c] hover:text-[#c97894]"
              title="Google Search Grounding for character lore"
            >
              <Globe className="w-3.5 h-3.5 text-[#829d8b]" />
              <span>Search Lore</span>
            </button>

            <button
              onClick={() => setShowGlobalPortraitStudio(true)}
              className="pill hidden sm:inline-flex text-[#715b5c] hover:text-[#c97894]"
              title="Portrait Studio (1K, 2K, 4K resolution)"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#c97894]" />
              <span>Portrait Atelier</span>
            </button>

            <span className={`admin-status font-bold uppercase ${isAdmin ? "admin-active" : ""}`} id="adminStatus">
              {isAdmin ? "ADMIN MODE" : "VISITOR MODE"}
            </span>

            <button
              className="pill font-semibold"
              id="adminButton"
              type="button"
              onClick={() => {
                if (isAdmin) {
                  setIsAdmin(false);
                  showToast("Switched to Visitor Mode");
                } else {
                  handleOpenLogin();
                }
              }}
            >
              <HeartBadge className="w-3 h-3 text-[#c97894] fill-[#e9a9bb]" />
              <span>{isAdmin ? "LOG OUT" : "ADMIN LOGIN"}</span>
            </button>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="hero" id="home">
            <p className="eyebrow italic normal-case">mừng bạn đến với</p>
            <h1>siasiailu</h1>
            <p className="subtitle italic">góc nhỏ của sia☆.</p>
            <div className="hero-divider"></div>


          </section>

          {/* Navigation Tiles */}
          <nav className="nav-tiles" aria-label="Main navigation">
            <a
              href="#profile"
              role="button"
              className={`nav-tile cursor-pointer ${showProfile ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("profile");
              }}
              aria-expanded={showProfile}
              aria-controls="profile"
            >
              <span className="symbol flex items-center justify-center">
                <RibbonIcon className="w-7 h-7 text-current" />
              </span>
              <span className="tile-name">Profile</span>
              <span className="tile-sub">ABOUT ME</span>
            </a>

            <a
              href="#rules"
              role="button"
              className={`nav-tile cursor-pointer ${showRules ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("rules");
              }}
              aria-expanded={showRules}
              aria-controls="rules"
            >
              <span className="symbol flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-current" />
              </span>
              <span className="tile-name">Rules</span>
              <span className="tile-sub">PLEASE READ</span>
            </a>

            <a
              href="#archive"
              role="button"
              className={`nav-tile cursor-pointer ${showCharacters ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("characters");
              }}
              aria-expanded={showCharacters}
              aria-controls="archive"
            >
              <span className="symbol flex items-center justify-center">
                <HeartBadge className="w-6 h-6 text-current fill-current opacity-90" />
              </span>
              <span className="tile-name">Characters</span>
              <span className="tile-sub">iu chồng</span>
            </a>
          </nav>

          {/* Section 01: Profile */}
          {showProfile && (
            <div className="animate-fadeIn mb-8" id="profile">
              <div className="flex items-center justify-end mb-2 px-1">
                <button
                  type="button"
                  data-bubble-close
                  onClick={() => {
                    setShowProfile(false);
                    if (activeTile === "profile") setActiveTile(null);
                  }}
                  className="text-[11px] text-[#a48a88] hover:text-[#c97894] flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer"
                  title="Close profile section"
                >
                  <span>Close</span>
                  <X className="w-3 h-3" />
                </button>
              </div>

              <section className="section !mt-0">
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">01 / the creator</p>
                    <h2>Profile</h2>
                    <p className="section-description italic">những thứ vặt vãnh về tui</p>
                  </div>
                  <div className="editor-actions">
                    <button
                      onClick={() => setChatCharacter("author")}
                      className="btn btn-mint btn-small"
                      type="button"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>CHAT WITH ME</span>
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-primary btn-small"
                        id="editProfileButton"
                        type="button"
                        onClick={() => handleOpenContentEditor("profile")}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>EDIT PROFILE</span>
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className="section-body"
                  id="profileContent"
                  dangerouslySetInnerHTML={{ __html: pageContent.profile }}
                />
              </section>
            </div>
          )}

          {/* Section 02: Rules */}
          {showRules && (
            <div className="animate-fadeIn mb-8" id="rules">
              <div className="flex items-center justify-end mb-2 px-1">
                <button
                  type="button"
                  data-bubble-close
                  onClick={() => {
                    setShowRules(false);
                    if (activeTile === "rules") setActiveTile(null);
                  }}
                  className="text-[11px] text-[#a48a88] hover:text-[#c97894] flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer"
                  title="Close rules section"
                >
                  <span>Close</span>
                  <X className="w-3 h-3" />
                </button>
              </div>
              <section className="section !mt-0">
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">02 / <span className="italic normal-case">đọc đi rồi tìm chồn iu nè!!</span></p>
                    <h2>Rules</h2>
                    <p className="section-description">A small note before interacting with my characters.</p>
                  </div>
                  {isAdmin && (
                    <div className="editor-actions">
                      <button
                        className="btn btn-primary btn-small"
                        id="editRulesButton"
                        type="button"
                        onClick={() => handleOpenContentEditor("rules")}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>EDIT RULES</span>
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className="section-body"
                  id="rulesContent"
                  dangerouslySetInnerHTML={{ __html: pageContent.rules }}
                />
              </section>
            </div>
          )}

          {/* Section 03: Character Archive */}
          {showCharacters ? (
            <div className="animate-fadeIn" id="archive">
              <div className="flex items-center justify-end mb-2 px-1">
                <button
                  type="button"
                  data-bubble-close
                  onClick={() => {
                    setShowCharacters(false);
                    if (activeTile === "characters") setActiveTile(null);
                  }}
                  className="text-[11px] text-[#a48a88] hover:text-[#c97894] flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer"
                  title="Close character section"
                  aria-label="Close character section"
                >
                  <span>Close</span>
                  <X className="w-3 h-3" />
                </button>
              </div>
              <section className="section !mt-0">
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">03 / <span className="italic normal-case">em tìm chồng đi nè♡.</span></p>
                    <h2>Character Archive</h2>


                <p className="section-description">Characters, plots, and little stories waiting to be explored.</p>
              </div>
              <div className="editor-actions">
                {isAdmin && (
                  <>
                    <button
                      className="btn btn-primary btn-small"
                      id="addCharacterButton"
                      type="button"
                      onClick={() => handleOpenCharacterEditor()}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD CHARACTER</span>
                    </button>
                    {characters.length > 0 && (
                      <button
                        className="btn btn-danger btn-small"
                        type="button"
                        onClick={() => setShowClearAllConfirm(true)}
                        title="Delete all characters in this browser"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>DELETE ALL</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="archive-tools">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a48a88]" />
                <input
                  className="search-input pl-10"
                  id="searchInput"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a character..."
                  aria-label="Search characters"
                />
              </div>
            </div>

            <div className="character-list" id="characterList">
              {filteredCharacters.length === 0 ? (
                <div className="empty-state">
                  <p className="m-0 text-sm flex items-center justify-center gap-1.5">
                    <span>{search ? "No characters found" : "No characters here yet"}</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#c97894] inline" />
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenCharacterEditor()}
                      className="btn btn-primary btn-small mt-3"
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1" />
                      <span>Add Your First Character</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredCharacters.map((character, index) => {
                  return (
                    <article key={character.id} className="character-card">
                      <div className="flex items-start justify-between gap-2">
                        <span className="character-number">
                          NO. {(index + 1).toString().padStart(2, "0")}
                        </span>
                        {character.avatarUrl && (
                          <img
                            src={character.avatarUrl}
                            alt={character.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#e2b9c4] shadow-xs"
                          />
                        )}
                      </div>

                      <h3>{character.name}</h3>
                      <p className="character-desc">
                        {character.description || "A little story waiting to be explored."}
                      </p>

                      <div className="character-links">
                        {character.link ? (
                          <a
                            className="btn btn-primary"
                            href={character.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <HeartBadge className="w-3.5 h-3.5 text-[#c97894] fill-[#e9a9bb]" />
                            <span>LINK</span>
                          </a>
                        ) : (
                          <span className="btn" aria-disabled="true" style={{ opacity: 0.55 }}>
                            <HeartBadge className="w-3.5 h-3.5 text-[#a48a88] fill-[#e2b9c4]" />
                            <span>NO LINK</span>
                          </span>
                        )}

                        {character.plot ? (
                          <a
                            className="btn btn-mint"
                            href={character.plot}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#55725d]" />
                            <span>PLOT</span>
                          </a>
                        ) : null}
                      </div>

                      {isAdmin && (
                        <div className="character-admin">
                          <button
                            className="btn btn-small"
                            type="button"
                            onClick={() => handleOpenCharacterEditor(character)}
                          >
                            EDIT
                          </button>
                          <button
                            className="btn btn-danger btn-small"
                            type="button"
                            onClick={() => setCharacterToDelete(character)}
                          >
                            DELETE
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      ) : null}

          {/* Closing Quote */}

          <div className="closing-quote">
            <span className="quote-star">✧</span>
            <p>An yên trong màu nắng hạ.</p>
            <span className="quote-star">୨୧</span>
          </div>

          {/* Footer */}
          <footer className="site-footer">

            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span>MADE WITH</span>
              <HeartBadge className="w-3.5 h-3.5 text-[#c97894] fill-[#e9a9bb]" />
              <span>BY SIASIAILU</span>
            </div>
            <div className="flex items-center justify-center gap-1 opacity-75">
              <span>thank you for stopping by</span>
              <Sparkles className="w-3 h-3 text-[#c97894] inline" />
            </div>
          </footer>
        </main>
      </div>

      {/* IN-APP MODAL: Login & Content/Character Editor */}
      {modalMode && (
        <div
          className="modal-backdrop open"
          id="modalBackdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="modal">
            {modalMode === "login" && (
              <form onSubmit={handleSaveModal}>
                <h2 id="modalTitle">Admin Login</h2>
                <p className="modal-help">
                  Enter your admin password to unlock editing controls.
                </p>
                <div className="field">
                  <label htmlFor="adminPasswordInput">PASSWORD</label>
                  <input
                    id="adminPasswordInput"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    autoFocus
                  />
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="modal-actions">
                  <button className="btn" id="modalCancel" data-bubble-close aria-label="Cancel" type="button" onClick={handleCloseModal}>
                    CANCEL
                  </button>
                  <button className="btn btn-primary" type="submit">
                    LOG IN
                  </button>
                </div>
              </form>
            )}

            {(modalMode === "profile" || modalMode === "rules") && (
              <form onSubmit={handleSaveModal}>
                <h2 id="modalTitle">{modalMode === "profile" ? "Edit Profile" : "Edit Rules"}</h2>
                <p className="modal-help">
                  You can use simple HTML paragraphs, lists, and emphasis in this field.
                </p>
                <div className="field">
                  <label htmlFor="pageEditor">CONTENT (HTML SUPPORTED)</label>
                  <textarea
                    id="pageEditor"
                    spellCheck="false"
                    style={{ minHeight: "220px" }}
                    value={contentEditorText}
                    onChange={(e) => setContentEditorText(e.target.value)}
                  />
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="modal-actions">
                  <button className="btn" id="modalCancel" data-bubble-close aria-label="Cancel" type="button" onClick={handleCloseModal}>
                    CANCEL
                  </button>
                  <button className="btn btn-primary" type="submit">
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            )}

            {modalMode === "character" && (
              <form onSubmit={handleSaveModal}>
                <h2 id="modalTitle">{editingCharacter ? "Edit Character" : "Add Character"}</h2>
                <p className="modal-help">
                  Fill in the character details. LINK and PLOT can be left blank.
                </p>
                <div className="field">
                  <label htmlFor="characterName">NAME *</label>
                  <input
                    id="characterName"
                    maxLength={120}
                    placeholder="Character name"
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label htmlFor="characterDescription">SHORT DESCRIPTION</label>
                  <textarea
                    id="characterDescription"
                    maxLength={2000}
                    placeholder="A short introduction..."
                    value={charDescription}
                    onChange={(e) => setCharDescription(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="characterLink">CHARACTER CHAT LINK</label>
                  <input
                    id="characterLink"
                    type="url"
                    placeholder="https://..."
                    value={charLink}
                    onChange={(e) => setCharLink(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="characterPlot">PLOT / GOOGLE DOCS LINK</label>
                  <input
                    id="characterPlot"
                    type="url"
                    placeholder="https://..."
                    value={charPlot}
                    onChange={(e) => setCharPlot(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="characterAvatar">PORTRAIT AVATAR URL (OPTIONAL)</label>
                  <input
                    id="characterAvatar"
                    type="url"
                    placeholder="https://... (or generate via Atelier)"
                    value={charAvatar}
                    onChange={(e) => setCharAvatar(e.target.value)}
                  />
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="modal-actions">
                  <button className="btn" id="modalCancel" data-bubble-close aria-label="Cancel" type="button" onClick={handleCloseModal}>
                    CANCEL
                  </button>
                  <button className="btn btn-primary" type="submit">
                    SAVE CHARACTER
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL: Delete Single Character */}
      {characterToDelete && (
        <div className="modal-backdrop open">
          <div className="modal text-center">
            <h2 className="text-xl">Delete Character</h2>
            <p className="modal-help">
              Are you sure you want to delete <strong>"{characterToDelete.name}"</strong> from this browser's saved archive?
            </p>
            <div className="modal-actions justify-center">
              <button className="btn" id="modalCancel" data-bubble-close aria-label="Cancel" type="button" onClick={() => setCharacterToDelete(null)}>
                CANCEL
              </button>
              <button className="btn btn-danger" type="button" onClick={executeDeleteCharacter}>
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL: Delete All Characters */}
      {showClearAllConfirm && (
        <div className="modal-backdrop open">
          <div className="modal text-center">
            <h2 className="text-xl">Delete All Characters</h2>
            <p className="modal-help">
              Are you sure you want to delete all <strong>{characters.length} characters</strong>? The archive will be completely empty.
            </p>
            <div className="modal-actions justify-center">
              <button className="btn" id="modalCancel" data-bubble-close aria-label="Cancel" type="button" onClick={() => setShowClearAllConfirm(false)}>
                CANCEL
              </button>
              <button className="btn btn-danger" type="button" onClick={executeClearAllCharacters}>
                DELETE ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Character Chatbot */}
      {chatCharacter !== null && (
        <CharacterChatModal
          character={chatCharacter === "author" ? null : chatCharacter}
          onClose={() => setChatCharacter(null)}
        />
      )}

      {/* Gemini Portrait Studio (1K, 2K, 4K & Edit) */}
      {(portraitCharacter !== null || showGlobalPortraitStudio) && (
        <PortraitStudioModal
          character={portraitCharacter}
          onClose={() => {
            setPortraitCharacter(null);
            setShowGlobalPortraitStudio(false);
          }}
          onApplyAvatar={handleApplyAvatar}
        />
      )}

      {/* Gemini Intelligence Studio */}
      {intelligenceCharacter !== null && (
        <IntelligenceStudioModal
          character={intelligenceCharacter}
          onClose={() => setIntelligenceCharacter(null)}
          onUpdateCharacter={handleUpdateFromIntelligence}
        />
      )}

      {/* Google Search Lore Grounding */}
      {showLoreGrounding && (
        <SearchGroundingModal
          onClose={() => setShowLoreGrounding(false)}
          onInsertToNotes={() => {
            showToast("Copied lore notes to clipboard ♡");
          }}
        />
      )}

      {/* Background YouTube Music Player with Alternating Continuous Loop & Admin Add Feature */}
      <MusicPlayer
        isAdmin={isAdmin}
        isPlaying={musicPlaying}
        setIsPlaying={setMusicPlaying}
        showToast={showToast}
        isDrawerOpen={isMusicDrawerOpen}
        setIsDrawerOpen={setIsMusicDrawerOpen}
      />
    </>
  );
}

