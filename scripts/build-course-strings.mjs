// Builds assets/course/strings.js for the web course (/course/) from the app's own locale
// files, so the browser says exactly what the iPhone app says, plus the few lines only the web
// needs. Run after the app's locales change:
//
//   node scripts/build-course-strings.mjs [path/to/winelingo-app/prototype/locales]
//
// Default app path: ~/dev/winelingo-app/prototype/locales.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.argv[2] ?? join(homedir(), "dev/winelingo-app/prototype/locales");
const LANGS = ["en", "da", "es", "de"];

// What the course uses from the app. Whole namespaces, except onboarding (a handful of keys).
const NAMESPACES = ["common", "auth", "learn", "hearts", "lessonTopics", "experience", "goal", "countries"];
const ONBOARDING = ["levelQ", "levelSub", "countriesQ", "countriesAll", "countriesNone", "countriesChangeLater",
  "goalQ", "goalCommit", "continue", "back", "signOut", "saving", "saveError"];

// Lines only the web course needs. Same voice as the app: plain, warm, short.
const WEB = {
  en: {
    loading: "Loading…",
    tagline: "The whole course, in your browser. The same account as in the app.",
    noAccount: "New here? Create an account with your email and a password.",
    appleSoon: "Signed up in the app with Apple? Apple sign-in on the web is coming soon. Until then, use the app.",
    signOut: "Sign out",
    xpToday: "{{xp}} of {{goal}} XP today",
    streak_one: "{{count}} day streak",
    streak_other: "{{count}} day streak",
    noStreak: "No streak yet",
    continueTitle: "Up next",
    continueBtn: "Start the lesson",
    allDone: "You've finished every lesson. Take any of them again for new questions.",
    showLessons: "Show lessons",
    hideLessons: "Hide lessons",
    changeCountries: "Your countries",
    getApp: "Get the app",
    heartsInApp: "Premium is bought in the iPhone app, and then works here too, on the same account.",
    openAppStore: "Open the App Store",
    language: "Language",
    welcomeTitle: "Welcome to Winelingo",
    welcomeBody: "Three quick questions, and your course is ready.",
    stepOf: "{{n}} of {{total}}",
    keyHint: "Tip: press Enter to check and continue, and 1–4 to pick an answer.",
    passwordSaved: "Your new password is saved.",
    confirmed: "Your email is confirmed. Welcome!",
    footer: "For adults of legal drinking age (18+). Please enjoy wine responsibly.",
  },
  da: {
    loading: "Henter…",
    tagline: "Hele kurset i din browser. Den samme konto som i appen.",
    noAccount: "Ny her? Opret en konto med din mail og en adgangskode.",
    appleSoon: "Oprettede du dig i appen med Apple? Log ind med Apple kommer snart på nettet. Indtil da kan du bruge appen.",
    signOut: "Log ud",
    xpToday: "{{xp}} af {{goal}} XP i dag",
    streak_one: "{{count}} dags stime",
    streak_other: "{{count}} dages stime",
    noStreak: "Ingen stime endnu",
    continueTitle: "Næste lektion",
    continueBtn: "Start lektionen",
    allDone: "Du har taget alle lektionerne. Tag en hvilken som helst igen, og få nye spørgsmål.",
    showLessons: "Vis lektioner",
    hideLessons: "Skjul lektioner",
    changeCountries: "Dine lande",
    getApp: "Hent appen",
    heartsInApp: "Premium købes i iPhone-appen og virker derefter også her, på den samme konto.",
    openAppStore: "Åbn App Store",
    language: "Sprog",
    welcomeTitle: "Velkommen til Winelingo",
    welcomeBody: "Tre hurtige spørgsmål, så er dit kursus klar.",
    stepOf: "{{n}} af {{total}}",
    keyHint: "Tip: tryk Enter for at tjekke og gå videre, og 1–4 for at vælge et svar.",
    passwordSaved: "Din nye adgangskode er gemt.",
    confirmed: "Din mail er bekræftet. Velkommen!",
    footer: "For voksne over 18 år. Nyd vin med omtanke.",
  },
  es: {
    loading: "Cargando…",
    tagline: "Todo el curso en tu navegador. La misma cuenta que en la app.",
    noAccount: "¿Eres nuevo? Crea una cuenta con tu correo y una contraseña.",
    appleSoon: "¿Te registraste en la app con Apple? Pronto podrás iniciar sesión con Apple en la web. Mientras tanto, usa la app.",
    signOut: "Cerrar sesión",
    xpToday: "{{xp}} de {{goal}} XP hoy",
    streak_one: "Racha de {{count}} día",
    streak_other: "Racha de {{count}} días",
    noStreak: "Aún sin racha",
    continueTitle: "Siguiente lección",
    continueBtn: "Empezar la lección",
    allDone: "Has terminado todas las lecciones. Repite cualquiera para ver preguntas nuevas.",
    showLessons: "Ver lecciones",
    hideLessons: "Ocultar lecciones",
    changeCountries: "Tus países",
    getApp: "Descarga la app",
    heartsInApp: "Premium se compra en la app de iPhone y después funciona también aquí, con la misma cuenta.",
    openAppStore: "Abrir el App Store",
    language: "Idioma",
    welcomeTitle: "Te damos la bienvenida a Winelingo",
    welcomeBody: "Tres preguntas rápidas y tu curso estará listo.",
    stepOf: "{{n}} de {{total}}",
    keyHint: "Consejo: pulsa Intro para comprobar y continuar, y 1–4 para elegir una respuesta.",
    passwordSaved: "Tu nueva contraseña se ha guardado.",
    confirmed: "Tu correo está confirmado. ¡Bienvenido!",
    footer: "Para mayores de edad (18+). Disfruta del vino con responsabilidad.",
  },
  de: {
    loading: "Wird geladen…",
    tagline: "Der ganze Kurs im Browser. Dasselbe Konto wie in der App.",
    noAccount: "Neu hier? Erstelle ein Konto mit deiner E-Mail und einem Passwort.",
    appleSoon: "Hast du dich in der App mit Apple angemeldet? Die Anmeldung mit Apple kommt bald ins Web. Bis dahin nutze die App.",
    signOut: "Abmelden",
    xpToday: "{{xp}} von {{goal}} XP heute",
    streak_one: "{{count}} Tag Serie",
    streak_other: "{{count}} Tage Serie",
    noStreak: "Noch keine Serie",
    continueTitle: "Als Nächstes",
    continueBtn: "Lektion starten",
    allDone: "Du hast alle Lektionen abgeschlossen. Wiederhole eine beliebige für neue Fragen.",
    showLessons: "Lektionen zeigen",
    hideLessons: "Lektionen ausblenden",
    changeCountries: "Deine Länder",
    getApp: "App laden",
    heartsInApp: "Premium kaufst du in der iPhone-App, und es gilt dann auch hier, mit demselben Konto.",
    openAppStore: "App Store öffnen",
    language: "Sprache",
    welcomeTitle: "Willkommen bei Winelingo",
    welcomeBody: "Drei kurze Fragen, dann ist dein Kurs bereit.",
    stepOf: "{{n}} von {{total}}",
    keyHint: "Tipp: Drücke Enter zum Prüfen und Weitergehen und 1–4, um eine Antwort zu wählen.",
    passwordSaved: "Dein neues Passwort ist gespeichert.",
    confirmed: "Deine E-Mail ist bestätigt. Willkommen!",
    footer: "Für Erwachsene ab 18 Jahren. Bitte genieße Wein verantwortungsvoll.",
  },
};

const out = {};
for (const l of LANGS) {
  const src = JSON.parse(readFileSync(join(SRC, `${l}.json`), "utf8"));
  const o = {};
  for (const ns of NAMESPACES) {
    if (!src[ns]) throw new Error(`${l}.json has no "${ns}"`);
    o[ns] = src[ns];
  }
  o.onboarding = Object.fromEntries(ONBOARDING.filter((k) => src.onboarding?.[k] != null).map((k) => [k, src.onboarding[k]]));
  o.web = WEB[l];
  out[l] = o;
}
// Every web key in every language, so a missing translation fails here and not in a lesson.
for (const l of LANGS) for (const k of Object.keys(WEB.en)) if (!WEB[l][k]) throw new Error(`web.${k} missing in ${l}`);

const js = `/* Generated by scripts/build-course-strings.mjs from the app's locales. Do not edit by hand. */\n` +
  `window.WL_STRINGS = ${JSON.stringify(out)};\n`;
writeFileSync(join(ROOT, "assets/course/strings.js"), js);
console.log(`assets/course/strings.js: ${LANGS.join(", ")} · ${(js.length / 1024).toFixed(0)} KB`);
