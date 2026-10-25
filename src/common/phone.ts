export function normalizeBdPhone(input: string): string | null {
  const cleaned = input.replace(/[\s-]/g, '');
  const match = cleaned.match(/^(?:\+?88)?(01[3-9]\d{8})$/);
  return match ? `+88${match[1]}` : null;
}