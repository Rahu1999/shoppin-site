export interface GatewayOrderResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  key?: string;
  gatewaySlug: string;
}

export interface IGatewayProvider {
  readonly slug: string;
  isCredentialsConfigured(): boolean;
  createOrder(orderId: string, chargeAmount: number): Promise<GatewayOrderResult>;
  verifyPayment(data: Record<string, string>): Promise<void>;
}
