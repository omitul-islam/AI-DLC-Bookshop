import apiClient from './client';
import type { CartValidateRequest, CartValidateResponse, CheckoutRequest, CheckoutResponse } from '../types';

export const cartApi = {
  validate: (data: CartValidateRequest): Promise<CartValidateResponse> =>
    apiClient.post('/cart/validate', data),

  checkout: (data: CheckoutRequest): Promise<CheckoutResponse> =>
    apiClient.post('/cart/checkout', data),
};