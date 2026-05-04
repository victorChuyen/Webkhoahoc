const fs = require('fs');

const instructorId = '00000000-0000-0000-0000-000000000001';
const ytEmbeds = [
    'https://www.youtube.com/embed/WzTQJVYGEhQ',
    'https://www.youtube.com/embed/jBzwzrDvZ18',
    'https://www.youtube.com/embed/t9m0_yXwEow',
    'https://www.youtube.com/embed/Airvtyq1sAE',
    'https://www.youtube.com/embed/bMknfKXIFA8'
];
const thumbnails = [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
    'https://images.unsplash.com/photo-1692312344458-466d338a0c20',
    'https://images.unsplash.com/photo-1676299081847-824916de030a',
    'https://images.unsplash.com/photo-1655393001768-d946c98d6958'
];

const categories = [
    { id: '10000000-0000-0000-0000-000000000005', name: 'AI & Machine Learning' },
    { id: '10000000-0000-0000-0000-000000000001', name: 'Lập trình Web' },
    { id: '10000000-0000-0000-0000-000000000002', name: 'Khoa học dữ liệu' }
];

const titles = [
    'Vibe Coding Scratch: AI No-Code Apps',
    'Cursor & GitHub Copilot Workflow',
    'Xây dựng ChatGPT Clone với Next.js 14',
    'Prompt Engineering cho Developer',
    'LangChain & Vector DB Toàn Tập',
    'AI Agents: AutoGPT & BabyAGI',
    'Tạo hình ảnh AI với Midjourney v6',
    'Học Python với ChatGPT trong 7 ngày',
    'Fine-tuning Llama 3 từ Zero',
    'Tự động hóa với Zapier & OpenAI API',
    'Thiết kế UI/UX siêu tốc với v0 & Figma',
    'Phân tích dữ liệu bằng ChatGPT Code Interpreter',
    'AI Music & Video Generation',
    'Lập trình Web3 với AI Copilot',
    'Bảo mật AI & Prompt Injection',
    'Học tiếng Anh IT hiệu quả qua AI',
    'Viết nội dung chuẩn SEO với Claude 3',
    'Xây dựng SaaS bằng Supabase & AI',
    'React Server Components & AI',
    'Hướng dẫn dùng OpenAI Assistants API'
];

let coursesSql = '';
let courseCatSql = '';

const UUIDS = Array.from({ length: 20 }, (_, i) => `30000000-0000-0000-0000-0000000000${(i + 1).toString().padStart(2, '0')}`);

for (let i = 0; i < 20; i++) {
    const courseId = UUIDS[i];
    const catId = categories[i % categories.length].id;

    const modules = [
        { id: `m${i}-1`, title: 'Bài 1: Giới thiệu khóa học', video_url: ytEmbeds[i % ytEmbeds.length], duration: 900, order: 1 },
        { id: `m${i}-2`, title: 'Bài 2: Hướng dẫn thực hành', video_url: ytEmbeds[(i + 1) % ytEmbeds.length], duration: 1500, order: 2 },
        { id: `m${i}-3`, title: 'Bài 3: Bài tập cuối khóa', video_url: ytEmbeds[(i + 2) % ytEmbeds.length], duration: 1200, order: 3 }
    ];

    coursesSql += `
    ('${courseId}', '${titles[i]}', 'Khóa học AI thực chiến, bắt kịp xu hướng công nghệ 2026. Phù hợp cho người mới bắt đầu.', 'Khóa học AI thực chiến cho Beginners 2026.', 0, 0, '${instructorId}', '${thumbnails[i % thumbnails.length]}', '${JSON.stringify(modules)}'::JSONB, true, ${i < 4})
  `.trim();

    if (i < 19) coursesSql += ',\n    ';
    else coursesSql += ' ON CONFLICT DO NOTHING;\n\n';

    courseCatSql += `    ('${courseId}', '${catId}')`;
    if (i < 19) courseCatSql += ',\n';
    else courseCatSql += ' ON CONFLICT DO NOTHING;\n\n';
}

const seedSql = `
-- ==========================================
-- COURSEMARKET VN - SEED DATA
-- ==========================================

-- SEED: categories
INSERT INTO public.categories (id, name, slug, icon) VALUES 
('10000000-0000-0000-0000-000000000001', 'Lập trình Web', 'web-development', '💻'),
('10000000-0000-0000-0000-000000000002', 'Khoa học dữ liệu', 'data-science', '📊'),
('10000000-0000-0000-0000-000000000003', 'Thiết kế UI/UX', 'ui-ux-design', '🎨'),
('10000000-0000-0000-0000-000000000004', 'Marketing số', 'digital-marketing', '📈'),
('10000000-0000-0000-0000-000000000005', 'AI & Machine Learning', 'ai-ml', '🤖'),
('10000000-0000-0000-0000-000000000006', 'Mobile Development', 'mobile-dev', '📱')
ON CONFLICT DO NOTHING;

-- SEED: users
INSERT INTO public.users (id, email, provider, role, full_name, avatar_url) VALUES 
('20000000-0000-0000-0000-000000000001', 'admin@coursemarket.vn', 'email', 'admin', 'Quản trị viên', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
('00000000-0000-0000-0000-000000000001', 'demo@instructor.vn', 'email', 'instructor', 'AI Guru VN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor'),
('20000000-0000-0000-0000-000000000003', 'student@coursemarket.vn', 'email', 'student', 'Trần Thị Học', 'https://api.dicebear.com/7.x/avataaars/svg?seed=student')
ON CONFLICT DO NOTHING;

-- SEED: 20 courses
INSERT INTO public.courses (id, title, description, short_description, price_vnd, price_usd, instructor_id, thumbnail_url, modules, published, featured) VALUES 
    ${coursesSql}

-- SEED: course_categories
INSERT INTO public.course_categories (course_id, category_id) VALUES 
${courseCatSql}

-- SEED: enrollments (1 enrollment for student)
INSERT INTO public.enrollments (user_id, course_id, completion_percentage, progress) VALUES 
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 33, '{"m0-1": true, "m0-2": false, "m0-3": false, "last_module": "m0-1"}'::JSONB)
ON CONFLICT DO NOTHING;

-- SEED: payments
INSERT INTO public.payments (user_id, course_id, amount_vnd, amount_usd, currency, payment_method, status, provider_ref, created_at) VALUES 
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 0, 0, 'VND', 'mock', 'paid', 'MOCK-1', NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- SEED: reviews
INSERT INTO public.reviews (user_id, course_id, rating, comment) VALUES 
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 5, 'Khóa học cực hay, công cụ AI rất thực chiến!')
ON CONFLICT DO NOTHING;

-- UPDATE stats
UPDATE public.courses SET total_students = 1, total_reviews = 1, avg_rating = 5 WHERE id = '30000000-0000-0000-0000-000000000001';
`;

fs.writeFileSync('supabase/seed.sql', seedSql);
console.log('Generated seed.sql successfully.');
