export const SPEED_MAP = {
  slow: 800,
  normal: 400,
  fast: 100,
};

export function generateRandomArray(length = 20, min = 10, max = 100) {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export function parseArray(inputStr) {
  if (!inputStr) return [];
  return inputStr
    .split(',')
    .map((str) => parseInt(str.trim(), 10))
    .filter((num) => !isNaN(num));
}
