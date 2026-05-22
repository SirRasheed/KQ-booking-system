import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const flightId = searchParams.get('flightId')
    const travelClass = searchParams.get('travelClass')

    if (!flightId) {
      return NextResponse.json(
        { error: 'flightId is required' },
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

    const where: { flightId: string; travelClass?: string } = { flightId }
    if (travelClass) {
      where.travelClass = travelClass
    }

    const seats = await db.seat.findMany({
      where,
      orderBy: [{ travelClass: 'asc' }, { row: 'asc' }, { column: 'asc' }],
    })

    // Group seats by travel class
    const seatsByClass = {
      EXECUTIVE: seats.filter(s => s.travelClass === 'EXECUTIVE'),
      MIDDLE: seats.filter(s => s.travelClass === 'MIDDLE'),
      LOW: seats.filter(s => s.travelClass === 'LOW'),
    }

    return NextResponse.json({
      success: true,
      seats,
      seatsByClass,
      flightInfo: {
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        destination: flight.destination,
        executivePrice: flight.executivePrice,
        middlePrice: flight.middlePrice,
        lowPrice: flight.lowPrice,
      },
    })
  } catch (error) {
    console.error('Get seats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
