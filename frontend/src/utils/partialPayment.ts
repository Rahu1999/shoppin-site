import { PartialPaymentConfig } from '@/hooks/usePartialPaymentConfig';

export function calculateDeposit(orderTotal: number, config: PartialPaymentConfig): number {
  if (config.depositType === 'percentage') {
    return Math.round(orderTotal * (config.depositValue / 100) * 100) / 100;
  }
  return Math.min(config.depositValue, orderTotal);
}

export function calculateBalance(orderTotal: number, depositAmount: number): number {
  return Math.round((orderTotal - depositAmount) * 100) / 100;
}

export function isPartialPaymentEligible(orderTotal: number, config: PartialPaymentConfig): boolean {
  return config.isEnabled && config.isActive && orderTotal >= config.minimumOrderValue;
}
