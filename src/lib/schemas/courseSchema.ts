import { z } from 'zod';

export const courseSchema = z.object({
    title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(100, 'Tiêu đề tối đa 100 ký tự'),
    description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự').optional(),
    short_description: z.string().max(200, 'Mô tả ngắn tối đa 200 ký tự').optional(),
    price_vnd: z.number().min(0, 'Giá không được âm').default(0),
    price_usd: z.number().min(0, 'Giá không được âm').default(0),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    language: z.string().default('vi'),
    thumbnail_url: z.string().url('URL thumbnail không hợp lệ').optional().or(z.literal('')),
    preview_video_url: z.string().url('URL video không hợp lệ').optional().or(z.literal('')),
    published: z.boolean().default(false),
});

export const moduleSchema = z.object({
    id: z.string(),
    title: z.string().min(3, 'Tiêu đề module phải có ít nhất 3 ký tự'),
    video_url: z.string().url('URL video không hợp lệ').optional().or(z.literal('')),
    duration: z.number().min(0, 'Thời lượng không được âm').default(0),
    Payment: z.number(),
    description: z.string().optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;
export type ModuleFormData = z.infer<typeof moduleSchema>;
