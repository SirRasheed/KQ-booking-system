'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Search, XCircle, CheckCircle, FileText, Pencil, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface BookingWithFlight {
  id: string;
  bookingRef: string;
  userId: string;
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
  };
}

export function AdminBookings() {
  const { user, setNotification, setCurrentPage } = useAppStore();
  const [bookings, setBookings] = useState<BookingWithFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingBooking, setEditingBooking] = useState<BookingWithFlight | null>(null);
  const [editForm, setEditForm] = useState({
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    passengerNationality: '',
    passengerPassport: '',
    travelClass: '',
    status: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setNotification({ message: 'Admin access required', type: 'error' });
      setCurrentPage('login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
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
      travelClass: booking.travelClass || '',
      status: booking.status || '',
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
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        setNotification({ message: 'Booking cancelled', type: 'success' });
        fetchBookings();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (res.ok) {
        setNotification({ message: 'Booking completed', type: 'success' });
        fetchBookings();
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
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

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
      b.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      b.flight.flightNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) +
      ' ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
            <p className="text-gray-500 mt-1">View and manage all flight bookings</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
              const printContent = `
                <html><head><title>Ticket Report - Kenya Airways</title>
                <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#b91c1c;border-bottom:2px solid #b91c1c;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#fee2e2;color:#991b1b}.total{margin-top:20px;font-size:18px;font-weight:bold;color:#b91c1c}.stats{display:flex;gap:30px;margin:15px 0}.stat{padding:10px;background:#fef2f2;border-radius:8px}</style></head>
                <body><h1>Kenya Airways - Ticket Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <div class="stats">
                  <div class="stat"><strong>Total Bookings:</strong> ${bookings.length}</div>
                  <div class="stat"><strong>Confirmed:</strong> ${confirmed.length}</div>
                  <div class="stat"><strong>Total Revenue:</strong> KES ${confirmed.reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}</div>
                </div>
                <table><tr><th>Reference</th><th>Passenger</th><th>Flight</th><th>Route</th><th>Class</th><th>Seats</th><th>Price</th><th>Status</th></tr>
                ${filteredBookings.map(b => `<tr><td>${b.bookingRef}</td><td>${b.passengerName}</td><td>${b.flight.flightNumber}</td><td>${b.flight.origin} → ${b.flight.destination}</td><td>${getClassName(b.travelClass)}</td><td>${b.seatNumbers || '-'}</td><td>KES ${b.totalPrice.toLocaleString()}</td><td>${b.status}</td></tr>`).join('')}
                </table></body></html>`;
              const win = window.open('', '_blank');
              if (win) { win.document.write(printContent); win.document.close(); win.print(); }
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Ticket Report
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search by reference, name, or flight..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-semibold text-red-700">{booking.bookingRef}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{booking.passengerName}</p>
                        <p className="text-xs text-gray-500">{booking.passengerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{booking.flight.flightNumber}</p>
                        <p className="text-xs text-gray-500">{booking.flight.origin} → {booking.flight.destination}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getClassName(booking.travelClass)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{booking.seatNumbers || 'N/A'}</span>
                      {booking.numSeats > 1 && <span className="text-xs text-gray-400 ml-1">({booking.numSeats} seats)</span>}
                    </TableCell>
                    <TableCell className="font-semibold">KES {booking.totalPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDateTime(booking.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600"
                            onClick={() => window.open(`/api/bookings/${booking.id}/ticket`, '_blank')}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600"
                          onClick={() => handleEditBooking(booking)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleCompleteBooking(booking.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking — {editingBooking?.bookingRef}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Travel Class</Label>
                <Select value={editForm.travelClass} onValueChange={(value) => setEditForm({ ...editForm, travelClass: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXECUTIVE">Executive (A)</SelectItem>
                    <SelectItem value="MIDDLE">Middle (B)</SelectItem>
                    <SelectItem value="LOW">Economy (C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
              <p>Flight: {editingBooking?.flight.flightNumber} | Route: {editingBooking?.flight.origin} → {editingBooking?.flight.destination}</p>
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
