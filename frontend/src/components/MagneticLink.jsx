import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";

export default function MagneticLink({ href, label }) {
  const linkRef = useRef(null);

  const handlePointerMove = (event) => {
    const link = linkRef.current;

    if (
      !link ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rect = link.getBoundingClientRect();

    const x = event.clientX - (rect.left + rect.width / 2);

    const y = event.clientY - (rect.top + rect.height / 2);

    link.style.setProperty("--magnetic-x", `${x * 0.18}px`);
    link.style.setProperty("--magnetic-y", `${y * 0.18}px`);
  };

  const resetMagnet = () => {
    const link = linkRef.current;
    if (!link) return;

    link.style.setProperty("--magnetic-x", "0px");
    link.style.setProperty("--magnetic-y", "0px");
  };

  return (
    <a
      ref={linkRef}
      href={href}
      aria-label={label}
      className="corner-link magnetic-link"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetMagnet}
      onBlur={resetMagnet}
    >
      <ArrowUpRight size={17} />
    </a>
  );
}
