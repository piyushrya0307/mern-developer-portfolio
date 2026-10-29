
import { useEffect, useState } from "react";
import {
  House,
  UserRound,
  FolderKanban,
  Mail,
} from "lucide-react";

const navigation = [
  { label: "Home", Icon: House, target: "home" },
  { label: "About", Icon: UserRound, target: "about" },
  {
    label: "Projects",
    Icon: FolderKanban,
    target: "projects",
  },
  { label: "Contact", Icon: Mail, target: "contact" },
];

export default function MobileNav() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => {
      const position = window.scrollY + 150;
      let current = "home";

      for (const item of navigation) {
        const element = document.getElementById(
          item.target
        );

        if (element && element.offsetTop <= position) {
          current = item.target;
        }
      }

      setActive(current);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const goToSection = (target) => {
    const element = document.getElementById(target);
    if (!element) return;

    setActive(target);

    element.scrollIntoView({
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <nav
      className="mobile-nav"
      aria-label="Mobile navigation"
    >
      {navigation.map(({ label, Icon, target }) => (
        <button
          type="button"
          key={target}
          onClick={() => goToSection(target)}
          className={`mobile-nav-item ${
            active === target ? "active" : ""
          }`}
          aria-current={
            active === target ? "location" : undefined
          }
        >
          <Icon size={19} strokeWidth={1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
