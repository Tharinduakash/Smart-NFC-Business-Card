import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'
import { ensureDatabase } from '@/lib/db'
import { z } from 'zod'

const signupSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name:     z.string().min(1, 'Name is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Ensure DB schema is up to date before any query
    await ensureDatabase()

    const body = await request.json()
    const { email, password, name } = signupSchema.parse(body)

    // Check if email is already registered
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }  // 409 Conflict is the correct status for duplicate resource
      )
    }

    // Split name into first/last for storage
    const parts     = name.trim().split(/\s+/)
    const firstName = parts[0]
    const lastName  = parts.slice(1).join(' ') || undefined

    const user = await createUser(email, password, firstName, lastName)

    return NextResponse.json(
      {
        user: {
          id:    user.id,
          email: user.email,
          name:  [user.first_name, user.last_name].filter(Boolean).join(' '),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }
    console.error('[signup] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
