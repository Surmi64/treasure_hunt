/**
 * Answer normalisation shared by the build step and the browser.
 *
 * Both sides MUST produce identical strings, otherwise no answer will ever
 * match. Keep this file free of anything Node- or DOM-specific.
 *
 * "  Rákóczi-pince. " and "rakoczi pince" both become "rakoczipince".
 */
const COMBINING_MARKS = /[̀-ͯ]/g;

export function normalizeAnswer(input) {
  return String(input)
    .normalize('NFD')
    // strip combining accents, so á/ő/ű/ą/ś collapse to plain latin
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    // a few letters have no combining form and survive NFD, map them by hand
    .replace(/ł/g, 'l') // ł
    .replace(/đ/g, 'd') // đ
    .replace(/ß/g, 'ss') // ß
    // drop everything that is not a latin letter or a digit
    .replace(/[^a-z0-9]/g, '');
}
