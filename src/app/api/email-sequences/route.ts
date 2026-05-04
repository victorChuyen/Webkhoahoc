import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch all sequences, optionally filtered by course_id
export async function GET(req: NextRequest) {
    const supabase = createClient();
    const courseId = req.nextUrl.searchParams.get('course_id');

    let query = supabase
        .from('email_sequences')
        .select('*, course:courses!course_id(id, title)')
        .order('course_id')
        .order('step_order', { ascending: true });

    if (courseId) {
        query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST: Create a new sequence step
export async function POST(req: NextRequest) {
    const supabase = createClient();
    const body = await req.json();

    const { data, error } = await supabase
        .from('email_sequences')
        .insert({
            course_id: body.course_id,
            step_order: body.step_order || 1,
            delay_days: body.delay_days || 0,
            subject: body.subject,
            body_template: body.body_template,
            is_active: body.is_active !== false,
            created_by: body.created_by,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}

// PUT: Update a sequence step
export async function PUT(req: NextRequest) {
    const supabase = createClient();
    const body = await req.json();

    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data, error } = await supabase
        .from('email_sequences')
        .update({
            step_order: body.step_order,
            delay_days: body.delay_days,
            subject: body.subject,
            body_template: body.body_template,
            is_active: body.is_active,
            updated_at: new Date().toISOString(),
        })
        .eq('id', body.id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// DELETE: Remove a sequence step
export async function DELETE(req: NextRequest) {
    const supabase = createClient();
    const id = req.nextUrl.searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
