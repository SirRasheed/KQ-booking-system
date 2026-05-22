import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const passengers = await db.user.findMany({
      where: { role: 'PASSENGER' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const passengersWithCounts = passengers.map((passenger) => {
      const { password: _, _count, ...passengerData } = passenger
      return {
        ...passengerData,
        bookingCount: _count.bookings,
      }
    })

    return NextResponse.json({
      success: true,
      passengers: passengersWithCounts,
    })
  } catch (error) {
    console.error('Get passengers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
