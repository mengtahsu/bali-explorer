const base = new URL('.', import.meta.url);
const parts = await Promise.all(
  Array.from({ length: 8 }, (_, i) =>
    fetch(new URL('main.part' + i + '.txt', base)).then((r) => {
      if (!r.ok) throw new Error('part ' + i + ' ' + r.status);
      return r.text();
    })
  )
);
let src = parts.join('');
src = src.replace(/from\s+(['"])\.\//g, (_, q) => 'from ' + q + base.href);
src = src.replace(/import\s+(['"])\.\//g, (_, q) => 'import ' + q + base.href);
const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
await import(url);
