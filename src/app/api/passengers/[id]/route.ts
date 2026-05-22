import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const passenger = await db.user.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            flight: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!passenger || passenger.role !== 'PASSENGER') {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      )
    }

    const { password: _, ...passengerWithoutPassword } = passenger

    return NextResponse.json({
      success: true,
      passenger: passengerWithoutPassword,
    })
  } catch (error) {
    console.error('Get passenger error:', error)
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

    const passenger = await db.user.findUnique({
      where: { id },
    })

    if (!passenger || passenger.role !== 'PASSENGER') {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'phone', 'nationality', 'passportId']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedPassenger = await db.user.update({
      where: { id },
      data: updateData,
    })

    const { password: _, ...passengerWithoutPassword } = updatedPassenger

    return NextResponse.json({
      success: true,
      message: 'Passenger updated successfully',
      passenger: passengerWithoutPassword,
    })
  } catch (error) {
    console.error('Update passenger error:', error)
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

    const passenger = await db.user.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED'],
            },
          },
        },
      },
    })

    if (!passenger || passenger.role !== 'PASSENGER') {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      )
    }

    if (passenger.bookings.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete passenger with active bookings. Cancel all bookings first.',
        },
        { status: 400 }
      )
    }

    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Passenger deleted successfully',
    })
  } catch (error) {
    console.error('Delete passenger error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
