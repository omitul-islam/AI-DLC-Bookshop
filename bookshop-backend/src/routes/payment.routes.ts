import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { orderService } from '../services/order.service';
import { db } from '../db/database';
import {
  initiatePayment,
  handlePaymentSuccess,
  handlePaymentFail,
  handlePaymentCancel,
  validatePayment,
} from '../services/payment.service';

const router = Router();

const InitiatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  successUrl: z.string().url(),
  failUrl: z.string().url(),
  cancelUrl: z.string().url(),
  ipnUrl: z.string().url(),
});

router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const validated = InitiatePaymentSchema.parse(req.body);

    const order = await orderService.getOrder(validated.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const customer = await db.findCustomerById(order.customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const paymentResult = await initiatePayment({
      orderId: order.id,
      amount: order.totalPrice,
      currency: 'BDT',
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      successUrl: validated.successUrl,
      failUrl: validated.failUrl,
      cancelUrl: validated.cancelUrl,
      ipnUrl: validated.ipnUrl,
    });

    if (!paymentResult.success) {
      return res.status(400).json({ error: paymentResult.error });
    }

    res.json({
      gatewayPageURL: paymentResult.gatewayPageURL,
      sessionkey: paymentResult.sessionkey,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/success', async (req: Request, res: Response) => {
  try {
    const { tran_id, val_id, amount, card_type } = req.body;

    const result = await handlePaymentSuccess(tran_id, val_id, amount, card_type);

    if (!result.success) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?error=${encodeURIComponent(result.error || 'Payment validation failed')}`);
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${result.order?.id}`);
  } catch (error: any) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?error=${encodeURIComponent(error.message)}`);
  }
});

router.post('/fail', async (req: Request, res: Response) => {
  try {
    const { tran_id } = req.body;
    await handlePaymentFail(tran_id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?error=Payment failed`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?error=Payment failed`);
  }
});

router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const { tran_id } = req.body;
    await handlePaymentCancel(tran_id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancelled`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancelled`);
  }
});

router.post('/ipn', async (req: Request, res: Response) => {
  try {
    const { val_id, tran_id, amount, card_type, status } = req.body;

    if (status === 'VALID' || status === 'VALIDATED') {
      await handlePaymentSuccess(tran_id, val_id, amount, card_type);
    } else if (status === 'FAILED') {
      await handlePaymentFail(tran_id);
    } else if (status === 'CANCELLED') {
      await handlePaymentCancel(tran_id);
    }

    res.send('OK');
  } catch {
    res.send('OK');
  }
});

router.get('/validate/:valId', async (req: Request, res: Response) => {
  try {
    const validation = await validatePayment(req.params.valId);
    res.json(validation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;