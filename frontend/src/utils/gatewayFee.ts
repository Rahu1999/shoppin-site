import { PaymentGatewayConfig } from '@/hooks/usePaymentGatewayConfig';

export function calculateGatewayFee(preTotal: number, config: PaymentGatewayConfig): number {
  if (!config.isEnabled) return 0;
  const base = preTotal * (config.rate / 100);
  const tax = base * (config.taxRate / 100);
  return Math.round((base + tax) * 100) / 100;
}

export function gatewayFeeLabel(config: PaymentGatewayConfig): string {
  return `${config.name} Charges (${config.rate}% + ${config.taxRate}% GST)`;
}
