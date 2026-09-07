import portfolioData from "./data/portfolio.json";
import avatarImage from "./assets/me.jpeg";
// Center-cropped 160px square derived from mexico.png (626KB -> 12KB).
import flagImage from "./assets/mexico-badge.png";
import { Terminal } from "./components/Terminal";
import { ResumeSection } from "./components/ResumeSection";
import { SchemaMarkup } from "./components/SchemaMarkup";
import "./App.css";

function App() {
  return (
    <>
      <SchemaMarkup />
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
                <p className="about-title">{portfolioData.title}</p>
                <p className="about-bio">{portfolioData.bio}</p>
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
              <Terminal />
            </div>
          </div>
        </section>

        <ResumeSection />

        <footer className="site-footer">
          <p>
            Made with <span className="footer-heart">&lt;3</span> by{" "}
            {portfolioData.name} and Claude · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
