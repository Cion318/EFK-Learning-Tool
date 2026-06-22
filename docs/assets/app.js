/**
 * EFK Learning Tool – app.js
 * Vollständige clientseitige SPA-Logik
 * Kein Build-Prozess, kein Framework – reines modernes JavaScript.
 *
 * Struktur:
 *  1. Konstanten & Konfiguration
 *  2. Übersetzungen (i18n)
 *  3. Store (State + localStorage)
 *  4. Router
 *  5. Utility-Funktionen
 *  6. Datenlader (Chapter/JSON fetching)
 *  7. Home-View
 *  8. Learn-Setup-View
 *  9. Learn-Play-View
 * 10. Exam-Setup-View
 * 11. Exam-Play-View
 * 12. Exam-Result-View
 * 13. History-View
 * 14. Init
 */

'use strict';

/* =====================================================================
   1. KONSTANTEN & KONFIGURATION
   ===================================================================== */

const CONFIG = {
  EXAM_QUESTIONS:      20,
  EXAM_WISSEN_TOTAL:   15,
  EXAM_WISSEN_LEICHT:   5,
  EXAM_WISSEN_MITTEL:   5,
  EXAM_WISSEN_SCHWER:   5,
  EXAM_RECHNUNG_TOTAL:  5,
  EXAM_RECHNUNG_LEICHT: 2,
  EXAM_RECHNUNG_MITTEL: 2,
  EXAM_RECHNUNG_SCHWER: 1,
  EXAM_DURATION_SEC:    60 * 60,   // 60 Minuten
  PASS_THRESHOLD:       0.50,      // 50 %
  TIMER_WARNING_SEC:    5 * 60,    // Letzten 5 Minuten = Warnung
  HISTORY_MAX:          20,
  DEFAULT_LANG:         'de',
};

const LS_KEYS = {
  LANG:       'efk_lang',
  EXAM_STATE: 'efk_exam_state',
  HISTORY:    'efk_history',
};

/**
 * Berechnet den Basis-URL-Pfad der App dynamisch.
 *
 * Warum: GitHub Pages liefert die App unter einem Subpfad aus
 * (https://user.github.io/repo-name/). Alle JSON-Fetches müssen
 * absolut aufgelöst werden, damit sie unter jedem Deployment-Pfad
 * funktionieren – auch wenn index.html in docs/ liegt.
 *
 * Strategie (Fallback-Kette):
 * 1. data-base Attribut auf dem <script>-Tag (explizit, zuverlässigste Methode)
 * 2. Pfad der aktuellen Seite (window.location)
 */
const BASE_URL = (() => {
  // Berechnet den absoluten Basispfad zur index.html.
  // Strategie: Pfad von window.location.href ableiten –
  // das ist immer korrekt, egal ob GitHub Pages, Live Server oder
  // python3 -m http.server. Der Pfad endet immer auf /docs/ (oder
  // dem Verzeichnis, in dem index.html liegt).
  //
  // Beispiele:
  //   https://user.github.io/repo/          → https://user.github.io/repo/
  //   https://user.github.io/repo/index.html→ https://user.github.io/repo/
  //   http://localhost:8080/                 → http://localhost:8080/
  //   http://127.0.0.1:5500/docs/           → http://127.0.0.1:5500/docs/
  //   http://127.0.0.1:5500/docs/index.html → http://127.0.0.1:5500/docs/
  const loc = window.location.href.split('?')[0].split('#')[0];
  const base = loc.endsWith('/') ? loc : loc.replace(/\/[^/]*$/, '/');
  console.debug('[EFK] BASE_URL:', base);
  return base;
})();

// Einmalige Cache-Busting-Version für diesen Seitenaufruf.
// Verhindert, dass der Browser veraltete JSON-Dateien aus dem HTTP-Cache
// zurückgibt. Ändert sich nur bei einem echten Seiten-Reload.
const APP_VERSION = Date.now();

/* =====================================================================
   2. ÜBERSETZUNGEN (i18n)
   ===================================================================== */

