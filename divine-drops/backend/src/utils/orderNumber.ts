export function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DD-${stamp}-${rand}`;
}

export function money(value: number): string {
  return value.toFixed(3);
}
