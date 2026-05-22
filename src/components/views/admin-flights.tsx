'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plane, Plus, Pencil, Trash2, Search } from 'lucide-react';

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

export function AdminFlights() {
  const { user, setNotification, setCurrentPage } = useAppStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [form, setForm] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    executiveSeats: '20',
    middleSeats: '50',
    lowSeats: '100',
    executivePrice: '',
    middlePrice: '',
    lowPrice: '',
    status: 'SCHEDULED',
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setNotification({ message: 'Admin access required', type: 'error' });
      setCurrentPage('login');
      return;
    }
    fetchFlights();
  }, [user]);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flights');
      const data = await res.json();
      setFlights(data.flights || data || []);
    } catch {
      setNotification({ message: 'Failed to load flights', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingFlight ? `/api/flights/${editingFlight.id}` : '/api/flights';
      const method = editingFlight ? 'PUT' : 'POST';

      const body: Record<string, unknown> = {
        flightNumber: form.flightNumber,
        origin: form.origin,
        destination: form.destination,
        departureTime: new Date(form.departureTime).toISOString(),
        arrivalTime: new Date(form.arrivalTime).toISOString(),
        executiveSeats: parseInt(form.executiveSeats),
        middleSeats: parseInt(form.middleSeats),
        lowSeats: parseInt(form.lowSeats),
        executivePrice: parseFloat(form.executivePrice),
        middlePrice: parseFloat(form.middlePrice),
        lowPrice: parseFloat(form.lowPrice),
        status: form.status,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setNotification({
          message: editingFlight ? 'Flight updated' : 'Flight created',
          type: 'success',
        });
        setDialogOpen(false);
        setEditingFlight(null);
        resetForm();
        fetchFlights();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    try {
      const res = await fetch(`/api/flights/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ message: 'Flight deleted', type: 'success' });
        fetchFlights();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed to delete', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setForm({
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: new Date(flight.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(flight.arrivalTime).toISOString().slice(0, 16),
      executiveSeats: String(flight.executiveSeats),
      middleSeats: String(flight.middleSeats),
      lowSeats: String(flight.lowSeats),
      executivePrice: String(flight.executivePrice),
      middlePrice: String(flight.middlePrice),
      lowPrice: String(flight.lowPrice),
      status: flight.status,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setForm({
      flightNumber: '',
      origin: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      executiveSeats: '20',
      middleSeats: '50',
      lowSeats: '100',
      executivePrice: '',
      middlePrice: '',
      lowPrice: '',
      status: 'SCHEDULED',
    });
    setEditingFlight(null);
  };

  const filteredFlights = flights.filter(
    (f) =>
      f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.origin.toLowerCase().includes(search.toLowerCase()) ||
      f.destination.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) +
      ' ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Flights</h1>
          <p className="text-gray-500 mt-1">Add, edit, and remove flights</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { resetForm(); }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Flight
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFlight ? 'Edit Flight' : 'Add New Flight'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Flight Number *</Label>
                  <Input value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} placeholder="KQ 999" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="BOARDING">Boarding</SelectItem>
                      <SelectItem value="DEPARTED">Departed</SelectItem>
                      <SelectItem value="ARRIVED">Arrived</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origin *</Label>
                  <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Nairobi (NBO)" />
                </div>
                <div className="space-y-2">
                  <Label>Destination *</Label>
                  <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Mombasa (MBA)" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Time *</Label>
                  <Input type="datetime-local" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Arrival Time *</Label>
                  <Input type="datetime-local" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Executive Seats</Label>
                  <Input type="number" value={form.executiveSeats} onChange={(e) => setForm({ ...form, executiveSeats: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Middle Seats</Label>
                  <Input type="number" value={form.middleSeats} onChange={(e) => setForm({ ...form, middleSeats: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Economy Seats</Label>
                  <Input type="number" value={form.lowSeats} onChange={(e) => setForm({ ...form, lowSeats: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Executive Price (KES)</Label>
                  <Input type="number" value={form.executivePrice} onChange={(e) => setForm({ ...form, executivePrice: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Middle Price (KES)</Label>
                  <Input type="number" value={form.middlePrice} onChange={(e) => setForm({ ...form, middlePrice: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Economy Price (KES)</Label>
                  <Input type="number" value={form.lowPrice} onChange={(e) => setForm({ ...form, lowPrice: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSave}>
                  {editingFlight ? 'Update Flight' : 'Create Flight'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input placeholder="Search flights..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
        </CardContent>
      </Card>

      {/* Flights Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Seats (E/M/L)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell className="font-semibold">{flight.flightNumber}</TableCell>
                    <TableCell>
                      <span className="text-sm">{flight.origin} → {flight.destination}</span>
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(flight.departureTime)}</TableCell>
                    <TableCell>
                      <span className="text-sm">{flight.executiveSeats}/{flight.middleSeats}/{flight.lowSeats}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        flight.status === 'SCHEDULED' ? 'bg-green-50 text-green-700' :
                        flight.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }>
                        {flight.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(flight)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(flight.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFlights.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No flights found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
