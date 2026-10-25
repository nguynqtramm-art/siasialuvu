import React from "react";
import { Sparkles, MessageCircle, Heart, Bookmark, Coffee, Feather } from "lucide-react";

interface ProfilePanelProps {
  onClose: () => void;
  onOpenChatWithCreator: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ onClose, onOpenChatWithCreator }) => {
  return (
    <section className="mt-5 p-5 sm:p-7 bg-[#fffdf1ed] border border-[#edc8cb] rounded-[24px] shadow-[0_12px_35px_#b989901a] backdrop-blur-[12px] animate-fadeIn">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-serif text-[#c47b91] text-2xl sm:text-[26px] m-0">
            About Me ♡
          </h2>
          <p className="text-xs leading-relaxed text-[#a27b83] mt-2 mb-0">
            Welcome to Pink Pearl — my safe haven of characters, emotions, and words.
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-[#fff7e8] text-[#b7778c] border border-[#edc6cb] px-3 py-2 rounded-xl text-xs hover:bg-[#fff0f4] transition-colors cursor-pointer whitespace-nowrap"
        >
          ← Back
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 pb-4 border-b border-[#f2d8cf]">
        <div className="w-[90px] h-[90px] shrink-0 rounded-[27px] grid place-items-center bg-gradient-to-br from-[#f6b6c5] via-[#fff2b4] to-[#b6d6c7] border-4 border-white shadow-md text-3xl">
          🌸
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h3 className="text-[#bc7c8c] font-serif text-xl m-0 font-bold">
              siasiailu (Pink Pearl)
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#fce4e9] text-[#b56f86] font-medium border border-[#f0c8cf]">
              ✦ Character Archivist & Author
            </span>
          </div>

          <p className="text-xs sm:text-[13px] leading-[1.8] text-[#8d606f] mt-1 mb-3">
            Xin chào! Mình là tác giả của những câu chuyện nhỏ và các bot nhân vật tại Pink Pearl.
            Nơi đây lưu giữ những linh hồn được dệt nên từ ánh trăng, sự dịu dàng, những vết thương giấu kín,
            và tình yêu chậm rãi (slow burn). Cảm ơn bạn đã ghé thăm thế giới nhỏ bé này ♡.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="bg-[#fce4e9] text-[#b56f86] rounded-full px-2.5 py-1 text-[10px] flex items-center gap-1 font-medium">
              <Heart className="w-2.5 h-2.5 text-[#d48d95]" /> Slow Burn Enthusiast
            </span>
            <span className="bg-[#fff0c8] text-[#9b7180] rounded-full px-2.5 py-1 text-[10px] flex items-center gap-1 font-medium">
              <Feather className="w-2.5 h-2.5 text-[#d48d95]" /> Poetic Angst & Royalty
            </span>
            <span className="bg-[#e4edcf] text-[#527f72] rounded-full px-2.5 py-1 text-[10px] flex items-center gap-1 font-medium">
              <Coffee className="w-2.5 h-2.5 text-[#527f72]" /> Pastel Tea & Whimsy
            </span>
            <span className="bg-[#f8d9dc] text-[#974e64] rounded-full px-2.5 py-1 text-[10px] flex items-center gap-1 font-medium">
              <Bookmark className="w-2.5 h-2.5 text-[#974e64]" /> Original Lore Universe
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs text-[#86636c]">
        <div className="p-4 rounded-2xl bg-[#fff9e9] border border-[#f2d8cf]">
          <h4 className="font-bold text-[#bc7c8c] text-[13px] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#d48d95]" /> Tinh thần sáng tác
          </h4>
          <p className="leading-relaxed m-0 text-[12px]">
            Mỗi nhân vật đều có một nhịp thở và câu chuyện riêng. Mình trân trọng từng tương tác,
            từng dòng đối thoại được xây dựng cẩn thận. Hãy đón nhận họ bằng sự ấm áp và tôn trọng nha!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#fef5f7] border border-[#f5d5db] flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-[#bc7c8c] text-[13px] mb-2 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#d48d95]" /> Trò chuyện cùng Siasiailu
            </h4>
            <p className="leading-relaxed m-0 text-[12px] mb-3">
              Bạn muốn hỏi thêm về cốt truyện, gợi ý nhân vật phù hợp, hoặc cùng tạo nên một plot mới?
            </p>
          </div>
          <button
            onClick={onOpenChatWithCreator}
            className="self-start px-3.5 py-2 bg-[#e8a3b5] hover:bg-[#d48d95] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>♡</span> Nhắn tin với Siasiailu (AI Companion)
          </button>
        </div>
      </div>
    </section>
  );
};
