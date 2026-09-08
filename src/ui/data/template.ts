/** Split a template into prose and the slots values arrive in.
 *
 *  DEPTH-AWARE, and it has to be: a template can carry a repeated block —
 *  `{each item: {citation} — {contentIdentified}}` — and a regular expression
 *  matching to the first closing brace cuts it at `{citation}`, leaving the
 *  rest of the block set as prose with stray braces in it. A whole block is
 *  ONE slot: what repeats is the passage, not the fields inside it, and drawing
 *  it whole is what says so. */
export function slots(template: string): { text: string; slot: boolean }[] {
  const parts: { text: string; slot: boolean }[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < template.length; i += 1) {
    if (template[i] === "{") {
      if (depth === 0) {
        if (i > start) {
          parts.push({ text: template.slice(start, i), slot: false });
        }
        start = i;
      }
      depth += 1;
    } else if (template[i] === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0) {
        parts.push({ text: template.slice(start + 1, i), slot: true });
        start = i + 1;
      }
    }
  }
  if (start < template.length) {
    parts.push({ text: template.slice(start), slot: false });
  }
  return parts;
}
