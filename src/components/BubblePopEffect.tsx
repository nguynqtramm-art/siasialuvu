import React, { useEffect, useRef } from "react";

const BUBBLE_COLORS = [
  "#f7c4d9",
  "#f3a9c8",
  "#f9dce8",
  "#e9b7d1",
  "#fff0f6",
];

export const BubblePopEffect: React.FC = () => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    function createFragments(x: number, y: number, count: number = 10) {
      if (!layer) return;
      for (let i = 0; i < count; i++) {
        const fragment = document.createElement("span");
        fragment.className = "bubble-fragment";

        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const distance = 16 + Math.random() * 40;
        const size = 2.5 + Math.random() * 4.5;

        fragment.style.left = `${x}px`;
        fragment.style.top = `${y}px`;
        fragment.style.setProperty("--fragment-size", `${size}px`);
        fragment.style.setProperty(
          "--fragment-x",
          `${Math.cos(angle) * distance}px`
        );
        fragment.style.setProperty(
          "--fragment-y",
          `${Math.sin(angle) * distance}px`
        );

        fragment.style.borderColor =
          BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

        layer.appendChild(fragment);
        setTimeout(() => fragment.remove(), 750);
      }
    }

    function popBubble(x: number, y: number, size: number = 44) {
      if (!layer) return;
      const bubble = document.createElement("span");
      bubble.className = "bubble-pop";

      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
      bubble.style.setProperty("--bubble-size", `${size}px`);

      layer.appendChild(bubble);

      // Bong bóng phồng lên rồi các mảnh nhỏ bung ra
      setTimeout(() => {
        createFragments(x, y, 10);
      }, 390);

      setTimeout(() => bubble.remove(), 560);
    }

    function popAtElement(element: HTMLElement) {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const calcSize = Math.min(52, Math.max(30, Math.round(Math.min(rect.width, rect.height) * 0.85)));
      popBubble(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        calcSize
      );
    }


    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const button = target.closest("button, [role='button']") as HTMLElement | null;
      if (!button) return;

      const titleAttr = (button.getAttribute("title") || "").toLowerCase();
      const ariaLabelAttr = (button.getAttribute("aria-label") || "").toLowerCase();
      const text = (button.textContent || "").trim().toUpperCase();

      // Nút đóng modal, ví dụ CANCEL, Close, [data-bubble-close]
      const isCancelButton =
        button.id === "modalCancel" ||
        button.matches("[data-bubble-close]") ||
        button.hasAttribute("data-bubble-close") ||
        ariaLabelAttr.includes("close") ||
        titleAttr.includes("close") ||
        ariaLabelAttr.includes("cancel") ||
        titleAttr.includes("cancel") ||
        text === "CANCEL" ||
        text === "CLOSE" ||
        text.startsWith("CLOSE") ||
        text.startsWith("CANCEL");

      if (isCancelButton) {
        popAtElement(button);
        return;
      }

      // Nút thu gọn / mở rộng mục
      if (button.hasAttribute("data-bubble-toggle")) {
        popAtElement(button);
        return;
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      if (layer) {
        layer.innerHTML = "";
      }
    };
  }, []);

  return <div ref={layerRef} className="bubble-pop-layer" aria-hidden="true" />;
};
