/**
 * Cookie Importer Utility for Casjoe Agent OS
 * Parses JSON & Netscape format cookies exported from Chrome extensions.
 */

export function parseCookies(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();

  // 1. Try parsing JSON format (e.g. EditThisCookie extension)
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      return parsed.map(c => ({
        url: (c.secure ? 'https://' : 'http://') + c.domain.replace(/^\./, ''),
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path || '/',
        secure: Boolean(c.secure),
        httpOnly: Boolean(c.httpOnly),
        expirationDate: c.expirationDate || Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
      }));
    } catch {
      // Fallback to Netscape format
    }
  }

  // 2. Try parsing Netscape / cookies.txt format
  const lines = text.split('\n');
  const cookies = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split('\t');
    if (parts.length >= 7) {
      const domain = parts[0];
      const flag = parts[1] === 'TRUE';
      const path = parts[2];
      const secure = parts[3] === 'TRUE';
      const expirationDate = parseInt(parts[4], 10) || Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      const name = parts[5];
      const value = parts[6];

      cookies.push({
        url: (secure ? 'https://' : 'http://') + domain.replace(/^\./, ''),
        name,
        value,
        domain,
        path,
        secure,
        httpOnly: false,
        expirationDate
      });
    }
  }

  return cookies;
}
