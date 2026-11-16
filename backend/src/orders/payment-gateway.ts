import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

/** What a gateway needs to start charging an order. */
export interface PaymentRequest {
  orderCode: string;
  /** Amount in PEN, two decimals as a string (e.g. "1299.00"). */
  amount: string;
  email: string;
}

export interface CheckoutSession {
  provider: string;
  /** Gateway-side identifier, used later to match the payment result. */
  reference: string;
  /** Where the browser goes to pay: a gateway page or our own route. */
  redirectUrl: string;
}

/**
 * Port for online payments. A real provider (Mercado Pago, Culqi, Niubiz)
 * implements this and reports results through its webhook; the rest of the
 * order flow does not change.
 */
export interface PaymentGateway {
  readonly provider: string;
  createCheckout(request: PaymentRequest): Promise<CheckoutSession>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

/** Development provider: the customer approves or rejects on a local screen. */
@Injectable()
export class SimulatedPaymentGateway implements PaymentGateway {
  readonly provider = 'simulated';

  createCheckout(request: PaymentRequest): Promise<CheckoutSession> {
    return Promise.resolve({
      provider: this.provider,
      reference: `SIM-${randomUUID()}`,
      redirectUrl: `/pago/${request.orderCode}`,
    });
  }
}