const I18N = {
  de: {
    // Header
    tagline: 'Lernplattform für IHK Elektrofachkraft',
    // Home
    home_eyebrow:         'IHK Elektrofachkraft für Industrie',
    home_title_1:         'Lernen & Prüfen –',
    home_title_2:         'strukturiert zum Ziel',
    home_desc:            'Übe mit Kapitel-Fragen im Lernmodus oder simuliere eine echte IHK-Prüfung mit 20 Fragen und 60 Minuten Zeitlimit.',
    mode_learn_title:     'Lernmodus',
    mode_learn_desc:      'Zufällige Fragen aus einem oder allen Kapiteln – mit sofortigem Feedback und Erklärung.',
    mode_exam_title:      'Prüfungsmodus',
    mode_exam_desc:       '20 Fragen, 60 Minuten, strikte Typ-Verteilung – genau wie die echte IHK-Prüfung.',
    mode_history_title:   'Verlauf & Statistik',
    mode_history_desc:    'Die letzten 20 abgeschlossenen Prüfungen auf einen Blick.',
    stats_title:          'Deine Statistik',
    stat_last:            'Letzter Versuch',
    stat_best:            'Bester Versuch',
    stat_avg:             'Durchschnitt',
    stat_count:           'Prüfungen',
    stat_pass_rate:       'Bestehensquote',
    stat_best_chapter:    'Bestes Kapitel',
    no_data:              '–',
    // Setup common
    chapter_all:          'Alle Kapitel',
    type_all:             'Alle',
    type_wissen:          'Wissen',
    type_rechnung:        'Rechnung',
    diff_all:             'Alle',
    diff_leicht:          'Leicht',
    diff_mittel:          'Mittel',
    diff_schwer:          'Schwer',
    btn_start:            'Starten',
    btn_back:             'Zurück',
    btn_next_q:           'Nächste Frage',
    btn_finish:           'Prüfung abschließen',
    btn_new_exam:         'Neue Prüfung',
    btn_to_home:          'Zur Startseite',
    loading:              'Lade Fragen …',
    // Learn Setup
    learn_setup_title:    'Lernmodus einrichten',
    learn_chapter_label:  'Kapitel',
    learn_type_label:     'Fragetyp',
    learn_diff_label:     'Schwierigkeitsgrad',
    // Learn Play
    question_label:       'Frage',
    correct_answer:       'Richtige Antwort:',
    your_answer:          'Deine Antwort:',
    feedback_correct:     '✓ Richtig!',
    feedback_wrong:       '✗ Falsch',
    explanation:          'Erklärung:',
    no_questions_found:   'Keine Fragen für diese Filterauswahl gefunden.',
    // Exam Setup
    exam_setup_title:     'Prüfungsmodus einrichten',
    exam_chapter_label:   'Kapitel für die Prüfung',
    exam_info:            'Die Prüfung besteht immer aus 20 Fragen: 15 Wissens- und 5 Rechenfragen, jeweils in drei Schwierigkeitsgraden. Zeitlimit: 60 Minuten.',
    exam_restore_title:   'Offene Prüfung gefunden',
    exam_restore_msg:     'Du hast eine unterbrochene Prüfung. Möchtest du dort weitermachen?',
    exam_restore_yes:     'Weiter',
    exam_restore_no:      'Neue Prüfung starten',
    not_enough_questions: 'Nicht genug Fragen: Für die Prüfung werden benötigt: ',
    // Exam Play
    exam_title:           'Prüfung',
    total_timer:          'Verbleibende Zeit',
    question_timer_label: 'Zeit für diese Frage',
    unanswered:           'Unbeantwortet',
    answered:             'Beantwortet',
    // Exam Confirm
    confirm_finish_title: 'Prüfung abschließen?',
    confirm_finish_msg:   (unanswered) => `Du hast noch ${unanswered} Frage(n) nicht beantwortet. Nicht beantwortete Fragen zählen als falsch.`,
    confirm_yes:          'Jetzt abschließen',
    confirm_no:           'Weiter bearbeiten',
    // Exam Result
    result_title:         'Auswertung',
    result_pass:          'Bestanden ✓',
    result_fail:          'Nicht bestanden ✗',
    result_score:         'Ergebnis',
    result_total_time:    'Gesamtzeit',
    result_correct:       'Richtig',
    result_of:            'von',
    result_questions:     'Fragen',
    result_details:       'Detailauswertung',
    result_q_time:        'Zeit:',
    result_given:         'Gegeben:',
    result_correct_ans:   'Korrekt:',
    result_unanswered:    'Nicht beantwortet',
    // History
    history_title:        'Prüfungsverlauf',
    history_empty:        'Noch keine abgeschlossenen Prüfungen.',
    history_clear:        'Verlauf löschen',
    col_date:             'Datum',
    col_chapter:          'Kapitel',
    col_score:            'Ergebnis',
    col_time:             'Zeit',
    col_status:           'Status',
    col_lang:             'Sprache',
    status_pass:          'Bestanden',
    status_fail:          'Nicht bestanden',
    // Errors
    err_load_index:       'Fehler beim Laden der Kapitel-Konfiguration (chapters/index.json). Bitte prüfe die Datei.',
    err_load_chapter:     'Fehler beim Laden des Kapitels',
    err_invalid_json:     'Ungültige JSON-Struktur in',
    err_missing_fields:   'Fehlende Pflichtfelder in',
    err_lang_mismatch:    'DE/EN-Dateien haben unterschiedliche Fragen-IDs für Kapitel',
  },

  en: {
    tagline: 'Learning Platform for IHK Electrically Skilled Person',
    home_eyebrow:         'IHK Electrically Skilled Person for Industry',
    home_title_1:         'Learn & Practice –',
    home_title_2:         'structured towards your goal',
    home_desc:            'Practice with chapter questions in learning mode or simulate a real IHK exam with 20 questions and a 60-minute time limit.',
    mode_learn_title:     'Learning Mode',
    mode_learn_desc:      'Random questions from one or all chapters – with immediate feedback and explanation.',
    mode_exam_title:      'Exam Mode',
    mode_exam_desc:       '20 questions, 60 minutes, strict type distribution – just like the real IHK exam.',
    mode_history_title:   'History & Statistics',
    mode_history_desc:    'Your last 20 completed exams at a glance.',
    stats_title:          'Your Statistics',
    stat_last:            'Last Attempt',
    stat_best:            'Best Attempt',
    stat_avg:             'Average',
    stat_count:           'Exams',
    stat_pass_rate:       'Pass Rate',
    stat_best_chapter:    'Best Chapter',
    no_data:              '–',
    chapter_all:          'All Chapters',
    type_all:             'All',
    type_wissen:          'Knowledge',
    type_rechnung:        'Calculation',
    diff_all:             'All',
    diff_leicht:          'Easy',
    diff_mittel:          'Medium',
    diff_schwer:          'Hard',
    btn_start:            'Start',
    btn_back:             'Back',
    btn_next_q:           'Next Question',
    btn_finish:           'Finish Exam',
    btn_new_exam:         'New Exam',
    btn_to_home:          'Go to Home',
    loading:              'Loading questions …',
    learn_setup_title:    'Set up Learning Mode',
    learn_chapter_label:  'Chapter',
    learn_type_label:     'Question Type',
    learn_diff_label:     'Difficulty',
    question_label:       'Question',
    correct_answer:       'Correct answer:',
    your_answer:          'Your answer:',
    feedback_correct:     '✓ Correct!',
    feedback_wrong:       '✗ Wrong',
    explanation:          'Explanation:',
    no_questions_found:   'No questions found for this filter selection.',
    exam_setup_title:     'Set up Exam Mode',
    exam_chapter_label:   'Chapter for the Exam',
    exam_info:            'The exam always consists of 20 questions: 15 knowledge and 5 calculation questions, in three difficulty levels each. Time limit: 60 minutes.',
    exam_restore_title:   'Open Exam Found',
    exam_restore_msg:     'You have an interrupted exam. Do you want to continue where you left off?',
    exam_restore_yes:     'Continue',
    exam_restore_no:      'Start New Exam',
    not_enough_questions: 'Not enough questions: The exam requires: ',
    exam_title:           'Exam',
    total_timer:          'Remaining Time',
    question_timer_label: 'Time for this question',
    unanswered:           'Unanswered',
    answered:             'Answered',
    confirm_finish_title: 'Finish Exam?',
    confirm_finish_msg:   (unanswered) => `You still have ${unanswered} unanswered question(s). Unanswered questions count as wrong.`,
    confirm_yes:          'Finish Now',
    confirm_no:           'Keep Working',
    result_title:         'Results',
    result_pass:          'Passed ✓',
    result_fail:          'Failed ✗',
    result_score:         'Score',
    result_total_time:    'Total Time',
    result_correct:       'Correct',
    result_of:            'of',
    result_questions:     'Questions',
    result_details:       'Detailed Results',
    result_q_time:        'Time:',
    result_given:         'Given:',
    result_correct_ans:   'Correct:',
    result_unanswered:    'Not answered',
    history_title:        'Exam History',
    history_empty:        'No completed exams yet.',
    history_clear:        'Clear History',
    col_date:             'Date',
    col_chapter:          'Chapter',
    col_score:            'Score',
    col_time:             'Time',
    col_status:           'Status',
    col_lang:             'Language',
    status_pass:          'Passed',
    status_fail:          'Failed',
    err_load_index:       'Error loading chapter configuration (chapters/index.json). Please check the file.',
    err_load_chapter:     'Error loading chapter',
    err_invalid_json:     'Invalid JSON structure in',
    err_missing_fields:   'Missing required fields in',
    err_lang_mismatch:    'DE/EN files have different question IDs for chapter',
  },
};

/* =====================================================================
   3. STORE (zentraler State + localStorage-Persistenz)
   ===================================================================== */

const Store = (() => {
  // --- Sprache ---
  let _lang = localStorage.getItem(LS_KEYS.LANG) || CONFIG.DEFAULT_LANG;

  // --- Geladene Kapitel (gecacht, nach Sprache getrennt) ---
  // { lang: { key: [ {id, type, difficulty, question, answers, correct_answer, explanation, _chapterKey} ] } }
  const _chapterCache = {};

  // --- Kapitelindex (aus chapters/index.json) ---
  let _chapterIndex = null; // [{ key, label }]

  // --- Exam-State (laufende Prüfung, in localStorage gespiegelt) ---
  let _examState = null;

  // --- History ---
  let _history = JSON.parse(localStorage.getItem(LS_KEYS.HISTORY) || '[]');

  // --- Learn-Zufall-Tracker ---
  // Welche zusammengesetzten Keys (KAPITEL::ID) wurden bereits gezeigt?
  let _learnShownKeys = new Set();

  function t(key, ...args) {
    const val = I18N[_lang][key];
    return typeof val === 'function' ? val(...args) : (val ?? key);
  }

  function getLang()  { return _lang; }
  function setLang(l) {
    _lang = l;
    localStorage.setItem(LS_KEYS.LANG, l);
  }

  function getChapterIndex() { return _chapterIndex; }
  function setChapterIndex(idx) { _chapterIndex = idx; }

  function getCachedChapter(lang, key) {
    return _chapterCache[lang]?.[key] ?? null;
  }
  function setCachedChapter(lang, key, questions) {
    if (!_chapterCache[lang]) _chapterCache[lang] = {};
    _chapterCache[lang][key] = questions;
  }

  // --- Exam State ---
  function getExamState() { return _examState; }
  function setExamState(state) {
    _examState = state;
    if (state === null) {
      localStorage.removeItem(LS_KEYS.EXAM_STATE);
    } else {
      localStorage.setItem(LS_KEYS.EXAM_STATE, JSON.stringify(state));
    }
  }
  function loadExamStateFromStorage() {
    const raw = localStorage.getItem(LS_KEYS.EXAM_STATE);
    if (!raw) return null;
    try {
      _examState = JSON.parse(raw);
      return _examState;
    } catch {
      localStorage.removeItem(LS_KEYS.EXAM_STATE);
      return null;
    }
  }

  // --- History ---
  function getHistory() { return _history; }
  function pushHistory(entry) {
    _history.unshift(entry);
    if (_history.length > CONFIG.HISTORY_MAX) _history = _history.slice(0, CONFIG.HISTORY_MAX);
    localStorage.setItem(LS_KEYS.HISTORY, JSON.stringify(_history));
  }
  function clearHistory() {
    _history = [];
    localStorage.removeItem(LS_KEYS.HISTORY);
  }

  // --- Learn-Tracker ---
  function getLearnShownKeys() { return _learnShownKeys; }
  function resetLearnShownKeys() { _learnShownKeys = new Set(); }
  function addLearnShownKey(k)   { _learnShownKeys.add(k); }

  return {
    t, getLang, setLang,
    getChapterIndex, setChapterIndex,
    getCachedChapter, setCachedChapter,
    getExamState, setExamState, loadExamStateFromStorage,
    getHistory, pushHistory, clearHistory,
    getLearnShownKeys, resetLearnShownKeys, addLearnShownKey,
  };
})();

