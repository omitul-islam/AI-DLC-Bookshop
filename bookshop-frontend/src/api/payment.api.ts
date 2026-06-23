import apiClient from './client';

export interface InitiatePaymentRequest {
  orderId: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}

export interface InitiatePaymentResponse {
  gatewayPageURL: string;
  sessionkey: string;
}

export const paymentApi = {
  initiate: (data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> =>
    apiClient.post('/payment/initiate', data),
};