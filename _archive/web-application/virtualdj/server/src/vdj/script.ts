export type TemplateVars = Readonly<Record<string, string | number>>;

/** Replace {name} placeholders: fill('cue_name {n}', { n: 2 }) -> 'cue_name 2'. A missing variable throws. */
export function fill(template: string, vars: TemplateVars): string {
   return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
      const value = vars[key];
      if (value === undefined) throw new Error(`Missing value for {${key}} in script template "${template}"`);
      return String(value);
   });
}

/** Parse VDJ numbers: 12.5, "12,5", "3:25", "1:02:03" -> seconds/number. Returns 0 if unparsable. */
export function num(value: string | number | null | undefined): number {
   if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
   if (!value) return 0;
   const str = value.trim();
   if (/^error/i.test(str)) return 0;
   if (str.includes(':')) {
      const parts = str.split(':').map((p) => parseFloat(p.replace(',', '.')) || 0);
      const [a = 0, b = 0, c = 0] = parts;
      if (parts.length === 2) return a * 60 + b;
      if (parts.length === 3) return a * 3600 + b * 60 + c;
   }
   const n = parseFloat(str.replace(',', '.'));
   return Number.isFinite(n) ? n : 0;
}
