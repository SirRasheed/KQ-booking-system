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
        seats: true,
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
      seatNumbers, // Array of seat numbers e.g. ["1A", "1C"]
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

    if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return NextResponse.json(
        { error: 'At least one seat must be selected' },
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

    // Verify all seats exist and are available
    const seats = await db.seat.findMany({
      where: {
        flightId,
        seatNumber: { in: seatNumbers },
      },
    })

    if (seats.length !== seatNumbers.length) {
      const foundSeats = seats.map(s => s.seatNumber)
      const notFound = seatNumbers.filter((s: string) => !foundSeats.includes(s))
      return NextResponse.json(
        { error: `Seats not found: ${notFound.join(', ')}` },
        { status: 400 }
      )
    }

    // Check all seats are in the correct class
    const wrongClass = seats.filter(s => s.travelClass !== travelClass)
    if (wrongClass.length > 0) {
      return NextResponse.json(
        { error: `Seats ${wrongClass.map(s => s.seatNumber).join(', ')} are not in ${travelClass} class` },
        { status: 400 }
      )
    }

    // Check all seats are available
    const occupiedSeats = seats.filter(s => s.status === 'OCCUPIED')
    if (occupiedSeats.length > 0) {
      return NextResponse.json(
        { error: `Seats already taken: ${occupiedSeats.map(s => s.seatNumber).join(', ')}` },
        { status: 400 }
      )
    }

    // Calculate price
    const priceField = `${travelClass.toLowerCase()}Price` as
      | 'executivePrice'
      | 'middlePrice'
      | 'lowPrice'

    const pricePerSeat = flight[priceField]
    const numSeats = seatNumbers.length
    const totalPrice = pricePerSeat * numSeats

    // Check overall seat availability
    const seatField = `${travelClass.toLowerCase()}Seats` as
      | 'executiveSeats'
      | 'middleSeats'
      | 'lowSeats'

    const availableSeats = flight[seatField]
    if (availableSeats < numSeats) {
      return NextResponse.json(
        { error: `Only ${availableSeats} seats available in ${travelClass} class, but ${numSeats} selected` },
        { status: 400 }
      )
    }

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

    // Create booking and update seats in transaction
    const booking = await db.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingRef,
          userId,
          flightId,
          travelClass,
          seatNumbers: seatNumbers.join(','),
          numSeats,
          passengerName,
          passengerPassport: passengerPassport || null,
          passengerEmail: passengerEmail || null,
          passengerPhone: passengerPhone || null,
          passengerNationality: passengerNationality || null,
          totalPrice,
        },
        include: {
          flight: true,
          seats: true,
        },
      })

      // Mark seats as occupied
      await tx.seat.updateMany({
        where: {
          flightId,
          seatNumber: { in: seatNumbers },
        },
        data: {
          status: 'OCCUPIED',
          bookingId: newBooking.id,
        },
      })

      // Reduce available seat count
      await tx.flight.update({
        where: { id: flightId },
        data: {
          [seatField]: { decrement: numSeats },
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
