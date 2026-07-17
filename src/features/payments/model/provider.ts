import "server-only";

export const paymentProviderNames = ["bepaid", "webpay"] as const;
export type PaymentProviderName = (typeof paymentProviderNames)[number];

export type Money = {
  amountMinor: number;
  currency: "BYN" | "EUR" | "USD";
};

export type CheckoutRequest = {
  dealId: string;
  transactionId: string;
  idempotencyKey: string;
  money: Money;
  description: string;
  successUrl: string;
  failureUrl: string;
  customer: {
    id: string;
    email: string;
  };
};

export type CheckoutResult = {
  externalTransactionId: string;
  checkoutUrl: string;
  expiresAt?: string;
};

export type RefundRequest = {
  externalTransactionId: string;
  idempotencyKey: string;
  money: Money;
  reason: string;
};

export type WebhookEvent = {
  providerEventId: string;
  externalTransactionId: string;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  eventType: string;
  occurredAt: string;
  sanitizedPayload: Record<string, unknown>;
};

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
  refund(request: RefundRequest): Promise<void>;
  verifyAndParseWebhook(
    rawBody: string,
    headers: Headers,
  ): Promise<WebhookEvent>;
}

/**
 * Provider adapters live behind this contract so checkout orchestration,
 * transaction state and webhook idempotency stay provider-independent.
 * Adapters must never log secrets, full card data, or unredacted payloads.
 */
