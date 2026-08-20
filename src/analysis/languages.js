export function aggregateLanguages(reposWithLanguages) {
  // reposWithLanguages = [{ repo, languages: { JS: 1200, Python: 300 } }, ...]
  const totals = {};
  for (const { languages } of reposWithLanguages) {
    for (const [lang, bytes] of Object.entries(languages)) {
      totals[lang] = (totals[lang] || 0) + bytes;
    }
  }
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  return Object.entries(totals)
    .map(([lang, bytes]) => ({ lang, bytes, pct: (bytes / grandTotal) * 100 }))
    .sort((a, b) => b.bytes - a.bytes);
}