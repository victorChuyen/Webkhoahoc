import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z.object({
    full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 ký tự viết hoa')
        .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
    confirm_password: z.string(),
    role: z.enum(['student', 'instructor']).default('student'),
    referral_code: z.string().optional(),
}).refine(data => data.password === data.confirm_password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirm_password'],
});

export const profileSchema = z.object({
    full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    bio: z.string().max(500, 'Bio tối đa 500 ký tự').optional(),
    avatar_url: z.string().url('URL avatar không hợp lệ').optional().or(z.literal('')),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 ký tự viết hoa')
        .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
    confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirm_password'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
