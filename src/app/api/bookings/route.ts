import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const bookingRef = searchParams.get('bookingRef')

    const where: Prisma.BookingWhereInput = {}

    if (userId) {
      where.userId = userId
    }
    if (status) {
      where.status = status
    }
    if (bookingRef) {
      where.bookingRef = { contains: bookingRef }
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        flight: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      bookings,
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      flightId,
      travelClass,
      passengerName,
      passengerPassport,
      passengerEmail,
      passengerPhone,
      passengerNationality,
    } = body

    if (!userId || !flightId || !travelClass || !passengerName) {
      return NextResponse.json(
        { error: 'userId, flightId, travelClass, and passengerName are required' },
        { status: 400 }
      )
    }

    const validClasses = ['EXECUTIVE', 'MIDDLE', 'LOW']
    if (!validClasses.includes(travelClass)) {
      return NextResponse.json(
        { error: 'Invalid travel class. Must be EXECUTIVE, MIDDLE, or LOW' },
        { status: 400 }
      )
    }

    const flight = await db.flight.findUnique({
      where: { id: flightId },
    })

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      )
    }

    // Check seat availability
    const seatField = `${travelClass.toLowerCase()}Seats` as
      | 'executiveSeats'
      | 'middleSeats'
      | 'lowSeats'
    const priceField = `${travelClass.toLowerCase()}Price` as
      | 'executivePrice'
      | 'middlePrice'
      | 'lowPrice'

    const availableSeats = flight[seatField]
    if (availableSeats <= 0) {
      return NextResponse.json(
        { error: `No seats available in ${travelClass} class` },
        { status: 400 }
      )
    }

    const totalPrice = flight[priceField]

    // Generate booking reference
    const currentYear = new Date().getFullYear()
    const existingBookings = await db.booking.findMany({
      where: {
        bookingRef: {
          startsWith: `KQ-${currentYear}-`,
        },
      },
    })
    const nextNum = existingBookings.length + 1
    const bookingRef = `KQ-${currentYear}-${String(nextNum).padStart(3, '0')}`

    // Create booking and reduce seat count in transaction
    const booking = await db.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingRef,
          userId,
          flightId,
          travelClass,
          passengerName,
          passengerPassport: passengerPassport || null,
          passengerEmail: passengerEmail || null,
          passengerPhone: passengerPhone || null,
          passengerNationality: passengerNationality || null,
          totalPrice,
        },
        include: {
          flight: true,
        },
      })

      await tx.flight.update({
        where: { id: flightId },
        data: {
          [seatField]: { decrement: 1 },
        },
      })

      return newBooking
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        booking,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
