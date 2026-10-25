import React from "react";
import { ShieldCheck, HeartHandshake, Link2, AlertCircle } from "lucide-react";

interface RulesPanelProps {
  onClose: () => void;
}

export const RulesPanel: React.FC<RulesPanelProps> = ({ onClose }) => {
  return (
    <section className="mt-5 p-5 sm:p-7 bg-[#fffdf1ed] border border-[#edc8cb] rounded-[24px] shadow-[0_12px_35px_#b989901a] backdrop-blur-[12px] animate-fadeIn">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-serif text-[#c47b91] text-2xl sm:text-[26px] m-0">
            My Rules ✧
          </h2>
          <p className="text-xs leading-relaxed text-[#a27b83] mt-2 mb-0">
            Please read before using my collection and exploring my character links.
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-[#fff7e8] text-[#b7778c] border border-[#edc6cb] px-3 py-2 rounded-xl text-xs hover:bg-[#fff0f4] transition-colors cursor-pointer whitespace-nowrap"
        >
          ← Back
        </button>
      </div>

      <div className="grid gap-3.5">
        {/* Rule 01 */}
        <div className="p-4 border border-[#f2d8cf] rounded-2xl bg-[#fff9e9]">
          <div className="flex items-center gap-2 mb-2 text-[#bc7c8c] font-bold text-xs sm:text-[13px]">
            <ShieldCheck className="w-4 h-4 text-[#d48d95]" />
            <span>01. Respect the creator</span>
          </div>
          <p className="text-xs leading-[1.8] text-[#86636c] m-0 whitespace-pre-line">
            ★ Không tham khảo prompt khi chưa có sự cho phép.
            ★ Không ăn nói mất lịch sự/giọng điệu ra lệnh.
            ★ Không ăn cắp ý tưởng plot/đạo văn.
            Hết gùi, tui chỉ cấm ba điều như vậy thui à, cũng đơn giản phải hong♡.
          </p>
        </div>

        {/* Rule 02 */}
        <div className="p-4 border border-[#f2d8cf] rounded-2xl bg-[#fff9e9]">
          <div className="flex items-center gap-2 mb-2 text-[#bc7c8c] font-bold text-xs sm:text-[13px]">
            <HeartHandshake className="w-4 h-4 text-[#d48d95]" />
            <span>02. Use links responsibly</span>
          </div>
          <p className="text-xs leading-[1.8] text-[#86636c] m-0">
            Đọc mô tả và các lưu ý riêng của từng character trước khi bắt đầu sử dụng. Hãy tận hưởng câu chuyện một cách văn minh và tôn trọng mạch cảm xúc của nhân vật.
          </p>
        </div>

        {/* Rule 03 */}
        <div className="p-4 border border-[#f2d8cf] rounded-2xl bg-[#fff9e9]">
          <div className="flex items-center gap-2 mb-2 text-[#bc7c8c] font-bold text-xs sm:text-[13px]">
            <AlertCircle className="w-4 h-4 text-[#d48d95]" />
            <span>03. Respect each other</span>
          </div>
          <p className="text-xs leading-[1.8] text-[#86636c] m-0">
            Tôn trọng tác giả và người dùng khác. Không sử dụng các liên kết để quấy rối người khác hoặc lan truyền nội dung độc hại.
          </p>
        </div>

        {/* Rule 04 */}
        <div className="p-4 border border-[#f2d8cf] rounded-2xl bg-[#fff9e9]">
          <div className="flex items-center gap-2 mb-2 text-[#bc7c8c] font-bold text-xs sm:text-[13px]">
            <Link2 className="w-4 h-4 text-[#d48d95]" />
            <span>04. Broken link?</span>
          </div>
          <p className="text-xs leading-[1.8] text-[#86636c] m-0">
            Nếu link chat hoặc link plot bị lỗi, hãy cập nhật đường dẫn mới hoặc nhắn cho tác giả để mọi người có thể tiếp tục sử dụng nha.
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-[#f8eff2] rounded-xl border border-[#edd2d8] text-[11px] text-[#977180] flex items-center justify-between">
        <span>✧ Pink Pearl Rules & Community Guidelines</span>
        <span className="font-serif italic text-[#c47b91]">love & peace ♡</span>
      </div>
    </section>
  );
};
