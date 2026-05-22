import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Total counts
    const totalFlights = await db.flight.count()
    const totalBookings = await db.booking.count()
    const totalPassengers = await db.user.count({
      where: { role: 'PASSENGER' },
    })
    const totalEmployees = await db.employee.count()

    // Booking status counts
    const confirmedBookings = await db.booking.count({
      where: { status: 'CONFIRMED' },
    })
    const cancelledBookings = await db.booking.count({
      where: { status: 'CANCELLED' },
    })

    // Total revenue from confirmed bookings
    const confirmedBookingRecords = await db.booking.findMany({
      where: { status: 'CONFIRMED' },
      select: { totalPrice: true },
    })
    const totalRevenue = confirmedBookingRecords.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    )

    // Bookings by class
    const executiveCount = await db.booking.count({
      where: { travelClass: 'EXECUTIVE', status: 'CONFIRMED' },
    })
    const middleCount = await db.booking.count({
      where: { travelClass: 'MIDDLE', status: 'CONFIRMED' },
    })
    const lowCount = await db.booking.count({
      where: { travelClass: 'LOW', status: 'CONFIRMED' },
    })

    // Recent bookings
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        flight: true,
      },
    })

    // Popular destinations
    const bookingsWithFlights = await db.booking.findMany({
      where: { status: 'CONFIRMED' },
      include: {
        flight: {
          select: { destination: true },
        },
      },
    })

    const destinationCounts: Record<string, number> = {}
    for (const booking of bookingsWithFlights) {
      const dest = booking.flight.destination
      destinationCounts[dest] = (destinationCounts[dest] || 0) + 1
    }

    const popularDestinations = Object.entries(destinationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([destination, count]) => ({ destination, count }))

    return NextResponse.json({
      success: true,
      dashboard: {
        totalFlights,
        totalBookings,
        totalPassengers,
        totalEmployees,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        bookingsByClass: {
          executive: executiveCount,
          middle: middleCount,
          low: lowCount,
        },
        recentBookings,
        popularDestinations,
      },
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
