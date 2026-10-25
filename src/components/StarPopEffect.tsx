import React, { useEffect, useRef } from "react";

const STAR_COLORS = ["#f2a8c3", "#f5b8ce", "#f9c8d9", "#e992ae", "#fbc3d3"];
const DUST_COLORS = ["#f5b8ce", "#ffccd9", "#ffd6e0", "#f8b3cb", "#ffffff"];

// Two charming fairy-like star shapes
const STAR_PATHS = [
  // 4-point sparkle star
  "M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z",
  // 5-point fairy star
  "M12 2.5L14.9 8.6L21.6 9.5L16.7 14.3L17.9 21L12 17.8L6.1 21L7.3 14.3L2.4 9.5L9.1 8.6L12 2.5Z",
];

export const StarPopEffect: React.FC = () => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      // Get click / touch coordinates
      let clientX = 0;
      let clientY = 0;

      if ("touches" in e) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          return;
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Check prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Suppress star on close/cancel buttons so only bubbles appear
      const target = e.target as HTMLElement | null;
      if (target) {
        const button = target.closest("button, [role='button']") as HTMLElement | null;
        if (button) {
          const titleAttr = (button.getAttribute("title") || "").toLowerCase();
          const ariaLabelAttr = (button.getAttribute("aria-label") || "").toLowerCase();
          const text = (button.textContent || "").trim().toUpperCase();
          const isCloseOrCancel =
            button.id === "modalCancel" ||
            button.hasAttribute("data-bubble-close") ||
            button.matches("[data-bubble-close]") ||
            titleAttr.includes("close") ||
            ariaLabelAttr.includes("close") ||
            titleAttr.includes("cancel") ||
            ariaLabelAttr.includes("cancel") ||
            text === "CANCEL" ||
            text === "CLOSE" ||
            text.startsWith("CLOSE") ||
            text.startsWith("CANCEL");

          if (isCloseOrCancel) {
            return;
          }
        }
      }

      // 1. Create main Pop Star

      const star = document.createElement("div");
      star.className = "pop-star";
      star.style.left = `${clientX}px`;
      star.style.top = `${clientY}px`;

      const starSize = Math.floor(26 + Math.random() * 12); // 26px - 38px
      const starColor = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      star.style.setProperty("--star-size", `${starSize}px`);
      star.style.setProperty("--star-color", starColor);

      const pathData = STAR_PATHS[Math.floor(Math.random() * STAR_PATHS.length)];
      star.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path class="star-fill" d="${pathData}" />
        </svg>
      `;

      layer.appendChild(star);
      setTimeout(() => {
        star.remove();
      }, 900);

      // 2. Create cute dispersing star dust particles
      const dustCount = 5 + Math.floor(Math.random() * 3); // 5 to 7 particles
      for (let i = 0; i < dustCount; i++) {
        const dust = document.createElement("div");
        dust.className = "star-dust";
        dust.style.left = `${clientX}px`;
        dust.style.top = `${clientY}px`;

        const angle = (Math.PI * 2 * i) / dustCount + (Math.random() - 0.5) * 0.5;
        const distance = 18 + Math.random() * 26; // 18px - 44px
        const dustX = Math.round(Math.cos(angle) * distance);
        const dustY = Math.round(Math.sin(angle) * distance) - 6; // Slight upward buoyancy
        const dustSize = 3 + Math.random() * 2.5;
        const dustColor = DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];

        dust.style.setProperty("--dust-x", `${dustX}px`);
        dust.style.setProperty("--dust-y", `${dustY}px`);
        dust.style.setProperty("--dust-size", `${dustSize}px`);
        dust.style.setProperty("--dust-color", dustColor);

        layer.appendChild(dust);
        setTimeout(() => {
          dust.remove();
        }, 700);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      if (layer) {
        layer.innerHTML = "";
      }
    };
  }, []);

  return <div ref={layerRef} className="star-pop-layer" aria-hidden="true" />;
};
