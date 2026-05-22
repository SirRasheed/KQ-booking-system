import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        flight: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking,
    })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const booking = await db.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // If cancelling, restore seat count
    if (body.status === 'CANCELLED' && booking.status !== 'CANCELLED') {
      const seatField = `${booking.travelClass.toLowerCase()}Seats` as
        | 'executiveSeats'
        | 'middleSeats'
        | 'lowSeats'

      await db.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id },
          data: { status: 'CANCELLED' },
        })

        await tx.flight.update({
          where: { id: booking.flightId },
          data: {
            [seatField]: { increment: 1 },
          },
        })
      })

      const updatedBooking = await db.booking.findUnique({
        where: { id },
        include: { flight: true },
      })

      return NextResponse.json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: updatedBooking,
      })
    }

    // General update for other fields
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'travelClass',
      'passengerName',
      'passengerPassport',
      'passengerEmail',
      'passengerPhone',
      'passengerNationality',
      'status',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: updateData,
      include: { flight: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await db.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // If booking is confirmed, restore seat count
    if (booking.status === 'CONFIRMED') {
      const seatField = `${booking.travelClass.toLowerCase()}Seats` as
        | 'executiveSeats'
        | 'middleSeats'
        | 'lowSeats'

      await db.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id },
          data: { status: 'CANCELLED' },
        })

        await tx.flight.update({
          where: { id: booking.flightId },
          data: {
            [seatField]: { increment: 1 },
          },
        })
      })
    } else {
      await db.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
