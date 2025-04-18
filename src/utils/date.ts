export function parseDate(dateStr: string): Date | null {
  const [mon, day] = dateStr.split(' ');
  if (!mon || !day) return null;
  
  const months: Record<string, number> = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  };
  const month = months[mon.toUpperCase()];
  const dayNum = parseInt(day, 10);
  if (isNaN(month) || isNaN(dayNum)) return null;
  return new Date(2025, month, dayNum, 10);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
} 