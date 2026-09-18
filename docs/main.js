/* Bali Flight A330 — chunk loader (ESM) */
(async () => {
  const base = new URL('.', import.meta.url);
  const parts = [];
  for (let i = 0; i < 3; i++) {
    const res = await fetch(new URL(`_chunk${i}.js`, base));
    if (!res.ok) throw new Error('chunk ' + i + ' HTTP ' + res.status);
    parts.push(await res.text());
  }
  const blob = new Blob(parts, { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  await import(url);
})().catch((e) => {
  console.error('[Bali Flight] load failed', e);
  const t = document.getElementById('toast');
  if (t) { t.hidden = false; t.textContent = '載入失敗：' + e; }
});
