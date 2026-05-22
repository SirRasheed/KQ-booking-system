import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const reports = await db.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      reports,
    })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, generatedBy } = body

    if (!type || !generatedBy) {
      return NextResponse.json(
        { error: 'Type and generatedBy are required' },
        { status: 400 }
      )
    }

    const validTypes = [
      'TICKETS_SOLD',
      'DAILY_BOOKINGS',
      'CANCELLED_BOOKINGS',
      'PASSENGER_LIST',
      'EMPLOYEE_ASSIGNMENTS',
      'SUCCESSFUL_MATCHES',
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: generatedBy },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let reportData: Record<string, unknown> = {}
    let title = ''

    switch (type) {
      case 'TICKETS_SOLD': {
        title = 'Tickets Sold Report'
        const bookings = await db.booking.findMany({
          where: { status: 'CONFIRMED' },
          include: { flight: true },
        })
        const totalTickets = bookings.length
        const totalRevenue = bookings.reduce(
          (sum, b) => sum + b.totalPrice,
          0
        )
        const byClass = {
          executive: bookings.filter((b) => b.travelClass === 'EXECUTIVE')
            .length,
          middle: bookings.filter((b) => b.travelClass === 'MIDDLE').length,
          low: bookings.filter((b) => b.travelClass === 'LOW').length,
        }
        reportData = { totalTickets, totalRevenue, byClass, bookings }
        break
      }

      case 'DAILY_BOOKINGS': {
        title = 'Daily Bookings Report'
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayBookings = await db.booking.findMany({
          where: {
            createdAt: {
              gte: today,
            },
          },
          include: { flight: true },
          orderBy: { createdAt: 'desc' },
        })
        reportData = {
          date: today.toISOString(),
          totalBookings: todayBookings.length,
          confirmed: todayBookings.filter((b) => b.status === 'CONFIRMED')
            .length,
          cancelled: todayBookings.filter((b) => b.status === 'CANCELLED')
            .length,
          bookings: todayBookings,
        }
        break
      }

      case 'CANCELLED_BOOKINGS': {
        title = 'Cancelled Bookings Report'
        const cancelledBookings = await db.booking.findMany({
          where: { status: 'CANCELLED' },
          include: { flight: true },
          orderBy: { updatedAt: 'desc' },
        })
        reportData = {
          totalCancelled: cancelledBookings.length,
          lostRevenue: cancelledBookings.reduce(
            (sum, b) => sum + b.totalPrice,
            0
          ),
          bookings: cancelledBookings,
        }
        break
      }

      case 'PASSENGER_LIST': {
        title = 'Passenger List Report'
        const passengers = await db.user.findMany({
          where: { role: 'PASSENGER' },
          include: {
            _count: {
              select: { bookings: true },
            },
          },
        })
        const passengerList = passengers.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          nationality: p.nationality,
          bookingCount: p._count.bookings,
        }))
        reportData = {
          totalPassengers: passengerList.length,
          passengers: passengerList,
        }
        break
      }

      case 'EMPLOYEE_ASSIGNMENTS': {
        title = 'Employee Assignments Report'
        const employees = await db.employee.findMany()
        const byStatus = {
          available: employees.filter((e) => e.status === 'AVAILABLE').length,
          assigned: employees.filter((e) => e.status === 'ASSIGNED').length,
          onLeave: employees.filter((e) => e.status === 'ON_LEAVE').length,
        }
        const byRole = {
          ticketingOfficer: employees.filter(
            (e) => e.role === 'TICKETING_OFFICER'
          ).length,
          customerService: employees.filter(
            (e) => e.role === 'CUSTOMER_SERVICE'
          ).length,
          groundStaff: employees.filter((e) => e.role === 'GROUND_STAFF')
            .length,
          supervisor: employees.filter((e) => e.role === 'SUPERVISOR').length,
        }
        reportData = {
          totalEmployees: employees.length,
          byStatus,
          byRole,
          employees,
        }
        break
      }

      case 'SUCCESSFUL_MATCHES': {
        title = 'Successful Matches Report'
        const assignedEmployees = await db.employee.findMany({
          where: { status: 'ASSIGNED' },
        })
        const matches = assignedEmployees
          .filter((e) => e.assignedTask)
          .map((e) => ({
            employee: e.name,
            role:
              e.role === 'TICKETING_OFFICER'
                ? 'Ticketing Officer'
                : e.role === 'CUSTOMER_SERVICE'
                  ? 'Customer Service'
                  : e.role === 'GROUND_STAFF'
                    ? 'Ground Staff'
                    : e.role === 'SUPERVISOR'
                      ? 'Supervisor'
                      : e.role,
            task: e.assignedTask,
          }))
        reportData = {
          totalMatches: matches.length,
          matches,
        }
        break
      }
    }

    const report = await db.report.create({
      data: {
        type,
        title,
        data: JSON.stringify(reportData),
        generatedBy,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Report generated successfully',
        report,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
