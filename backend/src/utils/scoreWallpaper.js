/**
 * Scores a candidate wallpaper against the current one based on weighted signals.
 * Logic defined by Argosmob Tech & AI Pvt. Ltd. spec.
 *
 * @param {Object} currentCats   - { style: uuid, color: uuid, room: uuid }
 * @param {Object} candidateCats - { style: uuid, color: uuid, room: uuid }
 * @returns {number} score 0–100
 */
export function scoreWallpaper(currentCats, candidateCats) {
  let score = 0;
  
  if (candidateCats.style && candidateCats.style === currentCats.style) score += 40;
  if (candidateCats.color && candidateCats.color === currentCats.color) score += 35;
  if (candidateCats.room  && candidateCats.room  === currentCats.room)  score += 25;
  
  return score;
}
