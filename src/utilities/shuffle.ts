/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
/**
 * Randomly shuffle an array in-place using the Fisher–Yates algorithm.
 * @param array The array to shuffle
 * @returns The shuffled array (same reference as input)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = array.slice();
  let currentIndex = result.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    const temp = result[currentIndex];
    result[currentIndex] = result[randomIndex];
    result[randomIndex] = temp;
  }

  return result;
}
