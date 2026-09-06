export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/×/g, 'x')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}
