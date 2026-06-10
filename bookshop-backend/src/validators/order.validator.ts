import { z } from 'zod';

// Reference: context/02-domain/03-business-rules/order-rules.md

// BR-ORDER-006: Required fields
// BR-ORDER-007: Minimum quantity = 1
export const CreateOrderSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  bookId: z.string().uuid('Invalid book ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// BR-ORDER-004: Valid status values
// BR-ORDER-005: Status transition validation (enforced in service layer)
export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'shipped', 'delivered'], {
    errorMap: () => ({ message: 'Invalid status value' }),
  }),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusSchema>;
