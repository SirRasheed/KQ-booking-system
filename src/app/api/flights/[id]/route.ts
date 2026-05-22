import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const flight = await db.flight.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    })

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      )
    }

    const { _count, ...flightData } = flight

    return NextResponse.json({
      success: true,
      flight: {
        ...flightData,
        bookingCount: _count.bookings,
      },
    })
  } catch (error) {
    console.error('Get flight error:', error)
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

    const flight = await db.flight.findUnique({
      where: { id },
    })

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'flightNumber',
      'origin',
      'destination',
      'departureTime',
      'arrivalTime',
      'executiveSeats',
      'middleSeats',
      'lowSeats',
      'executivePrice',
      'middlePrice',
      'lowPrice',
      'status',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'departureTime' || field === 'arrivalTime') {
          updateData[field] = new Date(body[field])
        } else if (
          [
            'executiveSeats',
            'middleSeats',
            'lowSeats',
            'executivePrice',
            'middlePrice',
            'lowPrice',
          ].includes(field)
        ) {
          updateData[field] = Number(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const updatedFlight = await db.flight.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Flight updated successfully',
      flight: updatedFlight,
    })
  } catch (error) {
    console.error('Update flight error:', error)
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

    const flight = await db.flight.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    })

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      )
    }

    if (flight.bookings.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete flight with confirmed bookings. Cancel all bookings first.',
        },
        { status: 400 }
      )
    }

    await db.flight.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Flight deleted successfully',
    })
  } catch (error) {
    console.error('Delete flight error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
