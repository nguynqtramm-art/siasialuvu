import React, { useEffect, useRef } from "react";

const STAR_SYMBOLS = ["✧", "⋆", "✦", "·", "♥"];

export const FallingStars: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let intervalId: any = null;

    const createFallingStar = () => {
      if (document.hidden || !container) return;
      if (container.childElementCount >= 20) return;

      const star = document.createElement("span");
      star.className = "falling-star";
      star.textContent = STAR_SYMBOLS[Math.floor(Math.random() * STAR_SYMBOLS.length)];
      star.style.left = `${Math.random() * 100}%`;
      star.style.fontSize = `${8 + Math.random() * 10}px`;
      star.style.animationDuration = `${8 + Math.random() * 10}s`;
      star.style.opacity = `${0.25 + Math.random() * 0.5}`;

      container.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 19000);
    };

    intervalId = setInterval(createFallingStar, 850);
    for (let i = 0; i < 6; i++) {
      setTimeout(createFallingStar, i * 250);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (container) container.innerHTML = "";
    };
  }, []);

  return <div id="starLayer" ref={containerRef} aria-hidden="true" />;
};
