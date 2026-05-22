import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Kenya Airways Online System API',
    version: '1.0.0',
    endpoints: {
      auth: ['/api/auth/login', '/api/auth/register', '/api/auth/me'],
      flights: ['/api/flights', '/api/flights/[id]'],
      bookings: ['/api/bookings', '/api/bookings/[id]'],
      passengers: ['/api/passengers', '/api/passengers/[id]'],
      employees: ['/api/employees', '/api/employees/[id]'],
      reports: ['/api/reports', '/api/reports/[id]'],
      dashboard: ['/api/dashboard'],
    },
  })
}
