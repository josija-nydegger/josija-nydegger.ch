// Feste Texte für die gemeinsamen Layouts und Komponenten in beiden Sprachen.
// Texte, die nur auf einer Seite vorkommen (z. B. Abschnittstitel), stehen direkt in der Seite.

export const langs = ['de', 'en'] as const;
export type Lang = (typeof langs)[number];

export const i18n = {
  de: {
    name: 'Deutsch',
    locale: 'de_CH',
    homeUrl: '/',
    feedUrl: '/feed.xml',
    feedTitle: 'Josija Nydegger – Blog',
    tagline: 'Bauingenieurwesen · BIM · Digital Construction',
    langLabel: 'Sprache',
    blog: 'Blog',
    blogUrl: '/blog/',
    allPosts: 'Alle Beiträge',
    rssTitle: 'RSS-Feed abonnieren',
    noPosts: 'Die ersten Beiträge folgen bald.',
    // Blogbeitrag
    readingTime: 'Min. Lesezeit',
    postNav: 'Weitere Beiträge',
    prevPost: 'Vorheriger Beitrag',
    nextPost: 'Nächster Beitrag',
    // Hell / Dunkel / System
    themeLabel: 'Farbschema',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    themeSystem: 'System',
    // Fusszeile
    privacy: 'Datenschutz',
    privacyUrl: '/datenschutz',
    // Suche (src/components/Search.astro)
    search: 'Suchen',
    searchPlaceholder: 'Seiten, Tools und Beiträge durchsuchen',
    searchEmpty: 'Nichts gefunden. Versuch einen anderen Begriff, zum Beispiel «Balken» oder «SIA».',
    searchHelpOpen: 'öffnen',
    searchHelpMove: 'auswählen',
    searchHelpClose: 'schliessen',
    kindPage: 'Seite',
    kindSection: 'Abschnitt',
    kindTool: 'Tool',
    kindPost: 'Beitrag'
  },
  en: {
    name: 'English',
    locale: 'en_US',
    homeUrl: '/en/',
    feedUrl: '/en/feed.xml',
    feedTitle: 'Josija Nydegger – Blog (English)',
    tagline: 'Civil Engineering · BIM · Digital Construction',
    langLabel: 'Language',
    blog: 'Blog',
    blogUrl: '/en/blog/',
    allPosts: 'All posts',
    rssTitle: 'Subscribe to the RSS feed',
    noPosts: 'The first posts are coming soon.',
    // Blog post
    readingTime: 'min read',
    postNav: 'More posts',
    prevPost: 'Previous post',
    nextPost: 'Next post',
    // Light / Dark / System
    themeLabel: 'Color scheme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    // Footer
    privacy: 'Privacy',
    privacyUrl: '/en/privacy',
    // Search (src/components/Search.astro)
    search: 'Search',
    searchPlaceholder: 'Search pages, tools and posts',
    searchEmpty: 'No results. Try another term, such as “beam” or “SIA”.',
    searchHelpOpen: 'open',
    searchHelpMove: 'select',
    searchHelpClose: 'close',
    kindPage: 'Page',
    kindSection: 'Section',
    kindTool: 'Tool',
    kindPost: 'Post'
  }
} as const satisfies Record<Lang, Record<string, string>>;

export const otherLang = (lang: Lang): Lang => (lang === 'de' ? 'en' : 'de');

const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Datum wie bisher: Deutsch "3.11.2026", Englisch "3 Nov 2026".
 * Von Hand statt mit Intl, weil Intl je nach Version "Sept" statt "Sep" liefert.
 * Beitragsdaten sind Kalendertage (UTC-Mitternacht, siehe src/lib/posts.ts).
 */
export function formatDate(date: Date, lang: Lang): string {
  const d = date.getUTCDate(), m = date.getUTCMonth(), y = date.getUTCFullYear();
  return lang === 'en' ? `${d} ${monthsEn[m]} ${y}` : `${d}.${m + 1}.${y}`;
}
