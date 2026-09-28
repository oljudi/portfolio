import portfolioData from "../data/portfolio.json";
import { UI, type Lang } from "../i18n";
import "./Sections.css";

// "**x**" in the data renders as <strong>x</strong>; odd split parts are bold.
const rich = (text: string) =>
  text.split("**").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

export function Sections({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const period = (start: string, end: string | null) =>
    `${start} — ${end ?? t.present}`;

  return (
    <main id="content" className="sections">
      <section id="about" className="section" aria-labelledby="about-title">
        <h2 id="about-title" className="section-title">{t.about}</h2>
        {portfolioData.about[lang].map((paragraph, i) => (
          <p key={i} className="about-text">{rich(paragraph)}</p>
        ))}
        <p className="about-meta">
          <a href={`mailto:${portfolioData.email}`}>{portfolioData.email}</a>
          <span aria-hidden="true">/</span>
          <span>{portfolioData.location[lang]}</span>
          {portfolioData.social.map((link) => (
            <span key={link.name} className="about-meta-item">
              <span aria-hidden="true">/</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.name}
              </a>
            </span>
          ))}
        </p>
      </section>

      <hr className="section-rule" />

      <section id="experience" className="section" aria-labelledby="experience-title">
        <h2 id="experience-title" className="section-title">{t.experience}</h2>
        <ol className="timeline">
          {portfolioData.experience.map((job) => (
            <li key={job.company + job.start} className="timeline-item">
              <span className="timeline-dot" aria-hidden="true" />
              <p className="timeline-period">{period(job.start, job.end)}</p>
              <p className="timeline-heading">
                <strong>{job.role}</strong>, {job.company} · {job.location[lang]}
              </p>
              <ul className="timeline-points">
                {job.highlights[lang].map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <ul className="chips" aria-label="Stack">
                {job.stack.map((tech) => (
                  <li key={tech} className="chip">{tech}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <hr className="section-rule" />

      <section id="education" className="section" aria-labelledby="education-title">
        <h2 id="education-title" className="section-title">{t.education}</h2>
        <ol className="timeline">
          {portfolioData.education.map((item) => (
            <li key={item.school} className="timeline-item">
              <span className="timeline-dot" aria-hidden="true" />
              <p className="timeline-period">{period(item.start, item.end)}</p>
              <p className="timeline-heading">
                <strong>{item.degree[lang]}</strong>, {item.school}
              </p>
              {item.note && <p className="timeline-note">{item.note[lang]}</p>}
            </li>
          ))}
        </ol>

        <div className="cert-grid">
          {portfolioData.certifications.map((cert) => (
            <article key={cert.id} className="cert-card">
              <span className="cert-icon" aria-hidden="true">{cert.icon}</span>
              <div>
                <h3 className="cert-name">{cert.name}</h3>
                <p className="cert-meta">
                  {cert.issuer} · {cert.credential[lang]} · {cert.year}
                </p>
                <a
                  className="cert-link"
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.viewCredential} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <hr className="section-rule" />

      <section id="skills" className="section" aria-labelledby="skills-title">
        <h2 id="skills-title" className="section-title">{t.skills}</h2>
        <dl className="skills-list">
          {portfolioData.skills.map((group) => (
            <div key={group.category.en} className="skills-row">
              <dt>{group.category[lang]}</dt>
              <dd>{group.items.join(", ")}.</dd>
            </div>
          ))}
          <div className="skills-row">
            <dt>{t.spokenLanguages}</dt>
            <dd>
              {portfolioData.spokenLanguages
                .map((l) => `${l.name[lang]} (${l.level[lang]})`)
                .join(", ")}
              .
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
