// Seiten mit Gegenstück in der anderen Sprache, verbunden über "ref" (wie bisher im Front Matter).
// Der Sprachumschalter und die hreflang-Links suchen hier bzw. bei den Beiträgen (src/lib/posts.ts).
import type { Lang } from './i18n';

export const pages = {
  home: { de: '/', en: '/en/' },
  cv: { de: '/cv', en: '/en/cv' },
  tools: { de: '/tools/', en: '/en/tools/' },
  blog: { de: '/blog/', en: '/en/blog/' },
  privacy: { de: '/datenschutz', en: '/en/privacy' }
} as const satisfies Record<string, Partial<Record<Lang, string>>>;

export type PageRef = keyof typeof pages;
