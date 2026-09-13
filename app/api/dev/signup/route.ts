import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: 'Add SUPABASE_SERVICE_ROLE_KEY to .env (Supabase → Settings → API)' },
      { status: 500 }
    )
  }

  const body = (await request.json()) as { email?: string; password?: string }
  const email = body.email?.trim()
  const password = body.password

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
