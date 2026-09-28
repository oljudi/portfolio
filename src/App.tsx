import portfolioData from "./data/portfolio.json";
import avatarImage from "./assets/me.jpeg";
// Center-cropped 160px square derived from mexico.png (626KB -> 12KB).
import flagImage from "./assets/mexico-badge.png";
import { Terminal } from "./components/Terminal";
import { Sections } from "./components/Sections";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { LANGS, UI, initialLang, saveLang, type Lang } from "./i18n";
import { useEffect, useState } from "react";
import "./App.css";

const NAV = ["about", "experience", "education", "skills"] as const;

function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = UI[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    saveLang(lang);
  }, [lang]);

  return (
    <>
      <SchemaMarkup />
      <a className="skip-link" href="#content">{t.skip}</a>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="lang-switch" role="group" aria-label={t.langGroup}>
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                aria-label={label}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Only visible on phones; desktop always shows the nav inline. */}
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={t.menu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>
          <nav
            id="site-nav"
            className="site-nav"
            data-open={menuOpen}
            aria-label="Site"
          >
            {NAV.map((id) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                {t.nav[id]}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <div className="portfolio-container">
        <section className="hero-section">
          <div className="hero-grid">
            <div className="scan-lines"></div>

            <aside className="hero-sidebar">
              <div className="avatar-container">
                <div className="avatar-frame">
                  <span className="avatar-dashes" aria-hidden="true"></span>
                  <span
                    className="avatar-ring avatar-ring-outer"
                    aria-hidden="true"
                  ></span>
                  <span
                    className="avatar-ring avatar-ring-inner"
                    aria-hidden="true"
                  ></span>
                  <span className="avatar-orbit" aria-hidden="true">
                    <i></i>
                  </span>

                  <div className="avatar-disc">
                    <img
                      src={avatarImage}
                      alt={portfolioData.name}
                      className="avatar-image"
                    />
                    <span className="avatar-grid" aria-hidden="true"></span>
                    <span className="avatar-scan" aria-hidden="true"></span>
                  </div>

                  <img
                    className="avatar-flag"
                    src={flagImage}
                    alt="Mexico"
                    title="Mexico"
                  />
                </div>
              </div>

              <div className="about-panel">
                <h2 className="about-name">{portfolioData.name}</h2>
                <p className="about-title">{portfolioData.title[lang]}</p>
                <p className="about-bio">{portfolioData.bio[lang]}</p>
                <div className="about-social">
                  {portfolioData.social.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-social-link"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <div className="hero-main">
              <Terminal lang={lang} />
            </div>
          </div>
        </section>

        <Sections lang={lang} />

        <footer className="site-footer">
          <p>
            {t.footer[0]} <span className="footer-heart">&lt;3</span> {t.footer[1]}{" "}
            {portfolioData.name} {t.footer[2]} Claude · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
