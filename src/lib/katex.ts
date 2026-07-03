import katex from 'katex';

export function renderLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\$\$(.*?)\$\$/gs, (_, tex) => {
      try { return katex.renderToString(tex, { displayMode: true, throwOnError: false }); }
      catch { return tex; }
    })
    .replace(/\$(.*?)\$/g, (_, tex) => {
      try { return katex.renderToString(tex, { displayMode: false, throwOnError: false }); }
      catch { return tex; }
    });
}
