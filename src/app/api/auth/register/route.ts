import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, nationality, passportId } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const user = await db.user.create({
      data: {
        email,
        password,
        name,
        phone: phone || null,
        nationality: nationality || null,
        passportId: passportId || null,
        role: 'PASSENGER',
      },
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
