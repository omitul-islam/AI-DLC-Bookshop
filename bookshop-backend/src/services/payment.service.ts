import { v4 as uuidv4 } from 'uuid';
import { db, type Order } from '../db/database';

const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || 'sandbox_store_id';
const SSLCOMMERZ_STORE_PASS = process.env.SSLCOMMERZ_STORE_PASS || 'sandbox_store_pass';
const SSLCOMMERZ_SANDBOX = process.env.SSLCOMMERZ_SANDBOX === 'true';
const SSLCOMMERZ_BASE_URL = process.env.SSLCOMMERZ_BASE_URL || 'http://localhost:3000';

const SSLCOMMERZ_INIT_URL = SSLCOMMERZ_SANDBOX
  ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

const SSLCOMMERZ_VALIDATE_URL = SSLCOMMERZ_SANDBOX
  ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

export interface PaymentInitRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}

export interface PaymentInitResponse {
  success: boolean;
  gatewayPageURL?: string;
  sessionkey?: string;
  error?: string;
}

export interface SSLCommerzResponse {
  status: string;
  tran_id: string;
  val_id: string;
  amount: string;
  currency: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  value_a: string;
  value_b: string;
  value_c: string;
  value_d: string;
  tran_date: string;
  api_connect: string;
  validated_on: string;
  gw_version: string;
  error?: string;
}

async function callSSLCommerz(url: string, params: Record<string, string>): Promise<any> {
  const formData = new URLSearchParams(params);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  return response.json();
}

export async function initiatePayment(req: PaymentInitRequest): Promise<PaymentInitResponse> {
  const tranId = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;

  const params: Record<string, string> = {
    store_id: SSLCOMMERZ_STORE_ID,
    store_passwd: SSLCOMMERZ_STORE_PASS,
    total_amount: req.amount.toFixed(2),
    currency: req.currency,
    tran_id: tranId,
    success_url: req.successUrl,
    fail_url: req.failUrl,
    cancel_url: req.cancelUrl,
    ipn_url: req.ipnUrl,
    cus_name: req.customerName,
    cus_email: req.customerEmail,
    cus_phone: req.customerPhone,
    cus_add1: req.customerAddress || 'N/A',
    cus_city: req.customerCity || 'Dhaka',
    cus_country: req.customerCountry || 'Bangladesh',
    shipping_method: 'NO',
    product_name: 'Bookshop Order',
    product_category: 'Books',
    product_profile: 'physical-goods',
    multi_card_name: 'mastercard,visa,amex',
  };

  const response = await callSSLCommerz(SSLCOMMERZ_INIT_URL, params);

  if (response.GatewayPageURL && response.sessionkey) {
    return {
      success: true,
      gatewayPageURL: response.GatewayPageURL,
      sessionkey: response.sessionkey,
    };
  }

  return {
    success: false,
    error: response.error || response.failedreason || 'Failed to initiate payment',
  };
}

export async function validatePayment(valId: string): Promise<SSLCommerzResponse> {
  const params = {
    val_id: valId,
    store_id: SSLCOMMERZ_STORE_ID,
    store_passwd: SSLCOMMERZ_STORE_PASS,
    format: 'json',
    v: 1,
  };

  return callSSLCommerz(SSLCOMMERZ_VALIDATE_URL, params);
}

export async function handlePaymentSuccess(
  tranId: string,
  valId: string,
  amount: string,
  cardType: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const validation = await validatePayment(valId);

  if (validation.status !== 'VALID' && validation.status !== 'VALIDATED') {
    return { success: false, error: `Payment validation failed: ${validation.status}` };
  }

  if (parseFloat(validation.amount) !== parseFloat(amount)) {
    return { success: false, error: 'Amount mismatch' };
  }

  const order = await db.findOrderById(tranId.replace('TXN-', ''));
  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  const updatedOrder = await db.updateOrder(order.id, {
    status: 'confirmed',
  });

  await db.createAuditLog({
    id: uuidv4(),
    entityType: 'order',
    entityId: order.id,
    action: 'updated',
    previousState: { status: order.status },
    newState: { status: 'confirmed', paymentTranId: tranId, paymentValId: valId },
    performedBy: 'sslcommerz',
    createdAt: new Date(),
  });

  return { success: true, order: updatedOrder! };
}

export async function handlePaymentFail(tranId: string): Promise<void> {
  const orderId = tranId.replace('TXN-', '');
  const order = await db.findOrderById(orderId);
  if (order) {
    await db.updateOrder(order.id, { status: 'cancelled', cancelReason: 'Payment failed' });
    await db.createAuditLog({
      id: uuidv4(),
      entityType: 'order',
      entityId: order.id,
      action: 'updated',
      previousState: { status: order.status },
      newState: { status: 'cancelled', reason: 'Payment failed' },
      performedBy: 'sslcommerz',
      createdAt: new Date(),
    });
  }
}

export async function handlePaymentCancel(tranId: string): Promise<void> {
  const orderId = tranId.replace('TXN-', '');
  const order = await db.findOrderById(orderId);
  if (order) {
    await db.updateOrder(order.id, { status: 'cancelled', cancelReason: 'Payment cancelled by user' });
    await db.createAuditLog({
      id: uuidv4(),
      entityType: 'order',
      entityId: order.id,
      action: 'updated',
      previousState: { status: order.status },
      newState: { status: 'cancelled', reason: 'Payment cancelled by user' },
      performedBy: 'sslcommerz',
      createdAt: new Date(),
    });
  }
}