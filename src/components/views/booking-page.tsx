'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, CheckCircle, AlertCircle, ArrowLeft, Crown, Armchair, Users } from 'lucide-react';
import { SeatMap } from '@/components/views/seat-map';

interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  executiveSeats: number;
  middleSeats: number;
  lowSeats: number;
  executivePrice: number;
  middlePrice: number;
  lowPrice: number;
  status: string;
}

interface Seat {
  id: string;
  seatNumber: string;
  row: number;
  column: string;
  travelClass: string;
  status: string;
}

export function BookingPage() {
  const { user, selectedFlightId, selectedTravelClass, setCurrentPage, setNotification, setUser } = useAppStore();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [travelClass, setTravelClass] = useState<string>(selectedTravelClass || 'EXECUTIVE');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [form, setForm] = useState({
    passengerName: user?.name || '',
    passengerPassport: user?.passportId || '',
    passengerEmail: user?.email || '',
    passengerPhone: user?.phone || '',
    passengerNationality: user?.nationality || '',
  });

  useEffect(() => {
    if (!user) {
      setNotification({ message: 'Please login to book a flight', type: 'info' });
      setCurrentPage('login');
      return;
    }
    if (!selectedFlightId) {
      setCurrentPage('search');
      return;
    }
    fetchFlight();
    fetchSeats();
  }, [user, selectedFlightId]);

  const fetchFlight = async () => {
    try {
      const res = await fetch(`/api/flights/${selectedFlightId}`);
      const data = await res.json();
      setFlight(data.flight || data);
    } catch {
      setNotification({ message: 'Failed to load flight details', type: 'error' });
    }
  };

  const fetchSeats = async () => {
    try {
      const res = await fetch(`/api/seats?flightId=${selectedFlightId}`);
      const data = await res.json();
      setSeats(data.seats || []);
    } catch {
      setNotification({ message: 'Failed to load seat map', type: 'error' });
    }
  };

  const handleSeatSelect = useCallback((seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      }
      if (prev.length >= 10) return prev; // Max 10 seats
      return [...prev, seatNumber];
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getPricePerSeat = () => {
    if (!flight) return 0;
    switch (travelClass) {
      case 'EXECUTIVE': return flight.executivePrice;
      case 'MIDDLE': return flight.middlePrice;
      case 'LOW': return flight.lowPrice;
      default: return 0;
    }
  };

  const getTotalPrice = () => {
    return getPricePerSeat() * selectedSeats.length;
  };

  const getClassName = () => {
    switch (travelClass) {
      case 'EXECUTIVE': return 'Executive Class';
      case 'MIDDLE': return 'Premium Economy';
      case 'LOW': return 'Economy Class';
      default: return '';
    }
  };

  const getAvailableSeatsCount = () => {
    if (!flight) return 0;
    switch (travelClass) {
      case 'EXECUTIVE': return flight.executiveSeats;
      case 'MIDDLE': return flight.middleSeats;
      case 'LOW': return flight.lowSeats;
      default: return 0;
    }
  };

  const getOccupiedSeatsCount = () => {
    return seats.filter(s => s.travelClass === travelClass && s.status === 'OCCUPIED').length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFlightId) return;

    if (selectedSeats.length === 0) {
      setNotification({ message: 'Please select at least one seat', type: 'error' });
      return;
    }

    if (getAvailableSeatsCount() <= 0) {
      setNotification({ message: 'No seats available in this class', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          flightId: selectedFlightId,
          travelClass,
          seatNumbers: selectedSeats,
          ...form,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBookingRef(data.booking.bookingRef);
        setBookingComplete(true);
        setNotification({ message: 'Booking confirmed!', type: 'success' });
      } else {
        // If user not found (stale session), force re-login
        if (res.status === 401) {
          localStorage.removeItem('kq_user');
          setUser(null);
          setNotification({ message: 'Session expired. Please log in again.', type: 'error' });
          setCurrentPage('login');
        } else {
          setNotification({ message: data.error || 'Booking failed', type: 'error' });
        }
      }
    } catch {
      setNotification({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  if (bookingComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Card className="text-center shadow-lg">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-500 mb-4">Your ticket has been processed successfully</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Booking Reference</p>
              <p className="text-2xl font-bold text-red-700">{bookingRef}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Seats Reserved</p>
              <p className="text-lg font-bold text-gray-900">{selectedSeats.sort().join(', ')}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">Please save your booking reference for future use.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setCurrentPage('my-bookings')} className="bg-red-600 hover:bg-red-700 text-white">
                View My Bookings
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage('search')}>
                Book Another Flight
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading flight details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button
        onClick={() => setCurrentPage('search')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Search
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Class Selection + Seat Map + Passenger Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Choose Travel Class */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold">1</span>
                Choose Travel Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { 
                    key: 'EXECUTIVE', 
                    label: 'Executive', 
                    icon: <Crown className="h-5 w-5" />,
                    seats: flight.executiveSeats, 
                    price: flight.executivePrice,
                    desc: 'VIP treatment'
                  },
                  { 
                    key: 'MIDDLE', 
                    label: 'Premium', 
                    icon: <Armchair className="h-5 w-5" />,
                    seats: flight.middleSeats, 
                    price: flight.middlePrice,
                    desc: 'Extra comfort'
                  },
                  { 
                    key: 'LOW', 
                    label: 'Economy', 
                    icon: <Users className="h-5 w-5" />,
                    seats: flight.lowSeats, 
                    price: flight.lowPrice,
                    desc: 'Best value'
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setTravelClass(opt.key);
                      setSelectedSeats([]); // Reset seats when changing class
                    }}
                    disabled={opt.seats <= 0}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-200 text-center
                      ${travelClass === opt.key
                        ? opt.key === 'EXECUTIVE'
                          ? 'border-amber-500 bg-amber-50 shadow-md'
                          : opt.key === 'MIDDLE'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-emerald-500 bg-emerald-50 shadow-md'
                        : opt.seats > 0
                          ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className={`mx-auto mb-2 ${travelClass === opt.key ? 'text-red-600' : 'text-gray-400'}`}>
                      {opt.icon}
                    </div>
                    <p className={`font-bold text-sm ${travelClass === opt.key ? 'text-gray-900' : 'text-gray-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-gray-500 mb-1">{opt.desc}</p>
                    <p className="font-bold text-red-700 text-sm">KES {opt.price.toLocaleString()}</p>
                    <p className={`text-xs mt-1 ${opt.seats > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {opt.seats > 0 ? `${opt.seats} available` : 'Sold out'}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Select Your Seats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold">2</span>
                Select Your Seats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge 
                  variant="outline" 
                  className={`text-sm px-3 py-1 ${
                    travelClass === 'EXECUTIVE' 
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : travelClass === 'MIDDLE'
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {getClassName()} — {getAvailableSeatsCount()} seats available
                </Badge>
              </div>
              
              <SeatMap
                seats={seats}
                travelClass={travelClass}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                maxSelectable={10}
              />

              {selectedSeats.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm mt-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Please click on available seats to select them. You can select multiple seats.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Passenger Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold">3</span>
                Passenger Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passengerName">Full Name *</Label>
                    <Input id="passengerName" name="passengerName" value={form.passengerName} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengerPassport">Passport / ID</Label>
                    <Input id="passengerPassport" name="passengerPassport" value={form.passengerPassport} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passengerEmail">Email</Label>
                    <Input id="passengerEmail" name="passengerEmail" type="email" value={form.passengerEmail} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengerPhone">Phone</Label>
                    <Input id="passengerPhone" name="passengerPhone" value={form.passengerPhone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passengerNationality">Nationality</Label>
                  <Input id="passengerNationality" name="passengerNationality" value={form.passengerNationality} onChange={handleChange} />
                </div>

                {/* Mobile price summary */}
                <div className="lg:hidden p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Class</span>
                    <span className="font-medium">{getClassName()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Price per seat</span>
                    <span className="font-medium">KES {getPricePerSeat().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Seats</span>
                    <span className="font-medium">{selectedSeats.length} × KES {getPricePerSeat().toLocaleString()}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="text-xl font-bold text-red-700">KES {getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                {getAvailableSeatsCount() <= 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    No seats available in this class. Please choose another class.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold"
                  disabled={loading || selectedSeats.length === 0 || getAvailableSeatsCount() <= 0}
                >
                  {loading ? 'Processing...' : `Confirm Booking — KES ${getTotalPrice().toLocaleString()}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Flight Summary Sidebar (desktop) */}
        <div className="hidden lg:block">
          <Card className="shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Flight Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                  {flight.flightNumber}
                </Badge>
                <Badge 
                  variant="default" 
                  className={
                    travelClass === 'EXECUTIVE' 
                      ? 'bg-amber-500' 
                      : travelClass === 'MIDDLE' 
                        ? 'bg-blue-500' 
                        : 'bg-emerald-500'
                  }
                >
                  {getClassName()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-gray-900">{flight.origin}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(flight.departureTime)}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Plane className="h-4 w-4" />
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{flight.destination}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(flight.arrivalTime)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available Seats</span>
                <span className={`font-semibold ${getAvailableSeatsCount() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getAvailableSeatsCount()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Occupied Seats</span>
                <span className="font-semibold text-red-500">
                  {getOccupiedSeatsCount()}
                </span>
              </div>

              <Separator />

              {/* Price breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price per seat</span>
                  <span className="font-medium">KES {getPricePerSeat().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Selected seats</span>
                  <span className="font-medium">
                    {selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : 'None'}
                  </span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Number of seats</span>
                    <span className="font-medium">{selectedSeats.length} × KES {getPricePerSeat().toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Price</span>
                <span className="text-xl font-bold text-red-700">KES {getTotalPrice().toLocaleString()}</span>
              </div>

              {selectedSeats.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {selectedSeats.sort().join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
