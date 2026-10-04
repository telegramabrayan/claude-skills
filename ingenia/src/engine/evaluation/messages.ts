const CORRECT_MESSAGES = [
  "Bien. Ya entendiste la idea.",
  "Correcto.",
  "Perfecto.",
  "Exacto, así se hace.",
  "Muy bien razonado.",
];

export function correctMessage(seed = Date.now()): string {
  return CORRECT_MESSAGES[Math.abs(seed) % CORRECT_MESSAGES.length];
}
