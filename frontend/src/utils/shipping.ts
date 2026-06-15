import { ShippingConfig } from '@/hooks/useShippingConfig';

export function calculateShipping(postDiscountSubtotal: number, config: ShippingConfig): number {
  if (config.freeAbove != null && postDiscountSubtotal >= config.freeAbove) return 0;
  return config.flatFee;
}

export function shippingDisplayLabel(fee: number): string {
  return fee === 0 ? 'Free' : null as any; // caller uses formatPrice(fee) when non-zero
}
