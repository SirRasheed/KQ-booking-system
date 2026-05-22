'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Users, BookOpen, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface DashboardStats {
  totalFlights: number;
  totalBookings: number;
  totalPassengers: number;
  totalEmployees: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  bookingsByClass: { executive: number; middle: number; low: number };
  recentBookings: Array<{
    id: string;
    bookingRef: string;
    passengerName: string;
    status: string;
    totalPrice: number;
    flight: { flightNumber: string; origin: string; destination: string; departureTime: string };
  }>;
  popularDestinations: Array<{ destination: string; count: number }>;
}

export function AdminDashboard() {
  const { user, setCurrentPage, setNotification } = useAppStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setNotification({ message: 'Admin access required', type: 'error' });
      setCurrentPage('login');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data);
    } catch {
      setNotification({ message: 'Failed to load dashboard', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;
  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) +
      ' ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of Kenya Airways operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Flights', value: stats?.totalFlights || 0, icon: Plane, color: 'bg-red-100 text-red-600' },
          { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: BookOpen, color: 'bg-amber-100 text-amber-600' },
          { label: 'Passengers', value: stats?.totalPassengers || 0, icon: Users, color: 'bg-green-100 text-green-600' },
          { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Stats */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              Booking Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Confirmed</span>
              <Badge className="bg-green-100 text-green-700">{stats?.confirmedBookings || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Cancelled</span>
              <Badge className="bg-red-100 text-red-700">{stats?.cancelledBookings || 0}</Badge>
            </div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500">By Travel Class</p>
              <div className="flex justify-between text-sm">
                <span>Executive (A)</span>
                <span className="font-semibold">{stats?.bookingsByClass?.executive || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Middle (B)</span>
                <span className="font-semibold">{stats?.bookingsByClass?.middle || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Economy (C)</span>
                <span className="font-semibold">{stats?.bookingsByClass?.low || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plane className="h-5 w-5 text-red-600" />
              Popular Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.popularDestinations?.length ? (
              <div className="space-y-3">
                {stats.popularDestinations.map((dest, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{dest.destination}</span>
                    <Badge variant="outline">{dest.count} bookings</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No destination data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats?.recentBookings?.length ? (
                stats.recentBookings.map((booking, i) => (
                  <div key={i} className="flex flex-col gap-1 p-2 bg-gray-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-red-700">{booking.bookingRef}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-50 text-green-700'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {booking.flight.flightNumber} | {booking.passengerName}
                    </p>
                    <p className="text-xs font-semibold text-gray-700">
                      {formatPrice(booking.totalPrice)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Manage Flights', page: 'admin-flights' as const, icon: Plane },
            { label: 'Manage Bookings', page: 'admin-bookings' as const, icon: BookOpen },
            { label: 'Passengers', page: 'admin-passengers' as const, icon: Users },
            { label: 'Employees', page: 'admin-employees' as const, icon: Users },
            { label: 'Reports', page: 'admin-reports' as const, icon: TrendingUp },
          ].map((action, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setCurrentPage(action.page)}
            >
              <action.icon className="h-5 w-5 text-red-600" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
