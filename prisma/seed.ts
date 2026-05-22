import { db } from '../src/lib/db';
import { hash } from 'crypto';

function simpleHash(str: string): string {
  return str; // In production, use bcrypt. For demo, store plain text.
}

async function main() {
  // Clear existing data
  await db.report.deleteMany();
  await db.booking.deleteMany();
  await db.employee.deleteMany();
  await db.flight.deleteMany();
  await db.user.deleteMany();

  // Create Admin User
  const admin = await db.user.create({
    data: {
      email: 'admin@kenyaairways.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN',
      phone: '+254700000001',
      nationality: 'Kenyan',
    },
  });

  // Create Employee Users
  const employee1 = await db.user.create({
    data: {
      email: 'john.doe@kenyaairways.com',
      password: 'employee123',
      name: 'John Doe',
      role: 'EMPLOYEE',
      phone: '+254700000002',
      nationality: 'Kenyan',
    },
  });

  const employee2 = await db.user.create({
    data: {
      email: 'jane.smith@kenyaairways.com',
      password: 'employee123',
      name: 'Jane Smith',
      role: 'EMPLOYEE',
      phone: '+254700000003',
      nationality: 'Kenyan',
    },
  });

  const employee3 = await db.user.create({
    data: {
      email: 'peter.mwangi@kenyaairways.com',
      password: 'employee123',
      name: 'Peter Mwangi',
      role: 'EMPLOYEE',
      phone: '+254700000004',
      nationality: 'Kenyan',
    },
  });

  // Create Passenger Users
  const passenger1 = await db.user.create({
    data: {
      email: 'alice@example.com',
      password: 'pass123',
      name: 'Alice Wanjiku',
      role: 'PASSENGER',
      phone: '+254711000001',
      nationality: 'Kenyan',
      passportId: 'A1234567',
    },
  });

  const passenger2 = await db.user.create({
    data: {
      email: 'bob@example.com',
      password: 'pass123',
      name: 'Bob Otieno',
      role: 'PASSENGER',
      phone: '+254711000002',
      nationality: 'Kenyan',
      passportId: 'B2345678',
    },
  });

  const passenger3 = await db.user.create({
    data: {
      email: 'carol@example.com',
      password: 'pass123',
      name: 'Carol Akinyi',
      role: 'PASSENGER',
      phone: '+254711000003',
      nationality: 'Ugandan',
      passportId: 'C3456789',
    },
  });

  // Create Flights - Kenya Airways routes
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const flights = await Promise.all([
    db.flight.create({
      data: {
        flightNumber: 'KQ 101',
        origin: 'Nairobi (NBO)',
        destination: 'Mombasa (MBA)',
        departureTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
        arrivalTime: new Date(tomorrow.setHours(9, 15, 0, 0)),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 25000,
        middlePrice: 15000,
        lowPrice: 8000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 102',
        origin: 'Nairobi (NBO)',
        destination: 'Kisumu (KIS)',
        departureTime: new Date(tomorrow.setHours(10, 30, 0, 0)),
        arrivalTime: new Date(tomorrow.setHours(11, 20, 0, 0)),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 22000,
        middlePrice: 13000,
        lowPrice: 7000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 201',
        origin: 'Nairobi (NBO)',
        destination: 'London (LHR)',
        departureTime: new Date(dayAfter.setHours(23, 0, 0, 0)),
        arrivalTime: new Date(dayAfter.setHours(6, 0, 0, 0) + 8 * 60 * 60 * 1000),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 280000,
        middlePrice: 180000,
        lowPrice: 95000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 301',
        origin: 'Nairobi (NBO)',
        destination: 'Dubai (DXB)',
        departureTime: new Date(nextWeek.setHours(14, 0, 0, 0)),
        arrivalTime: new Date(nextWeek.setHours(18, 30, 0, 0)),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 150000,
        middlePrice: 95000,
        lowPrice: 55000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 401',
        origin: 'Nairobi (NBO)',
        destination: 'Johannesburg (JNB)',
        departureTime: new Date(nextWeek.setHours(9, 0, 0, 0)),
        arrivalTime: new Date(nextWeek.setHours(12, 30, 0, 0)),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 120000,
        middlePrice: 75000,
        lowPrice: 42000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 501',
        origin: 'Nairobi (NBO)',
        destination: 'Dar es Salaam (DAR)',
        departureTime: new Date(inTwoWeeks.setHours(7, 0, 0, 0)),
        arrivalTime: new Date(inTwoWeeks.setHours(8, 30, 0, 0)),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 45000,
        middlePrice: 28000,
        lowPrice: 15000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 601',
        origin: 'Nairobi (NBO)',
        destination: 'Addis Ababa (ADD)',
        departureTime: new Date(inTwoWeeks.setHours(11, 0, 0, 0)),
        arrivalTime: new Date(inTwoWeeks.setHours(13, 0, 0, 0)),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 55000,
        middlePrice: 35000,
        lowPrice: 20000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 701',
        origin: 'Mombasa (MBA)',
        destination: 'Nairobi (NBO)',
        departureTime: new Date(tomorrow.setHours(17, 0, 0, 0)),
        arrivalTime: new Date(tomorrow.setHours(18, 15, 0, 0)),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 25000,
        middlePrice: 15000,
        lowPrice: 8000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 801',
        origin: 'Nairobi (NBO)',
        destination: 'Kampala (EBB)',
        departureTime: new Date(dayAfter.setHours(6, 30, 0, 0)),
        arrivalTime: new Date(dayAfter.setHours(7, 45, 0, 0)),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 35000,
        middlePrice: 22000,
        lowPrice: 12000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 901',
        origin: 'Nairobi (NBO)',
        destination: 'New York (JFK)',
        departureTime: new Date(nextWeek.setHours(22, 0, 0, 0)),
        arrivalTime: new Date(nextWeek.setHours(7, 0, 0, 0) + 15 * 60 * 60 * 1000),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 450000,
        middlePrice: 300000,
        lowPrice: 180000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 110',
        origin: 'Nairobi (NBO)',
        destination: 'Zanzibar (ZNZ)',
        departureTime: new Date(inTwoWeeks.setHours(9, 30, 0, 0)),
        arrivalTime: new Date(inTwoWeeks.setHours(11, 0, 0, 0)),
        executiveSeats: 18,
        middleSeats: 45,
        lowSeats: 95,
        executivePrice: 50000,
        middlePrice: 32000,
        lowPrice: 18000,
        status: 'SCHEDULED',
      },
    }),
    db.flight.create({
      data: {
        flightNumber: 'KQ 210',
        origin: 'Nairobi (NBO)',
        destination: 'Paris (CDG)',
        departureTime: new Date(nextWeek.setHours(22, 30, 0, 0)),
        arrivalTime: new Date(nextWeek.setHours(6, 0, 0, 0) + 8 * 60 * 60 * 1000),
        executiveSeats: 20,
        middleSeats: 50,
        lowSeats: 100,
        executivePrice: 320000,
        middlePrice: 200000,
        lowPrice: 110000,
        status: 'SCHEDULED',
      },
    }),
  ]);

  // Create Employees
  const employees = await Promise.all([
    db.employee.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@kenyaairways.com',
        phone: '+254700000002',
        role: 'TICKETING_OFFICER',
        department: 'Ticketing',
        assignedTask: 'Process daily ticket bookings',
        status: 'ASSIGNED',
      },
    }),
    db.employee.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@kenyaairways.com',
        phone: '+254700000003',
        role: 'CUSTOMER_SERVICE',
        department: 'Customer Relations',
        assignedTask: 'Handle customer inquiries',
        status: 'ASSIGNED',
      },
    }),
    db.employee.create({
      data: {
        name: 'Peter Mwangi',
        email: 'peter.mwangi@kenyaairways.com',
        phone: '+254700000004',
        role: 'GROUND_STAFF',
        department: 'Ground Operations',
        status: 'AVAILABLE',
      },
    }),
    db.employee.create({
      data: {
        name: 'Grace Wambui',
        email: 'grace.wambui@kenyaairways.com',
        phone: '+254700000005',
        role: 'SUPERVISOR',
        department: 'Operations',
        assignedTask: 'Supervise daily operations',
        status: 'ASSIGNED',
      },
    }),
    db.employee.create({
      data: {
        name: 'Samuel Kiprop',
        email: 'samuel.kiprop@kenyaairways.com',
        phone: '+254700000006',
        role: 'TICKETING_OFFICER',
        department: 'Ticketing',
        status: 'AVAILABLE',
      },
    }),
    db.employee.create({
      data: {
        name: 'Fatima Hassan',
        email: 'fatima.hassan@kenyaairways.com',
        phone: '+254700000007',
        role: 'CUSTOMER_SERVICE',
        department: 'Customer Relations',
        status: 'ON_LEAVE',
      },
    }),
  ]);

  // Create sample bookings
  const bookings = await Promise.all([
    db.booking.create({
      data: {
        bookingRef: 'KQ-2025-001',
        userId: passenger1.id,
        flightId: flights[0].id,
        travelClass: 'EXECUTIVE',
        passengerName: 'Alice Wanjiku',
        passengerPassport: 'A1234567',
        passengerEmail: 'alice@example.com',
        passengerPhone: '+254711000001',
        passengerNationality: 'Kenyan',
        status: 'CONFIRMED',
        totalPrice: 25000,
      },
    }),
    db.booking.create({
      data: {
        bookingRef: 'KQ-2025-002',
        userId: passenger2.id,
        flightId: flights[2].id,
        travelClass: 'MIDDLE',
        passengerName: 'Bob Otieno',
        passengerPassport: 'B2345678',
        passengerEmail: 'bob@example.com',
        passengerPhone: '+254711000002',
        passengerNationality: 'Kenyan',
        status: 'CONFIRMED',
        totalPrice: 180000,
      },
    }),
    db.booking.create({
      data: {
        bookingRef: 'KQ-2025-003',
        userId: passenger3.id,
        flightId: flights[1].id,
        travelClass: 'LOW',
        passengerName: 'Carol Akinyi',
        passengerPassport: 'C3456789',
        passengerEmail: 'carol@example.com',
        passengerPhone: '+254711000003',
        passengerNationality: 'Ugandan',
        status: 'CANCELLED',
        totalPrice: 7000,
      },
    }),
    db.booking.create({
      data: {
        bookingRef: 'KQ-2025-004',
        userId: passenger1.id,
        flightId: flights[4].id,
        travelClass: 'MIDDLE',
        passengerName: 'Alice Wanjiku',
        passengerPassport: 'A1234567',
        passengerEmail: 'alice@example.com',
        passengerPhone: '+254711000001',
        passengerNationality: 'Kenyan',
        status: 'CONFIRMED',
        totalPrice: 75000,
      },
    }),
  ]);

  // Update flight seat counts based on bookings
  // Flight KQ 101: 1 executive seat taken
  await db.flight.update({
    where: { id: flights[0].id },
    data: { executiveSeats: 19 },
  });

  // Flight KQ 201: 1 middle seat taken
  await db.flight.update({
    where: { id: flights[2].id },
    data: { middleSeats: 49 },
  });

  // Flight KQ 102: 1 low seat taken (then cancelled, seat restored)
  // Since the booking was cancelled, we don't reduce seats

  // Flight KQ 401: 1 middle seat taken
  await db.flight.update({
    where: { id: flights[4].id },
    data: { middleSeats: 49 },
  });

  console.log('Seed data created successfully!');
  console.log(`- ${await db.user.count()} users`);
  console.log(`- ${await db.flight.count()} flights`);
  console.log(`- ${await db.employee.count()} employees`);
  console.log(`- ${await db.booking.count()} bookings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
