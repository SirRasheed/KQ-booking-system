import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        flight: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate a simple HTML ticket that can be printed/saved as PDF
    const className = booking.travelClass === 'EXECUTIVE' ? 'Executive Class (A)' :
                      booking.travelClass === 'MIDDLE' ? 'Middle Class (B)' : 'Economy Class (C)';

    const formatDT = (dt: Date) => dt.toLocaleDateString('en-KE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }) + ' at ' + dt.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

    const ticketHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Kenya Airways Ticket - ${booking.bookingRef}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 40px; }
  .ticket { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #b91c1c, #dc2626); color: white; padding: 30px; }
  .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  .header .tagline { font-size: 12px; opacity: 0.8; letter-spacing: 3px; text-transform: uppercase; }
  .ref-bar { background: #991b1b; color: white; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; }
  .ref-bar .ref { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
  .ref-bar .status { font-size: 13px; padding: 4px 12px; border-radius: 20px; background: rgba(255,255,255,0.2); }
  .body { padding: 30px; }
  .route-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px dashed #e5e7eb; }
  .route-point { text-align: center; flex: 1; }
  .route-point .city { font-size: 22px; font-weight: 700; color: #1f2937; }
  .route-point .code { font-size: 14px; color: #6b7280; margin-top: 2px; }
  .route-point .time { font-size: 13px; color: #374151; margin-top: 8px; }
  .route-point .date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
  .route-line { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 20px; }
  .route-line .line { height: 2px; flex: 1; background: #d1d5db; }
  .route-line .plane { margin: 0 10px; color: #dc2626; font-size: 20px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .info-item { padding: 12px; background: #f9fafb; border-radius: 8px; }
  .info-item .label { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; margin-bottom: 4px; }
  .info-item .value { font-size: 15px; font-weight: 600; color: #1f2937; }
  .passenger-section { margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e5e7eb; }
  .passenger-section h3 { font-size: 14px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; margin-bottom: 12px; }
  .passenger-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .footer { background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
  .footer p { font-size: 12px; color: #9ca3af; }
  .footer .brand { font-weight: 700; color: #dc2626; }
  .price-section { text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e5e7eb; }
  .price-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
  .price-value { font-size: 28px; font-weight: 700; color: #dc2626; }
  @media print {
    body { background: white; padding: 0; }
    .ticket { box-shadow: none; }
  }
</style>
</head>
<body>
<div class="ticket">
  <div class="header">
    <h1>Kenya Airways</h1>
    <div class="tagline">The Pride of Africa</div>
  </div>
  <div class="ref-bar">
    <span class="ref">${booking.bookingRef}</span>
    <span class="status">${booking.status}</span>
  </div>
  <div class="body">
    <div class="route-section">
      <div class="route-point">
        <div class="city">${booking.flight.origin.split('(')[0].trim()}</div>
        <div class="code">${booking.flight.origin.match(/\([^)]+\)/)?.[0] || ''}</div>
        <div class="time">${new Date(booking.flight.departureTime).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="date">${new Date(booking.flight.departureTime).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      </div>
      <div class="route-line">
        <div class="line"></div>
        <div class="plane">✈</div>
        <div class="line"></div>
      </div>
      <div class="route-point">
        <div class="city">${booking.flight.destination.split('(')[0].trim()}</div>
        <div class="code">${booking.flight.destination.match(/\([^)]+\)/)?.[0] || ''}</div>
        <div class="time">${new Date(booking.flight.arrivalTime).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="date">${new Date(booking.flight.arrivalTime).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Flight Number</div>
        <div class="value">${booking.flight.flightNumber}</div>
      </div>
      <div class="info-item">
        <div class="label">Travel Class</div>
        <div class="value">${className}</div>
      </div>
      <div class="info-item">
        <div class="label">Departure</div>
        <div class="value">${formatDT(new Date(booking.flight.departureTime))}</div>
      </div>
      <div class="info-item">
        <div class="label">Arrival</div>
        <div class="value">${formatDT(new Date(booking.flight.arrivalTime))}</div>
      </div>
    </div>
    <div class="passenger-section">
      <h3>Passenger Information</h3>
      <div class="passenger-grid">
        <div class="info-item">
          <div class="label">Name</div>
          <div class="value">${booking.passengerName}</div>
        </div>
        <div class="info-item">
          <div class="label">Passport / ID</div>
          <div class="value">${booking.passengerPassport || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="label">Nationality</div>
          <div class="value">${booking.passengerNationality || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="label">Email</div>
          <div class="value">${booking.passengerEmail || 'N/A'}</div>
        </div>
      </div>
    </div>
    <div class="price-section">
      <div class="price-label">Total Price</div>
      <div class="price-value">KES ${booking.totalPrice.toLocaleString()}</div>
    </div>
  </div>
  <div class="footer">
    <p><span class="brand">Kenya Airways</span> | The Pride of Africa | Booking confirmed on ${new Date(booking.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <p style="margin-top: 8px;">Please arrive at the airport 2-3 hours before departure. Carry valid identification documents.</p>
  </div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    return new NextResponse(ticketHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="ticket-${booking.bookingRef}.html"`,
      },
    });
  } catch (error) {
    console.error('Ticket generation error:', error);
    return NextResponse.json({ error: 'Failed to generate ticket' }, { status: 500 });
  }
}
