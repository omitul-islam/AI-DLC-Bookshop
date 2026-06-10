import { z } from 'zod';

// Reference: context/02-domain/03-business-rules/customer-rules.md

// BR-CUSTOMER-001: Required fields (name, email, phone)
// BR-CUSTOMER-002: Email format validation
// BR-CUSTOMER-004: Phone format validation
// BR-CUSTOMER-005: Name validation
// BR-CUSTOMER-006: Address validation
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').min(10),
  address: z.string().max(500).optional(),
});

// BR-CUSTOMER-007: Update validation
export const UpdateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').min(10).optional(),
  address: z.string().max(500).optional(),
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerSchema>;
