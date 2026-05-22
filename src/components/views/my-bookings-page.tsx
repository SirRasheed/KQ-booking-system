'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plane, Search, XCircle, CheckCircle, Clock, FileText, Download, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface BookingWithFlight {
  id: string;
  bookingRef: string;
  flightId: string;
  travelClass: string;
  seatNumbers: string;
  numSeats: number;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  passengerNationality: string;
  passengerPassport: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  flight: {
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
  };
}

export function MyBookingsPage() {
  const { user, setCurrentPage, setNotification } = useAppStore();
  const [bookings, setBookings] = useState<BookingWithFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRef, setSearchRef] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingBooking, setEditingBooking] = useState<BookingWithFlight | null>(null);
  const [editForm, setEditForm] = useState({
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    passengerNationality: '',
    passengerPassport: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotification({ message: 'Please login to view your bookings', type: 'info' });
      setCurrentPage('login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async (ref?: string) => {
    setLoading(true);
    try {
      let url = `/api/bookings?userId=${user?.id}`;
      if (ref) url += `&bookingRef=${ref}`;
      const res = await fetch(url);
      const data = await res.json();
      setBookings(data.bookings || data || []);
    } catch {
      setNotification({ message: 'Failed to load bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = (booking: BookingWithFlight) => {
    setEditingBooking(booking);
    setEditForm({
      passengerName: booking.passengerName || '',
      passengerEmail: booking.passengerEmail || '',
      passengerPhone: booking.passengerPhone || '',
      passengerNationality: booking.passengerNationality || '',
      passengerPassport: booking.passengerPassport || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setNotification({ message: 'Booking updated successfully', type: 'success' });
        setEditDialogOpen(false);
        fetchBookings();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed to update booking', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (res.ok) {
        setNotification({ message: 'Booking cancelled successfully', type: 'success' });
        fetchBookings();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed to cancel booking', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'COMPLETED': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return '';
    }
  };

  const getClassName = (cls: string) => {
    switch (cls) {
      case 'EXECUTIVE': return 'Executive (A)';
      case 'MIDDLE': return 'Middle (B)';
      case 'LOW': return 'Economy (C)';
      default: return cls;
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">View and manage your flight bookings</p>
        </div>
        <Button onClick={() => setCurrentPage('search')} className="bg-red-600 hover:bg-red-700 text-white">
          <Plane className="h-4 w-4 mr-2" />
          Book New Flight
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by booking reference..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchBookings(searchRef)}
              />
            </div>
            <Button variant="outline" onClick={() => fetchBookings(searchRef)}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <div className="flex gap-2">
              {['all', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status ? 'bg-red-600 text-white' : ''}
                >
                  {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No bookings found</h3>
            <p className="text-gray-500 mt-1">Start by booking a flight</p>
            <Button onClick={() => setCurrentPage('search')} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
              Search Flights
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                        {booking.bookingRef}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status}</span>
                      </Badge>
                      <Badge variant="secondary">{getClassName(booking.travelClass)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="font-semibold">{booking.flight.flightNumber}</p>
                        <p className="text-gray-500">{booking.flight.origin} → {booking.flight.destination}</p>
                      </div>
                      <div className="text-gray-400">
                        <p className="text-xs">{formatDateTime(booking.flight.departureTime)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Passenger: {booking.passengerName} | Seats: {booking.seatNumbers || 'N/A'} | Booked: {formatDateTime(booking.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-700">KES {booking.totalPrice.toLocaleString()}</p>
                    </div>
                    {booking.status === 'CONFIRMED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => window.open(`/api/bookings/${booking.id}/ticket`, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Ticket
                      </Button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-600 hover:bg-amber-50"
                        onClick={() => handleEditBooking(booking)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Booking — {editingBooking?.bookingRef}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.passengerName} onChange={(e) => setEditForm({ ...editForm, passengerName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editForm.passengerEmail} onChange={(e) => setEditForm({ ...editForm, passengerEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editForm.passengerPhone} onChange={(e) => setEditForm({ ...editForm, passengerPhone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input value={editForm.passengerNationality} onChange={(e) => setEditForm({ ...editForm, passengerNationality: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Passport / ID</Label>
                <Input value={editForm.passengerPassport} onChange={(e) => setEditForm({ ...editForm, passengerPassport: e.target.value })} />
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
              <p>Flight: {editingBooking?.flight.flightNumber} | Class: {getClassName(editingBooking?.travelClass || '')}</p>
              <p>Seats: {editingBooking?.seatNumbers} | Price: KES {editingBooking?.totalPrice.toLocaleString()}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