/* =====================================================================
   4. ROUTER (minimaler View-Router)
   ===================================================================== */

const Router = (() => {
  const views = {};
  let _current = null;
  let _currentParams = {};

  function register(id, { onEnter, onLeave } = {}) {
    views[id] = { onEnter, onLeave };
  }

  function navigate(id, params = {}) {
    // Verlasse aktuelle View
    if (_current) {
      const el = document.getElementById(_current);
      if (el) el.classList.remove('active');
      views[_current]?.onLeave?.();
    }
    _current = id;
    _currentParams = params;
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    views[id]?.onEnter?.(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function current() { return _current; }
  function currentParams() { return _currentParams; }

  return { register, navigate, current, currentParams };
})();

/* =====================================================================
   5. UTILITY-FUNKTIONEN
   ===================================================================== */

/** Fisher-Yates Shuffle (in-place, gibt Array zurück) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Formatiert Sekunden als mm:ss oder hh:mm:ss */
function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

/** Gibt den zusammengesetzten Schlüssel zurück */
function compositeKey(chapterKey, id) { return `${chapterKey}::${id}`; }

/** Escaped HTML um XSS zu verhindern */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Gibt den sprachspezifischen Anzeigetext eines Kapitel-Eintrags zurück.
 * Reihenfolge: labelDe/labelEn (je nach Sprache) → label (Fallback) → key
 */
function chapterLabel(ch) {
  if (!ch) return '?';
  const lang = Store.getLang();
  if (lang === 'en' && ch.labelEn) return ch.labelEn;
  if (lang === 'de' && ch.labelDe) return ch.labelDe;
  // Fallback für alte index.json ohne labelDe/labelEn
  if (ch.label) return ch.label;
  return ch.key ?? '?';
}

/** Datum lesbar formatieren */
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString(Store.getLang() === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Zeigt eine Alert-Box an einer Ziel-Element-ID */
function showAlert(containerId, message, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert--${type}">${escHtml(message)}</div>`;
}

/** Leert einen Container */
function clearEl(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

/* =====================================================================
   6. DATENLADER (fetch-basiert, mit Caching & Validierung)
   ===================================================================== */

/**
 * Lädt chapters/index.json (einmalig gecacht).
 * Gibt Array von { key, label } zurück.
 */
async function loadChapterIndex() {
  if (Store.getChapterIndex()) return Store.getChapterIndex();
  const resp = await fetch(`${BASE_URL}chapters/index.json?v=${APP_VERSION}`);
  if (!resp.ok) throw new Error(Store.t('err_load_index'));
  const data = await resp.json();
  if (!Array.isArray(data.chapters)) throw new Error(Store.t('err_load_index'));
  Store.setChapterIndex(data.chapters);
  return data.chapters;
}

/**
 * Lädt eine einzelne Kapiteldatei.
 * Validiert die JSON-Struktur und gibt Array von Fragen zurück (mit _chapterKey angereichert).
 */
async function loadChapter(lang, key) {
  const cached = Store.getCachedChapter(lang, key);
  if (cached) return cached;

  const path = `${BASE_URL}chapters/${lang}/${key}.json`;
  const resp = await fetch(`${path}?v=${APP_VERSION}`);
  if (!resp.ok) throw new Error(`${Store.t('err_load_chapter')}: ${key} (${lang})`);

  let data;
  try { data = await resp.json(); }
  catch { throw new Error(`${Store.t('err_invalid_json')} ${key}.json`); }

  validateChapterData(data, key, lang);

  // Fragen mit _chapterKey anreichern
  const questions = data.questions.map(q => ({ ...q, _chapterKey: key }));
  Store.setCachedChapter(lang, key, questions);
  return questions;
}

/**
 * Validiert Kapitel-JSON.
 */
function validateChapterData(data, key, lang) {
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error(`${Store.t('err_missing_fields')} ${key}.json: "questions" Array fehlt oder ist leer.`);
  }
  const REQUIRED = ['id', 'type', 'difficulty', 'question', 'answers', 'correct_answer', 'explanation'];
  const VALID_TYPES = ['wissen', 'rechnung'];
  const VALID_DIFFS = ['leicht', 'mittel', 'schwer'];

  data.questions.forEach((q, i) => {
    REQUIRED.forEach(field => {
      if (q[field] === undefined || q[field] === null) {
        throw new Error(`${Store.t('err_missing_fields')} ${key}.json: Frage ${i + 1} fehlt Feld "${field}".`);
      }
    });
    if (!VALID_TYPES.includes(q.type)) {
      throw new Error(`${key}.json Frage ${q.id}: Ungültiger type "${q.type}" (erlaubt: wissen, rechnung).`);
    }
    if (!VALID_DIFFS.includes(q.difficulty)) {
      throw new Error(`${key}.json Frage ${q.id}: Ungültige difficulty "${q.difficulty}".`);
    }
    const ansKeys = Object.keys(q.answers);
    if (ansKeys.length < 2) {
      throw new Error(`${key}.json Frage ${q.id}: Zu wenige Antwortoptionen.`);
    }
    if (!q.answers[q.correct_answer]) {
      throw new Error(`${key}.json Frage ${q.id}: correct_answer "${q.correct_answer}" existiert nicht in answers.`);
    }
  });
}

/**
 * Lädt alle Kapitel für eine Sprache.
 */
async function loadAllChapters(lang) {
  const index = await loadChapterIndex();
  const allQuestions = [];
  for (const ch of index) {
    const qs = await loadChapter(lang, ch.key);
    allQuestions.push(...qs);
  }
  return allQuestions;
}

/* =====================================================================
   7. HOME VIEW
   ===================================================================== */

function renderHome() {
  const t = k => Store.t(k);
  const history = Store.getHistory();

  // Stats berechnen
  let lastPct = null, bestPct = null, sumPct = 0, passCount = 0;
  let chapterScores = {}; // key -> { sum, count }

  history.forEach(h => {
    const pct = h.percent;
    if (lastPct === null) lastPct = pct;
    if (bestPct === null || pct > bestPct) bestPct = pct;
    sumPct += pct;
    if (h.passed) passCount++;
    const chKey = h.chapter;
    if (!chapterScores[chKey]) chapterScores[chKey] = { sum: 0, count: 0 };
    chapterScores[chKey].sum += pct;
    chapterScores[chKey].count++;
  });

  const avgPct = history.length ? Math.round(sumPct / history.length) : null;
  const passRate = history.length ? Math.round((passCount / history.length) * 100) : null;

  // Bestes Kapitel berechnen
  let bestChapter = null;
  let bestChAvg = -1;
  Object.entries(chapterScores).forEach(([key, { sum, count }]) => {
    const avg = sum / count;
    if (avg > bestChAvg) { bestChAvg = avg; bestChapter = key; }
  });

  const fmtPct = v => v !== null ? `${Math.round(v)} %` : t('no_data');

  document.getElementById('view-home').innerHTML = `
    <div class="home-hero">
      <div class="home-hero__eyebrow">${escHtml(t('home_eyebrow'))}</div>
      <h1 class="home-hero__title">
        ${escHtml(t('home_title_1'))} <span>${escHtml(t('home_title_2'))}</span>
      </h1>
      <p class="home-hero__description">${escHtml(t('home_desc'))}</p>
    </div>

    <div class="mode-grid">
      <button class="mode-card mode-card--learn" id="btn-go-learn">
        <div class="mode-card__icon">📖</div>
        <div class="mode-card__title">${escHtml(t('mode_learn_title'))}</div>
        <div class="mode-card__desc">${escHtml(t('mode_learn_desc'))}</div>
      </button>
      <button class="mode-card mode-card--exam" id="btn-go-exam">
        <div class="mode-card__icon">📝</div>
        <div class="mode-card__title">${escHtml(t('mode_exam_title'))}</div>
        <div class="mode-card__desc">${escHtml(t('mode_exam_desc'))}</div>
      </button>
      <button class="mode-card mode-card--history" id="btn-go-history">
        <div class="mode-card__icon">📊</div>
        <div class="mode-card__title">${escHtml(t('mode_history_title'))}</div>
        <div class="mode-card__desc">${escHtml(t('mode_history_desc'))}</div>
      </button>
    </div>

    <div class="card">
      <div class="card__header">
        <div class="card__title">${escHtml(t('stats_title'))}</div>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-item__value">${fmtPct(lastPct)}</div>
          <div class="stat-item__label">${escHtml(t('stat_last'))}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__value">${fmtPct(bestPct)}</div>
          <div class="stat-item__label">${escHtml(t('stat_best'))}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__value">${fmtPct(avgPct)}</div>
          <div class="stat-item__label">${escHtml(t('stat_avg'))}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__value">${history.length}</div>
          <div class="stat-item__label">${escHtml(t('stat_count'))}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__value">${passRate !== null ? passRate + ' %' : t('no_data')}</div>
          <div class="stat-item__label">${escHtml(t('stat_pass_rate'))}</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__value" style="font-size:1rem">${escHtml(bestChapter ?? t('no_data'))}</div>
          <div class="stat-item__label">${escHtml(t('stat_best_chapter'))}</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-go-learn').addEventListener('click', () => Router.navigate('view-learn-setup'));
  document.getElementById('btn-go-exam').addEventListener('click',  () => Router.navigate('view-exam-setup'));
  document.getElementById('btn-go-history').addEventListener('click',() => Router.navigate('view-history'));
}

/* =====================================================================
   8. LEARN-SETUP VIEW
   ===================================================================== */

async function renderLearnSetup() {
  const t = k => Store.t(k);
  const el = document.getElementById('view-learn-setup');

  el.innerHTML = `
    <div class="page-header">
      <button class="page-header__back btn btn--ghost btn--sm" id="ls-back">← ${escHtml(t('btn_back'))}</button>
      <span class="page-header__divider">/</span>
      <h2 class="page-header__title">${escHtml(t('learn_setup_title'))}</h2>
    </div>
    <div id="ls-alert"></div>
    <div class="card card--elevated" style="max-width:520px">
      <div class="form-group">
        <label class="form-label">${escHtml(t('learn_chapter_label'))}</label>
        <select class="form-select" id="ls-chapter">
          <option value="__all__">${escHtml(t('chapter_all'))}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${escHtml(t('learn_type_label'))}</label>
        <div class="radio-group" id="ls-type">
          ${['__all__','wissen','rechnung'].map(v =>
            `<label class="radio-option${v==='__all__'?' selected':''}">
              <input type="radio" name="ls_type" value="${v}" ${v==='__all__'?'checked':''}>
              ${escHtml(v==='__all__'?t('type_all'):v==='wissen'?t('type_wissen'):t('type_rechnung'))}
            </label>`
          ).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${escHtml(t('learn_diff_label'))}</label>
        <div class="radio-group" id="ls-diff">
          ${['__all__','leicht','mittel','schwer'].map(v =>
            `<label class="radio-option${v==='__all__'?' selected':''}">
              <input type="radio" name="ls_diff" value="${v}" ${v==='__all__'?'checked':''}>
              ${escHtml(v==='__all__'?t('diff_all'):v==='leicht'?t('diff_leicht'):v==='mittel'?t('diff_mittel'):t('diff_schwer'))}
            </label>`
          ).join('')}
        </div>
      </div>
      <button class="btn btn--primary btn--full" id="ls-start">${escHtml(t('btn_start'))}</button>
    </div>
  `;

  // Kapitel-Dropdown befüllen
  try {
    const index = await loadChapterIndex();
    const sel = document.getElementById('ls-chapter');
    index.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch.key;
      opt.textContent = chapterLabel(ch);
      sel.appendChild(opt);
    });
  } catch (err) {
    showAlert('ls-alert', err.message);
  }

  // Radio-Styling synchronisieren
  ['ls-type', 'ls-diff'].forEach(groupId => {
    document.getElementById(groupId)?.querySelectorAll('.radio-option').forEach(label => {
      label.addEventListener('click', () => {
        label.closest('.radio-group')?.querySelectorAll('.radio-option').forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
      });
    });
  });

  document.getElementById('ls-back').addEventListener('click', () => Router.navigate('view-home'));

  document.getElementById('ls-start').addEventListener('click', () => {
    const chapter = document.getElementById('ls-chapter').value;
    const type    = document.querySelector('input[name="ls_type"]:checked')?.value ?? '__all__';
    const diff    = document.querySelector('input[name="ls_diff"]:checked')?.value ?? '__all__';
    Store.resetLearnShownKeys();
    Router.navigate('view-learn-play', { chapter, type, diff });
  });
}

/* =====================================================================
   9. LEARN-PLAY VIEW
   ===================================================================== */

let _learnParams = {};

async function renderLearnPlay(params) {
  _learnParams = params;
  const t = k => Store.t(k);
  const el = document.getElementById('view-learn-play');

  el.innerHTML = `
    <div class="page-header">
      <button class="page-header__back btn btn--ghost btn--sm" id="lp-back">← ${escHtml(t('btn_back'))}</button>
      <span class="page-header__divider">/</span>
      <h2 class="page-header__title">${escHtml(t('mode_learn_title'))}</h2>
    </div>
    <div id="lp-alert"></div>
    <div id="lp-content">
      <div class="loading-spinner"><div class="spinner"></div><span>${escHtml(t('loading'))}</span></div>
    </div>
  `;

  document.getElementById('lp-back').addEventListener('click', () => Router.navigate('view-learn-setup'));

  try {
    const lang = Store.getLang();
    let allQuestions;
    if (params.chapter === '__all__') {
      allQuestions = await loadAllChapters(lang);
    } else {
      allQuestions = await loadChapter(lang, params.chapter);
    }

    // Filtern
    const filtered = allQuestions.filter(q => {
      if (params.type !== '__all__' && q.type !== params.type) return false;
      if (params.diff !== '__all__' && q.difficulty !== params.diff) return false;
      return true;
    });

    if (filtered.length === 0) {
      document.getElementById('lp-content').innerHTML =
        `<div class="alert alert--warning">${escHtml(t('no_questions_found'))}</div>
         <button class="btn btn--secondary" id="lp-setup-again">← ${escHtml(t('btn_back'))}</button>`;
      document.getElementById('lp-setup-again').addEventListener('click', () => Router.navigate('view-learn-setup'));
      return;
    }

    renderLearnQuestion(filtered);
  } catch (err) {
    document.getElementById('lp-content').innerHTML =
      `<div class="alert alert--error">${escHtml(err.message)}</div>`;
  }
}

/**
 * Wählt faire Zufallsfrage:
 * - Fair zwischen Kapiteln (wenn mehrere)
 * - Fair zwischen Schwierigkeitsgraden (wenn alle)
 * - Reset wenn alle gezeigt wurden
 */
function pickFairLearnQuestion(filtered) {
  const shown = Store.getLearnShownKeys();

  // Welche Fragen wurden noch nicht gezeigt?
  let pool = filtered.filter(q => !shown.has(compositeKey(q._chapterKey, q.id)));

  // Alle gezeigt → Reset
  if (pool.length === 0) {
    Store.resetLearnShownKeys();
    pool = [...filtered];
  }

  // Kapitel-faire Auswahl: gleichmäßig über Kapitel verteilen
  const byChapter = {};
  pool.forEach(q => {
    if (!byChapter[q._chapterKey]) byChapter[q._chapterKey] = [];
    byChapter[q._chapterKey].push(q);
  });
  const chapters = Object.keys(byChapter);

  // Wähle zufälligen Kapitel-Slot (jeder Kapitel gleichgewichtet)
  const pickedChapter = chapters[Math.floor(Math.random() * chapters.length)];
  const chapterPool = byChapter[pickedChapter];

  // Innerhalb des Kapitels: fair zwischen Schwierigkeitsgraden
  const byDiff = {};
  chapterPool.forEach(q => {
    if (!byDiff[q.difficulty]) byDiff[q.difficulty] = [];
    byDiff[q.difficulty].push(q);
  });
  const diffs = Object.keys(byDiff);
  const pickedDiff = diffs[Math.floor(Math.random() * diffs.length)];
  const finalPool = byDiff[pickedDiff];

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function renderLearnQuestion(filtered) {
  const t = k => Store.t(k);
  const q = pickFairLearnQuestion(filtered);
  Store.addLearnShownKey(compositeKey(q._chapterKey, q.id));

  const diffLabel = t(`diff_${q.difficulty}`);
  const typeLabel = q.type === 'wissen' ? t('type_wissen') : t('type_rechnung');

  const answersHtml = Object.entries(q.answers).map(([key, text]) =>
    `<button class="answer-option" data-key="${escHtml(key)}">
       <span class="answer-option__key">${escHtml(key)}</span>
       <span>${escHtml(text)}</span>
     </button>`
  ).join('');

  document.getElementById('lp-content').innerHTML = `
    <div class="learn-question-card">
      <div class="question-meta">
        <span class="badge badge--primary">${escHtml(q._chapterKey)}</span>
        <span class="badge badge--type">${escHtml(typeLabel)}</span>
        <span class="badge badge--${q.difficulty}">${escHtml(diffLabel)}</span>
      </div>
      <div class="question-text">${escHtml(q.question)}</div>
      ${q.image ? `<div class="question-image"><img src="${escHtml(q.image)}" alt="Schaltbild / Circuit diagram" loading="lazy"></div>` : ''}
      <div class="answers-list" id="learn-answers">${answersHtml}</div>
      <div class="feedback-box" id="learn-feedback"></div>
      <button class="btn btn--primary" id="lp-next" style="display:none">
        ${escHtml(t('btn_next_q'))} →
      </button>
    </div>
  `;

  // Antwort-Buttons
  document.querySelectorAll('#learn-answers .answer-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      // Alle Buttons deaktivieren
      document.querySelectorAll('#learn-answers .answer-option').forEach(b => {
        b.disabled = true;
      });

      const chosen = btn.dataset.key;
      const isCorrect = chosen === q.correct_answer;

      // Optische Rückmeldung
      document.querySelectorAll('#learn-answers .answer-option').forEach(b => {
        if (b.dataset.key === q.correct_answer) b.classList.add('correct');
        if (b.dataset.key === chosen && !isCorrect) b.classList.add('wrong');
        if (b.dataset.key === chosen && isCorrect) b.classList.add('selected');
      });

      // Feedback-Box
      const fb = document.getElementById('learn-feedback');
      fb.classList.add('visible');
      if (isCorrect) {
        fb.classList.add('feedback-box--correct');
        fb.innerHTML = `<div class="feedback-box__title">${escHtml(t('feedback_correct'))}</div>
          <div class="feedback-box__explanation"><strong>${escHtml(t('explanation'))}</strong> ${escHtml(q.explanation)}</div>`;
      } else {
        fb.classList.add('feedback-box--wrong');
        fb.innerHTML = `<div class="feedback-box__title">${escHtml(t('feedback_wrong'))}</div>
          <div class="feedback-box__explanation">
            <strong>${escHtml(t('correct_answer'))}</strong> ${escHtml(q.correct_answer)}: ${escHtml(q.answers[q.correct_answer])}<br>
            <strong>${escHtml(t('explanation'))}</strong> ${escHtml(q.explanation)}
          </div>`;
      }

      document.getElementById('lp-next').style.display = 'inline-flex';
    });
  });

  document.getElementById('lp-next').addEventListener('click', () => {
    renderLearnQuestion(filtered);
  });
}

/* =====================================================================
   10. EXAM-SETUP VIEW
   ===================================================================== */

async function renderExamSetup() {
  const t = k => Store.t(k);
  const el = document.getElementById('view-exam-setup');

  // Prüfen ob offene Prüfung vorhanden
  const savedExam = Store.loadExamStateFromStorage();

  el.innerHTML = `
    <div class="page-header">
      <button class="page-header__back btn btn--ghost btn--sm" id="es-back">← ${escHtml(t('btn_back'))}</button>
      <span class="page-header__divider">/</span>
      <h2 class="page-header__title">${escHtml(t('exam_setup_title'))}</h2>
    </div>
    <div id="es-alert"></div>
    ${savedExam ? `
      <div class="card card--elevated" style="max-width:520px;margin-bottom:var(--space-5);border:2px solid var(--color-primary)">
        <h3 style="margin-bottom:var(--space-3)">${escHtml(t('exam_restore_title'))}</h3>
        <p style="margin-bottom:var(--space-5);font-size:.9rem">${escHtml(t('exam_restore_msg'))}</p>
        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
          <button class="btn btn--primary" id="es-restore">${escHtml(t('exam_restore_yes'))}</button>
          <button class="btn btn--secondary" id="es-new">${escHtml(t('exam_restore_no'))}</button>
        </div>
      </div>
    ` : ''}
    <div class="card card--elevated" style="max-width:520px" id="es-form">
      <div class="info-box">
        <strong>ℹ️ ${escHtml(t('exam_info'))}</strong>
      </div>
      <div class="form-group">
        <label class="form-label">${escHtml(t('exam_chapter_label'))}</label>
        <select class="form-select" id="es-chapter">
          <option value="__all__">${escHtml(t('chapter_all'))}</option>
        </select>
      </div>
      <button class="btn btn--accent btn--full" id="es-start">${escHtml(t('btn_start'))}</button>
    </div>
  `;

  document.getElementById('es-back').addEventListener('click', () => Router.navigate('view-home'));

  if (savedExam) {
    document.getElementById('es-restore').addEventListener('click', () => {
      Router.navigate('view-exam-play', { restore: true });
    });
    document.getElementById('es-new').addEventListener('click', () => {
      Store.setExamState(null);
      document.querySelector('.card.card--elevated').remove();
    });
  }

  try {
    const index = await loadChapterIndex();
    const sel = document.getElementById('es-chapter');
    index.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch.key;
      opt.textContent = chapterLabel(ch);
      sel.appendChild(opt);
    });
  } catch (err) {
    showAlert('es-alert', err.message);
    return;
  }

  document.getElementById('es-start').addEventListener('click', async () => {
    const chapter = document.getElementById('es-chapter').value;
    document.getElementById('es-start').disabled = true;
    document.getElementById('es-start').textContent = Store.t('loading');
    clearEl('es-alert');

    try {
      await buildAndStartExam(chapter);
    } catch (err) {
      showAlert('es-alert', err.message);
      document.getElementById('es-start').disabled = false;
      document.getElementById('es-start').textContent = Store.t('btn_start');
    }
  });
}

/**
 * Baut die Prüfung zusammen (strikte Typ/Schwierigkeits-Verteilung).
 * Wirft Fehler wenn nicht genug Fragen vorhanden.
 */
async function buildAndStartExam(chapterKey) {
  const lang = Store.getLang();

  let allQuestions;
  if (chapterKey === '__all__') {
    allQuestions = await loadAllChapters(lang);
  } else {
    allQuestions = await loadChapter(lang, chapterKey);
  }

  // Hilfsfunktion: Fragen nach Typ/Difficulty filtern
  const filterQ = (type, diff) => allQuestions.filter(q => q.type === type && q.difficulty === diff);

  // Prüfungsslots
  const slots = [
    { type: 'wissen',   diff: 'leicht', count: CONFIG.EXAM_WISSEN_LEICHT },
    { type: 'wissen',   diff: 'mittel', count: CONFIG.EXAM_WISSEN_MITTEL },
    { type: 'wissen',   diff: 'schwer', count: CONFIG.EXAM_WISSEN_SCHWER },
    { type: 'rechnung', diff: 'leicht', count: CONFIG.EXAM_RECHNUNG_LEICHT },
    { type: 'rechnung', diff: 'mittel', count: CONFIG.EXAM_RECHNUNG_MITTEL },
    { type: 'rechnung', diff: 'schwer', count: CONFIG.EXAM_RECHNUNG_SCHWER },
  ];

  // Verfügbarkeit prüfen
  const errors = [];
  slots.forEach(slot => {
    const available = filterQ(slot.type, slot.diff).length;
    if (available < slot.count) {
      errors.push(`${slot.type} / ${slot.diff}: ${slot.count} benötigt, ${available} vorhanden`);
    }
  });
  if (errors.length > 0) {
    throw new Error(Store.t('not_enough_questions') + '\n' + errors.join('\n'));
  }

  // Fragen auswählen (kapitelweise Round-Robin bei "alle Kapitel")
  const selectedQuestions = [];

  slots.forEach(slot => {
    const pool = shuffle(filterQ(slot.type, slot.diff));

    if (chapterKey !== '__all__') {
      // Einzelnes Kapitel: einfach zufällig
      selectedQuestions.push(...pool.slice(0, slot.count));
    } else {
      // Alle Kapitel: Round-Robin über Kapitel
      selectedQuestions.push(...roundRobinSelect(pool, slot.count));
    }
  });

  // Fragen mischen
  shuffle(selectedQuestions);

  // Exam-State initialisieren und speichern
  const now = Date.now();
  const examState = {
    lang,
    chapterKey,
    questions: selectedQuestions,
    answers: {},           // questionIndex -> Antwort-Key (A-E)
    currentIndex: 0,
    startTimestamp: now,
    elapsedSeconds: 0,    // Gesamtzeit beim letzten Speichern (für Wiederherstellung)
    questionTimers: {},   // questionIndex -> Sekunden
    questionTimerActive: null, // Welcher Fragentimer gerade läuft
  };

  Store.setExamState(examState);
  Router.navigate('view-exam-play', { restore: false });
}

/**
 * Round-Robin-Auswahl: zieht aus einem gemischten Pool gleichmäßig über Kapitel.
 */
function roundRobinSelect(pool, count) {
  const byChapter = {};
  pool.forEach(q => {
    if (!byChapter[q._chapterKey]) byChapter[q._chapterKey] = [];
    byChapter[q._chapterKey].push(q);
  });

  const chapters = shuffle(Object.keys(byChapter));
  const result = [];
  let i = 0;
  while (result.length < count) {
    const ch = chapters[i % chapters.length];
    if (byChapter[ch].length > 0) {
      result.push(byChapter[ch].shift());
    }
    i++;
    // Sicherheits-Abbruch wenn Kapitel erschöpft
    if (chapters.every(c => byChapter[c].length === 0)) break;
  }
  return result;
}

/* =====================================================================
   11. EXAM-PLAY VIEW
   ===================================================================== */

// Timer-Handles
let _examGlobalInterval = null;
let _examQuestionInterval = null;

function clearExamTimers() {
  if (_examGlobalInterval) { clearInterval(_examGlobalInterval); _examGlobalInterval = null; }
  if (_examQuestionInterval) { clearInterval(_examQuestionInterval); _examQuestionInterval = null; }
}

async function renderExamPlay(params) {
  const t = k => Store.t(k);
  const state = Store.getExamState();
  if (!state) { Router.navigate('view-exam-setup'); return; }

  clearExamTimers();

  const el = document.getElementById('view-exam-play');
  el.innerHTML = `
    <div class="exam-layout">
      <!-- Sidebar -->
      <aside class="exam-sidebar">
        <div class="exam-sidebar__header">
          <div class="exam-timer" id="exam-global-timer">60:00</div>
          <div class="exam-sidebar__label">${escHtml(t('total_timer'))}</div>
        </div>
        <div class="exam-nav-grid" id="exam-nav-grid"></div>
        <button class="btn btn--accent btn--full exam-finish-btn" id="exam-finish-btn">
          ${escHtml(t('btn_finish'))}
        </button>
      </aside>

      <!-- Hauptbereich -->
      <main>
        <div class="card card--elevated" id="exam-question-panel"></div>
      </main>
    </div>

    <!-- Bestätigungs-Modal -->
    <div class="modal-overlay" id="confirm-modal">
      <div class="modal">
        <div class="modal__title" id="modal-title"></div>
        <div class="modal__body"  id="modal-body"></div>
        <div class="modal__actions">
          <button class="btn btn--secondary" id="modal-cancel"></button>
          <button class="btn btn--danger"    id="modal-confirm"></button>
        </div>
      </div>
    </div>
  `;

  // Nav-Grid aufbauen
  renderExamNavGrid();

  // Aktuelle Frage rendern
  renderExamQuestion(state.currentIndex);

  // Gesamt-Timer starten
  startExamGlobalTimer();

  // Finish-Button
  document.getElementById('exam-finish-btn').addEventListener('click', () => {
    showConfirmModal();
  });
}

function renderExamNavGrid() {
  const t = k => Store.t(k);
  const state = Store.getExamState();
  const grid = document.getElementById('exam-nav-grid');
  if (!grid) return;

  grid.innerHTML = state.questions.map((_, i) => {
    const isAnswered = state.answers[i] !== undefined;
    const isCurrent  = i === state.currentIndex;
    let cls = 'exam-nav-btn';
    if (isCurrent) cls += ' current';
    else if (isAnswered) cls += ' answered';
    return `<button class="${cls}" data-idx="${i}" title="${escHtml(t('question_label'))} ${i + 1}">
      ${i + 1}
    </button>`;
  }).join('');

  grid.querySelectorAll('.exam-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateExamQuestion(parseInt(btn.dataset.idx));
    });
  });
}

function navigateExamQuestion(newIndex) {
  const state = Store.getExamState();
  if (!state) return;

  // Fragentimer pausieren
  pauseExamQuestionTimer();

  state.currentIndex = newIndex;
  Store.setExamState(state);

  renderExamNavGrid();
  renderExamQuestion(newIndex);
  startExamQuestionTimer(newIndex);
}

function renderExamQuestion(index) {
  const t = k => Store.t(k);
  const state = Store.getExamState();
  const q = state.questions[index];
  const panel = document.getElementById('exam-question-panel');
  if (!panel) return;

  const diffLabel  = t(`diff_${q.difficulty}`);
  const typeLabel  = q.type === 'wissen' ? t('type_wissen') : t('type_rechnung');
  const qTime = state.questionTimers[index] ?? 0;

  const answersHtml = Object.entries(q.answers).map(([key, text]) => {
    const isSelected = state.answers[index] === key;
    return `<button class="answer-option${isSelected ? ' selected' : ''}" data-key="${escHtml(key)}">
      <span class="answer-option__key">${escHtml(key)}</span>
      <span>${escHtml(text)}</span>
    </button>`;
  }).join('');

  panel.innerHTML = `
    <div class="exam-question-header">
      <div>
        <div class="exam-question-counter">${escHtml(t('question_label'))} ${index + 1} / ${state.questions.length}</div>
        <div class="question-meta" style="margin-top:var(--space-2)">
          <span class="badge badge--primary">${escHtml(q._chapterKey)}</span>
          <span class="badge badge--type">${escHtml(typeLabel)}</span>
          <span class="badge badge--${q.difficulty}">${escHtml(diffLabel)}</span>
        </div>
      </div>
      <div class="question-timer">
        <span class="question-timer__icon">⏱</span>
        <span id="exam-q-timer">${formatTime(qTime)}</span>
      </div>
    </div>
    <div class="question-text">${escHtml(q.question)}</div>
    ${q.image ? `<div class="question-image"><img src="${escHtml(q.image)}" alt="Schaltbild / Circuit diagram" loading="lazy"></div>` : ''}
    <div class="answers-list" id="exam-answers">${answersHtml}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-5);flex-wrap:wrap;gap:var(--space-3)">
      <div>
        ${index > 0 ? `<button class="btn btn--secondary btn--sm" id="exam-prev-btn">← ${index}</button>` : ''}
      </div>
      <div>
        ${index < state.questions.length - 1
          ? `<button class="btn btn--primary btn--sm" id="exam-next-btn">${index + 2} →</button>`
          : `<button class="btn btn--accent btn--sm" id="exam-finish-inline">${escHtml(t('btn_finish'))}</button>`
        }
      </div>
    </div>
  `;

  // Antwort-Auswahl
  panel.querySelectorAll('.answer-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const state2 = Store.getExamState();
      state2.answers[index] = btn.dataset.key;
      Store.setExamState(state2);

      panel.querySelectorAll('.answer-option').forEach(b => {
        b.classList.toggle('selected', b.dataset.key === btn.dataset.key);
      });
      renderExamNavGrid();
    });
  });

  // Navigation
  panel.querySelector('#exam-prev-btn')?.addEventListener('click', () => navigateExamQuestion(index - 1));
  panel.querySelector('#exam-next-btn')?.addEventListener('click', () => navigateExamQuestion(index + 1));
  panel.querySelector('#exam-finish-inline')?.addEventListener('click', () => showConfirmModal());

  // Fragentimer starten
  startExamQuestionTimer(index);
}

// --- TIMER-LOGIK ---

function startExamGlobalTimer() {
  const state = Store.getExamState();
  if (!state) return;

  const endTime = state.startTimestamp + (CONFIG.EXAM_DURATION_SEC * 1000) - (state.elapsedSeconds * 1000);

  _examGlobalInterval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const timerEl = document.getElementById('exam-global-timer');
    if (timerEl) {
      timerEl.textContent = formatTime(remaining);
      timerEl.classList.toggle('warning', remaining <= CONFIG.TIMER_WARNING_SEC);
    }

    // Elapsed sichern
    const s2 = Store.getExamState();
    if (s2) {
      s2.elapsedSeconds = CONFIG.EXAM_DURATION_SEC - remaining;
      Store.setExamState(s2);
    }

    if (remaining <= 0) {
      clearExamTimers();
      finishExam(true);
    }
  }, 1000);
}

function startExamQuestionTimer(index) {
  // Vorherigen stoppen
  if (_examQuestionInterval) { clearInterval(_examQuestionInterval); _examQuestionInterval = null; }

  const state = Store.getExamState();
  if (!state) return;

  state.questionTimerActive = index;

  _examQuestionInterval = setInterval(() => {
    const s = Store.getExamState();
    if (!s || s.questionTimerActive !== index) {
      clearInterval(_examQuestionInterval);
      return;
    }
    if (!s.questionTimers[index]) s.questionTimers[index] = 0;
    s.questionTimers[index]++;
    Store.setExamState(s);

    const timerEl = document.getElementById('exam-q-timer');
    if (timerEl) timerEl.textContent = formatTime(s.questionTimers[index]);
  }, 1000);
}

function pauseExamQuestionTimer() {
  if (_examQuestionInterval) { clearInterval(_examQuestionInterval); _examQuestionInterval = null; }
  const s = Store.getExamState();
  if (s) { s.questionTimerActive = null; Store.setExamState(s); }
}

// --- BESTÄTIGUNGS-MODAL ---

function showConfirmModal() {
  const t = k => Store.t(k);
  const state = Store.getExamState();
  const unanswered = state.questions.length - Object.keys(state.answers).length;

  document.getElementById('modal-title').textContent  = t('confirm_finish_title');
  document.getElementById('modal-body').textContent   = t('confirm_finish_msg', unanswered);
  document.getElementById('modal-cancel').textContent = t('confirm_no');
  document.getElementById('modal-confirm').textContent= t('confirm_yes');

  const overlay = document.getElementById('confirm-modal');
  overlay.classList.add('visible');

  document.getElementById('modal-cancel').onclick  = () => overlay.classList.remove('visible');
  document.getElementById('modal-confirm').onclick = () => {
    overlay.classList.remove('visible');
    finishExam(false);
  };
}

// --- PRÜFUNG BEENDEN ---

function finishExam(timedOut) {
  clearExamTimers();
  pauseExamQuestionTimer();

  const state = Store.getExamState();
  if (!state) return;

  // Auswertung berechnen
  let correct = 0;
  state.questions.forEach((q, i) => {
    if (state.answers[i] === q.correct_answer) correct++;
  });

  const total = state.questions.length;
  const percent = Math.round((correct / total) * 100);
  const passed = percent >= Math.round(CONFIG.PASS_THRESHOLD * 100);

  // Gesamtzeit
  const totalSeconds = state.elapsedSeconds;

  // Kapitel-Label (sprachspezifisch über chapterLabel()-Hilfsfunktion)
  const chapterIndex = Store.getChapterIndex() ?? [];
  const resolvedChapterLabel = state.chapterKey === '__all__'
    ? Store.t('chapter_all')
    : chapterLabel(chapterIndex.find(c => c.key === state.chapterKey) ?? { key: state.chapterKey });

  // History-Eintrag
  Store.pushHistory({
    date:    new Date().toISOString(),
    lang:    state.lang,
    chapter: resolvedChapterLabel,
    percent,
    correct,
    total,
    totalSeconds,
    passed,
    timedOut,
  });

  // Prüfungs-State löschen
  Store.setExamState(null);

  // Zum Ergebnis
  Router.navigate('view-exam-result', {
    questions: state.questions,
    answers:   state.answers,
    questionTimers: state.questionTimers,
    correct,
    total,
    percent,
    passed,
    totalSeconds,
    chapterLabel: resolvedChapterLabel,
    timedOut,
  });
}

/* =====================================================================
   12. EXAM-RESULT VIEW
   ===================================================================== */

function renderExamResult(params) {
  const t = k => Store.t(k);
  const { questions, answers, questionTimers, correct, total, percent, passed, totalSeconds, chapterLabel, timedOut } = params;

  const el = document.getElementById('view-exam-result');

  // Detailauswertung pro Frage
  const detailHtml = questions.map((q, i) => {
    const givenKey   = answers[i];
    const isCorrect  = givenKey === q.correct_answer;
    const isUnanswered = !givenKey;
    const statusClass = isUnanswered ? 'unanswered' : isCorrect ? 'correct' : 'wrong';
    const qTime = questionTimers[i] ?? 0;

    return `<div class="result-question-item ${statusClass}">
      <div class="result-q-header">
        <div class="result-q-number">${escHtml(t('question_label'))} ${i + 1} · ${escHtml(q._chapterKey)}</div>
        <div class="result-q-time">⏱ ${formatTime(qTime)}</div>
      </div>
      <div class="result-q-text">${escHtml(q.question)}</div>
      <div class="result-answers">
        <div class="result-answer-row ${isUnanswered ? 'result-wrong-answer' : isCorrect ? 'result-correct-answer' : 'result-wrong-answer'}">
          <strong>${escHtml(t('result_given'))}</strong>
          ${isUnanswered
            ? escHtml(t('result_unanswered'))
            : `${escHtml(givenKey)}: ${escHtml(q.answers[givenKey])}`
          }
        </div>
        ${!isCorrect ? `
        <div class="result-answer-row result-correct-answer">
          <strong>${escHtml(t('result_correct_ans'))}</strong>
          ${escHtml(q.correct_answer)}: ${escHtml(q.answers[q.correct_answer])}
        </div>` : ''}
      </div>
      <div class="result-explanation">${escHtml(q.explanation)}</div>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${escHtml(t('result_title'))}</h2>
    </div>

    <div class="result-hero ${passed ? 'result-hero--pass' : 'result-hero--fail'}">
      <span class="result-status-icon">${passed ? '🏆' : '📋'}</span>
      <div class="result-score">${percent} %</div>
      <div class="result-status-label">${escHtml(passed ? t('result_pass') : t('result_fail'))}</div>
      <div class="result-meta">
        <span>${escHtml(t('result_correct'))}: ${correct} ${escHtml(t('result_of'))} ${total}</span>
        <span>${escHtml(t('result_total_time'))}: ${formatTime(totalSeconds)}</span>
        <span>${escHtml(chapterLabel)}</span>
        ${timedOut ? '<span>⏰ Zeit abgelaufen</span>' : ''}
      </div>
    </div>

    <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-8);flex-wrap:wrap">
      <button class="btn btn--primary" id="res-new-exam">${escHtml(t('btn_new_exam'))}</button>
      <button class="btn btn--secondary" id="res-home">${escHtml(t('btn_to_home'))}</button>
    </div>

    <div class="section-title">${escHtml(t('result_details'))}</div>
    ${detailHtml}
  `;

  document.getElementById('res-new-exam').addEventListener('click', () => Router.navigate('view-exam-setup'));
  document.getElementById('res-home').addEventListener('click',     () => Router.navigate('view-home'));
}

/* =====================================================================
   13. HISTORY VIEW
   ===================================================================== */

function renderHistory() {
  const t  = k => Store.t(k);
  const h  = Store.getHistory();
  const el = document.getElementById('view-history');

  const tableHtml = h.length === 0 ? `
    <div class="history-empty">
      <span class="history-empty__icon">📭</span>
      <p>${escHtml(t('history_empty'))}</p>
    </div>
  ` : `
    <div class="history-table-wrap">
      <table class="history-table">
        <thead>
          <tr>
            <th>${escHtml(t('col_date'))}</th>
            <th>${escHtml(t('col_chapter'))}</th>
            <th>${escHtml(t('col_score'))}</th>
            <th>${escHtml(t('col_time'))}</th>
            <th>${escHtml(t('col_lang'))}</th>
            <th>${escHtml(t('col_status'))}</th>
          </tr>
        </thead>
        <tbody>
          ${h.map(entry => `
            <tr>
              <td>${escHtml(formatDate(entry.date))}</td>
              <td>${escHtml(entry.chapter)}</td>
              <td><strong>${entry.correct}/${entry.total}</strong> (${entry.percent}%)</td>
              <td>${formatTime(entry.totalSeconds)}</td>
              <td>${escHtml(entry.lang.toUpperCase())}</td>
              <td>
                <span class="status-pill ${entry.passed ? 'status-pill--pass' : 'status-pill--fail'}">
                  ${escHtml(entry.passed ? t('status_pass') : t('status_fail'))}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  el.innerHTML = `
    <div class="page-header">
      <button class="page-header__back btn btn--ghost btn--sm" id="hist-back">← ${escHtml(t('btn_back'))}</button>
      <span class="page-header__divider">/</span>
      <h2 class="page-header__title">${escHtml(t('history_title'))}</h2>
    </div>
    <div class="card">
      ${tableHtml}
      ${h.length > 0 ? `
        <div style="margin-top:var(--space-5);text-align:right">
          <button class="btn btn--secondary btn--sm" id="hist-clear">${escHtml(t('history_clear'))}</button>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('hist-back').addEventListener('click', () => Router.navigate('view-home'));
  document.getElementById('hist-clear')?.addEventListener('click', () => {
    if (confirm(Store.getLang() === 'de' ? 'Verlauf wirklich löschen?' : 'Really clear history?')) {
      Store.clearHistory();
      renderHistory();
    }
  });
}

/* =====================================================================
   14. LANGUAGE SWITCH & HEADER
   ===================================================================== */

function updateLangButtons() {
  const lang = Store.getLang();
  document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initHeader() {
  // Brand-Klick → Home
  document.querySelector('.app-header__brand')?.addEventListener('click', () => {
    Router.navigate('view-home');
  });

  // Sprachumschalter
  document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      if (newLang === Store.getLang()) return;
      Store.setLang(newLang);
      updateLangButtons();
      // Tagline aktualisieren
      const tagline = document.querySelector('.app-header__subtitle');
      if (tagline) tagline.textContent = Store.t('tagline');
      // Aktuelle View neu rendern
      const cur = Router.current();
      if (cur) {
        clearExamTimers(); // Timer stoppen wenn gewechselt
        Router.navigate(cur, Router.currentParams());
      }
    });
  });
}

/* =====================================================================
   14. INIT – Alles zusammensetzen
   ===================================================================== */

function init() {
  // Header initialisieren
  initHeader();
  updateLangButtons();

  // Tagline setzen
  const tagline = document.querySelector('.app-header__subtitle');
  if (tagline) tagline.textContent = Store.t('tagline');

  // Views registrieren
  Router.register('view-home', {
    onEnter: () => renderHome(),
    onLeave: () => {},
  });

  Router.register('view-learn-setup', {
    onEnter: () => renderLearnSetup(),
    onLeave: () => {},
  });

  Router.register('view-learn-play', {
    onEnter: (params) => renderLearnPlay(params),
    onLeave: () => {},
  });

  Router.register('view-exam-setup', {
    onEnter: () => renderExamSetup(),
    onLeave: () => {},
  });

  Router.register('view-exam-play', {
    onEnter: (params) => renderExamPlay(params),
    onLeave: () => clearExamTimers(),
  });

  Router.register('view-exam-result', {
    onEnter: (params) => renderExamResult(params),
    onLeave: () => {},
  });

  Router.register('view-history', {
    onEnter: () => renderHistory(),
    onLeave: () => {},
  });

  // Start
  Router.navigate('view-home');
}

// Warten bis DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
