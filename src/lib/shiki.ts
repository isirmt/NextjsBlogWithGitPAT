import { codeToHtml, type BundledLanguage, type BundledTheme } from 'shiki';

const SHIKI_THEME: BundledTheme = 'one-dark-pro';
const DEFAULT_LANGUAGE: BundledLanguage = 'md';

export async function highlightCodeBlock(code: string, language?: string): Promise<string> {
  const lang = language ?? DEFAULT_LANGUAGE;
  try {
    return await codeToHtml(code, { lang, theme: SHIKI_THEME });
  } catch {
    return await codeToHtml(code, { lang: DEFAULT_LANGUAGE, theme: SHIKI_THEME });
  }
}
