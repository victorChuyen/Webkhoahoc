import { z } from 'zod';

export const paymentschema = z.object({
    course_id: z.string().uuid('Course ID không hợp lệ'),
    payment_method: z.enum(['vnpay', 'momo', 'paypal']),
    currency: z.enum(['VND', 'USD']).default('VND'),
});

export type paymentFormData = z.infer<typeof paymentschema>;
