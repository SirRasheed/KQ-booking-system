import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const where: Prisma.FlightWhereInput = {}

    if (origin) {
      where.origin = { contains: origin }
    }
    if (destination) {
      where.destination = { contains: destination }
    }
    if (status) {
      where.status = status
    }
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const flights = await db.flight.findMany({
      where,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { departureTime: 'asc' },
    })

    const flightsWithBookingCounts = flights.map((flight) => {
      const { _count, ...flightData } = flight
      return {
        ...flightData,
        bookingCount: _count.bookings,
      }
    })

    return NextResponse.json({
      success: true,
      flights: flightsWithBookingCounts,
    })
  } catch (error) {
    console.error('Get flights error:', error)
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
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      executiveSeats,
      middleSeats,
      lowSeats,
      executivePrice,
      middlePrice,
      lowPrice,
    } = body

    if (
      !flightNumber ||
      !origin ||
      !destination ||
      !departureTime ||
      !arrivalTime ||
      executiveSeats === undefined ||
      middleSeats === undefined ||
      lowSeats === undefined ||
      executivePrice === undefined ||
      middlePrice === undefined ||
      lowPrice === undefined
    ) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const existingFlight = await db.flight.findUnique({
      where: { flightNumber },
    })

    if (existingFlight) {
      return NextResponse.json(
        { error: 'Flight number already exists' },
        { status: 409 }
      )
    }

    const flight = await db.flight.create({
      data: {
        flightNumber,
        origin,
        destination,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        executiveSeats: Number(executiveSeats),
        middleSeats: Number(middleSeats),
        lowSeats: Number(lowSeats),
        executivePrice: Number(executivePrice),
        middlePrice: Number(middlePrice),
        lowPrice: Number(lowPrice),
      },
    })

    // Generate seats for the new flight
    const execCols = ['A', 'C', 'D', 'F']
    const midCols = ['A', 'B', 'C', 'D', 'E', 'F']
    const ecoCols = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K']

    const generateSeats = (totalSeats: number, travelClass: string, columns: string[], startRow: number) => {
      const seats: { flightId: string; seatNumber: string; row: number; column: string; travelClass: string; status: string }[] = []
      let seatsLeft = totalSeats
      let row = startRow
      while (seatsLeft > 0) {
        for (const col of columns) {
          if (seatsLeft <= 0) break
          seats.push({ flightId: flight.id, seatNumber: `${row}${col}`, row, column: col, travelClass, status: 'AVAILABLE' })
          seatsLeft--
        }
        row++
      }
      return seats
    }

    const execSeats = generateSeats(Number(executiveSeats), 'EXECUTIVE', execCols, 1)
    const midStartRow = Math.ceil(Number(executiveSeats) / 4) + 1
    const midSeats = generateSeats(Number(middleSeats), 'MIDDLE', midCols, midStartRow)
    const ecoStartRow = midStartRow + Math.ceil(Number(middleSeats) / 6) + 1
    const ecoSeats = generateSeats(Number(lowSeats), 'LOW', ecoCols, ecoStartRow)

    const allSeats = [...execSeats, ...midSeats, ...ecoSeats]
    for (let i = 0; i < allSeats.length; i += 50) {
      const batch = allSeats.slice(i, i + 50)
      await db.seat.createMany({ data: batch })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Flight created successfully',
        flight,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create flight error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
