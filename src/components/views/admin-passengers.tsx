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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Search, Pencil, Trash2 } from 'lucide-react';

interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passportId: string;
  _count?: { bookings: number };
}

export function AdminPassengers() {
  const { user, setNotification, setCurrentPage } = useAppStore();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', nationality: '', passportId: '' });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setNotification({ message: 'Admin access required', type: 'error' });
      setCurrentPage('login');
      return;
    }
    fetchPassengers();
  }, [user]);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/passengers');
      const data = await res.json();
      setPassengers(data.passengers || data || []);
    } catch {
      setNotification({ message: 'Failed to load passengers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    setForm({
      name: passenger.name,
      phone: passenger.phone || '',
      nationality: passenger.nationality || '',
      passportId: passenger.passportId || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPassenger) return;
    try {
      const res = await fetch(`/api/passengers/${editingPassenger.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setNotification({ message: 'Passenger updated', type: 'success' });
        setDialogOpen(false);
        fetchPassengers();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this passenger?')) return;
    try {
      const res = await fetch(`/api/passengers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ message: 'Passenger deleted', type: 'success' });
        fetchPassengers();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const filteredPassengers = passengers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.passportId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Passengers</h1>
        <p className="text-gray-500 mt-1">View and manage passenger records</p>
      </div>

      <Card className="mb-6 shadow-sm">
        <CardContent className="p-4">
          <Input
            placeholder="Search passengers by name, email, or passport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Passport/ID</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPassengers.map((passenger) => (
                  <TableRow key={passenger.id}>
                    <TableCell className="font-medium">{passenger.name}</TableCell>
                    <TableCell className="text-sm">{passenger.email}</TableCell>
                    <TableCell className="text-sm">{passenger.phone || '-'}</TableCell>
                    <TableCell className="text-sm">{passenger.nationality || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{passenger.passportId || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-700">{passenger._count?.bookings || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(passenger)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(passenger.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPassengers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No passengers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Passenger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Passport / ID</Label>
              <Input value={form.passportId} onChange={(e) => setForm({ ...form, passportId: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
