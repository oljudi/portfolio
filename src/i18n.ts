export type Lang = "en" | "es";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

// Saved choice first, then the browser's language, then English.
export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "es") return saved;
  } catch {
    // Storage blocked (private mode) — fall through.
  }
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // Non-essential; the page still works without persistence.
  }
}

const en = {
  skip: "Skip to content",
  langGroup: "Language",
  menu: "Menu",
  nav: { about: "about", experience: "career path", education: "education", skills: "skills" },
  about: "About",
  experience: "Career Path",
  education: "Education & Certifications",
  skills: "Skills",
  spokenLanguages: "Languages",
  present: "present",
  viewCredential: "View credential",
  footer: ["Made with", "by", "and"],
  term: {
    boot: ["booting neural interface...", "mounting /dev/portfolio ......... OK", "establishing uplink ............ OK", "identity confirmed:"],
    welcome: ["Type 'help' to see available commands.", "Commands are case insensitive."],
    helpTitle: "AVAILABLE COMMANDS",
    help: {
      help: "Show this message",
      skills: "My tech stack",
      projects: "What I've built",
      certs: "Certifications & credentials",
      contact: "Get in touch",
      clear: "Wipe the terminal",
    },
    hint: "Hint: ↑/↓ recalls history, Tab autocompletes.",
    skillsTitle: "TECH STACK",
    projectsTitle: "PROJECTS",
    certsTitle: "CERTIFICATIONS",
    contactTitle: "GET IN TOUCH",
    notFound: "command not found:",
    tryHelp: "Type 'help' for the list of commands.",
    tryLabel: "try:",
    inputLabel: "Terminal command input",
  },
};

// Typed against `en`, so a missing Spanish key fails the build.
export const UI: Record<Lang, typeof en> = {
  en,
  es: {
    skip: "Saltar al contenido",
    langGroup: "Idioma",
    menu: "Menú",
    nav: { about: "sobre mí", experience: "trayectoria", education: "formación", skills: "habilidades" },
    about: "Sobre mí",
    experience: "Trayectoria",
    education: "Formación y certificaciones",
    skills: "Habilidades",
    spokenLanguages: "Idiomas",
    present: "actualidad",
    viewCredential: "Ver credencial",
    footer: ["Hecho con", "por", "y"],
    term: {
      boot: ["iniciando interfaz neuronal...", "montando /dev/portfolio ......... OK", "estableciendo enlace ............ OK", "identidad confirmada:"],
      welcome: ["Escribe 'help' para ver los comandos disponibles.", "Los comandos no distinguen mayúsculas."],
      helpTitle: "COMANDOS DISPONIBLES",
      help: {
        help: "Muestra este mensaje",
        skills: "Mi stack tecnológico",
        projects: "Lo que he construido",
        certs: "Certificaciones y credenciales",
        contact: "Contáctame",
        clear: "Limpia la terminal",
      },
      hint: "Tip: ↑/↓ recorre el historial, Tab autocompleta.",
      skillsTitle: "STACK TECNOLÓGICO",
      projectsTitle: "PROYECTOS",
      certsTitle: "CERTIFICACIONES",
      contactTitle: "CONTACTO",
      notFound: "comando no encontrado:",
      tryHelp: "Escribe 'help' para ver la lista de comandos.",
      tryLabel: "prueba:",
      inputLabel: "Entrada de comandos de la terminal",
    },
  },
};
