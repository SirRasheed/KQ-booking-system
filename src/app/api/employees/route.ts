import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const department = searchParams.get('department')

    const where: Prisma.EmployeeWhereInput = {}

    if (status) {
      where.status = status
    }
    if (role) {
      where.role = role
    }
    if (department) {
      where.department = { contains: department }
    }

    const employees = await db.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      employees,
    })
  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role, department, assignedTask, status } = body

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    const validRoles = [
      'TICKETING_OFFICER',
      'CUSTOMER_SERVICE',
      'GROUND_STAFF',
      'SUPERVISOR',
    ]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be TICKETING_OFFICER, CUSTOMER_SERVICE, GROUND_STAFF, or SUPERVISOR' },
        { status: 400 }
      )
    }

    const existingEmployee = await db.employee.findUnique({
      where: { email },
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 409 }
      )
    }

    const employee = await db.employee.create({
      data: {
        name,
        email,
        phone: phone || null,
        role,
        department: department || null,
        assignedTask: assignedTask || null,
        status: status || 'AVAILABLE',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Employee created successfully',
        employee,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
