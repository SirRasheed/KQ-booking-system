'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plane, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

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

export function BookingPage() {
  const { user, selectedFlightId, selectedTravelClass, setCurrentPage, setNotification } = useAppStore();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getPrice = () => {
    if (!flight) return 0;
    switch (selectedTravelClass) {
      case 'EXECUTIVE': return flight.executivePrice;
      case 'MIDDLE': return flight.middlePrice;
      case 'LOW': return flight.lowPrice;
      default: return 0;
    }
  };

  const getClassName = () => {
    switch (selectedTravelClass) {
      case 'EXECUTIVE': return 'Executive Class (A)';
      case 'MIDDLE': return 'Middle Class (B)';
      case 'LOW': return 'Economy Class (C)';
      default: return '';
    }
  };

  const getAvailableSeats = () => {
    if (!flight) return 0;
    switch (selectedTravelClass) {
      case 'EXECUTIVE': return flight.executiveSeats;
      case 'MIDDLE': return flight.middleSeats;
      case 'LOW': return flight.lowSeats;
      default: return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFlightId || !selectedTravelClass) return;

    if (getAvailableSeats() <= 0) {
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
          travelClass: selectedTravelClass,
          ...form,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBookingRef(data.booking.bookingRef);
        setBookingComplete(true);
        setNotification({ message: 'Booking confirmed!', type: 'success' });
      } else {
        setNotification({ message: data.error || 'Booking failed', type: 'error' });
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
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Booking Reference</p>
              <p className="text-2xl font-bold text-red-700">{bookingRef}</p>
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button
        onClick={() => setCurrentPage('search')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Search
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Passenger Details</CardTitle>
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

                {getAvailableSeats() <= 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    No seats available in this class. Please choose another flight or class.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
                  disabled={loading || getAvailableSeats() <= 0}
                >
                  {loading ? 'Processing...' : `Confirm Booking - KES ${getPrice().toLocaleString()}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Flight Summary */}
        <div>
          <Card className="shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Flight Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                  {flight.flightNumber}
                </Badge>
                <Badge variant="default" className="bg-amber-500">{getClassName()}</Badge>
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
                <span className={`font-semibold ${getAvailableSeats() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getAvailableSeats()}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Total Price</span>
                <span className="text-xl font-bold text-red-700">KES {getPrice().toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
