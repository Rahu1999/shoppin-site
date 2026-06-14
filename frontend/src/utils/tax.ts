export function calculateGST(taxableAmount: number, rate: number): number {
  return Math.round(taxableAmount * (rate / 100) * 100) / 100;
}
