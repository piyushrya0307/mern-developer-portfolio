
import { ArrowUpRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="navbar">
      <a href="#home" className="logo">
        P<span>.</span>
      </a>

      <nav className="nav-links" aria-label="Main navigation">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>

      <a href="mailto:hello@example.com" className="nav-button">
        Let's Talk <ArrowUpRight size={15} />
      </a>
    </header>
  );
}
