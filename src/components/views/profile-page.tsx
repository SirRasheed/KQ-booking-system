'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Globe, FileText, Save, ArrowLeft, Shield } from 'lucide-react';

export function ProfilePage() {
  const { user, setUser, setNotification, setCurrentPage } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    nationality: user?.nationality || '',
    passportId: user?.passportId || '',
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please login to view your profile.</p>
        <Button onClick={() => setCurrentPage('login')} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
          Login
        </Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/passengers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, ...form };
        setUser(updatedUser);
        localStorage.setItem('kq_user', JSON.stringify(updatedUser));
        setNotification({ message: 'Profile updated successfully!', type: 'success' });
      } else {
        setNotification({ message: data.error || 'Failed to update profile', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.')) return;
    if (!confirm('FINAL WARNING: This will permanently delete your account and all associated data. Continue?')) return;

    try {
      const res = await fetch(`/api/passengers/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        localStorage.removeItem('kq_user');
        setUser(null);
        setNotification({ message: 'Account deleted successfully', type: 'success' });
        setCurrentPage('home');
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed to delete account', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'ADMIN': return <Badge className="bg-red-600 text-white"><Shield className="h-3 w-3 mr-1" />Administrator</Badge>;
      case 'EMPLOYEE': return <Badge className="bg-amber-500 text-white">Employee</Badge>;
      default: return <Badge className="bg-green-600 text-white">Passenger</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => setCurrentPage('home')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <User className="h-8 w-8 text-red-700" />
            </div>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge()}
                <span className="text-sm text-gray-500">Member since registration</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.nationality && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4 text-gray-400" />
                <span>{user.nationality}</span>
              </div>
            )}
            {user.passportId && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>Passport: {user.passportId}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+254 7XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g., Kenyan" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passportId">Passport / ID Number</Label>
              <Input id="passportId" name="passportId" value={form.passportId} onChange={handleChange} placeholder="e.g., A1234567" />
            </div>

            <div className="bg-amber-50 p-3 rounded-lg text-xs text-amber-700">
              <strong>Note:</strong> Email address cannot be changed. Contact support if you need to update your email.
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
              disabled={loading}
            >
              {loading ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {user.role === 'PASSENGER' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Deleting your account is permanent and cannot be undone. If you have active bookings, you must cancel them first.
            </p>
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
