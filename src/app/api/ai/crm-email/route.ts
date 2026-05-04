import { NextRequest, NextResponse } from 'next/server';

// ==========================================
// MULTI-KEY ROUND ROBIN + AUTO-BLACKLIST
// ==========================================
const ALL_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Track bad keys in memory (resets on server restart)
const badKeys = new Set<string>();

function getActiveKeys(): string[] {
    return ALL_KEYS.filter(k => !badKeys.has(k));
}

let currentKeyIndex = 0;
function getNextActiveKey(): string | null {
    const active = getActiveKeys();
    if (active.length === 0) return null;
    const key = active[currentKeyIndex % active.length];
    currentKeyIndex++;
    return key;
}

interface CrmEmailRequest {
    studentName: string;
    studentEmail: string;
    courseName: string;
    daysEnrolled: number;
    completedModules: number;
    crmStatus: string;
}

async function callGemini(prompt: string, attemptsLeft?: number): Promise<any> {
    const activeKeys = getActiveKeys();
    if (attemptsLeft === undefined) attemptsLeft = activeKeys.length;
    if (attemptsLeft <= 0 || activeKeys.length === 0) {
        throw new Error(`Tất cả ${ALL_KEYS.length} keys đều bị lỗi. Keys active: 0. Vui lòng thêm key mới.`);
    }

    const key = getNextActiveKey()!;

    const response = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (response.status === 403) {
        // Key suspended → permanently blacklist
        badKeys.add(key);
        console.warn(`🔴 Key ...${key.slice(-6)} SUSPENDED → blacklisted (${getActiveKeys().length}/${ALL_KEYS.length} active)`);
        return callGemini(prompt, attemptsLeft - 1);
    }

    if (response.status === 429) {
        // Rate limited → skip for now (don't permanently blacklist)
        console.warn(`🟡 Key ...${key.slice(-6)} rate limited, trying next (${attemptsLeft - 1} left)`);
        return callGemini(prompt, attemptsLeft - 1);
    }

    if (response.status === 500) {
        console.warn(`🟠 Key ...${key.slice(-6)} server error, trying next`);
        return callGemini(prompt, attemptsLeft - 1);
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) throw new Error('Empty response from Gemini');

    return JSON.parse(textContent);
}

// Health check endpoint: GET /api/ai/crm-email → shows key status
export async function GET() {
    const active = getActiveKeys();
    return NextResponse.json({
        total_keys: ALL_KEYS.length,
        active_keys: active.length,
        blacklisted_keys: badKeys.size,
        blacklisted: Array.from(badKeys).map(k => `...${k.slice(-6)}`),
        status: active.length > 0 ? '✅ Ready' : '❌ No active keys',
    });
}

export async function POST(req: NextRequest) {
    try {
        if (ALL_KEYS.length === 0) {
            return NextResponse.json({ error: 'GEMINI_API_KEYS not configured in .env.local' }, { status: 500 });
        }

        const activeCount = getActiveKeys().length;
        if (activeCount === 0) {
            return NextResponse.json({
                error: `Tất cả ${ALL_KEYS.length} keys đều bị suspended. Vui lòng thêm key mới vào GEMINI_API_KEYS trong .env.local`
            }, { status: 503 });
        }

        const body: CrmEmailRequest = await req.json();
        const { studentName, studentEmail, courseName, daysEnrolled, completedModules, crmStatus } = body;

        const prompt = `Bạn là trợ lý CRM chăm sóc học viên cho nền tảng học trực tuyến "CourseMarket VN".

THÔNG TIN HỌC VIÊN:
- Tên: ${studentName}
- Email: ${studentEmail}
- Khóa học: "${courseName}"
- Đã ghi danh: ${daysEnrolled} ngày trước
- Số bài đã hoàn thành: ${completedModules} bài
- Trạng thái CRM: ${crmStatus}

YÊU CẦU: Viết 1 email chăm sóc cá nhân hóa bằng tiếng Việt (tone thân thiện, chuyên nghiệp) gồm:
1. Lời chào cá nhân hóa theo tên
2. Nhận xét về tiến độ học tập (khen ngợi nếu tốt, động viên nếu chậm)
3. Gợi ý hành động cụ thể tiếp theo
4. Call-to-action rõ ràng
5. Nếu ${daysEnrolled} >= 30 ngày và ${completedModules} < 3: thêm ưu đãi giảm giá 20% khóa tiếp theo
6. Nếu ${daysEnrolled} < 5: chào mừng + hướng dẫn bắt đầu

ĐỊNH DẠNG OUTPUT (JSON):
{
  "subject": "Tiêu đề email ngắn gọn, hấp dẫn",
  "body": "Nội dung email đầy đủ (plain text, dùng \\n cho xuống dòng)",
  "coaching_tip": "1 lời khuyên coaching dành riêng cho học viên này",
  "suggested_schedule": "Gợi ý thời điểm follow-up tiếp theo (ví dụ: 3 ngày nữa)"
}

Chỉ trả về JSON thuần, không có markdown hay giải thích.`;

        const result = await callGemini(prompt);

        return NextResponse.json({
            ...result,
            _meta: { keys_active: getActiveKeys().length, keys_total: ALL_KEYS.length }
        });
    } catch (error: any) {
        console.error('CRM AI Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
