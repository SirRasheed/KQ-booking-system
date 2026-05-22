'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Users, BookOpen, DollarSign, TrendingUp, Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

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

const CHART_COLORS = ['#dc2626', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

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
      setStats(data.dashboard || data);
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

  // Chart data
  const bookingStatusData = [
    { name: 'Confirmed', value: stats?.confirmedBookings || 0, fill: '#10b981' },
    { name: 'Cancelled', value: stats?.cancelledBookings || 0, fill: '#ef4444' },
  ];

  const classData = [
    { name: 'Executive (A)', bookings: stats?.bookingsByClass?.executive || 0, fill: '#dc2626' },
    { name: 'Middle (B)', bookings: stats?.bookingsByClass?.middle || 0, fill: '#f59e0b' },
    { name: 'Economy (C)', bookings: stats?.bookingsByClass?.low || 0, fill: '#10b981' },
  ];

  const destData = (stats?.popularDestinations || []).map((d) => ({
    name: d.destination.split('(')[0].trim(),
    bookings: d.count,
  }));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
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
          { label: 'Total Flights', value: stats?.totalFlights || 0, icon: Plane, color: 'bg-red-100 text-red-600', bg: 'from-red-50 to-red-100/50' },
          { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: BookOpen, color: 'bg-amber-100 text-amber-600', bg: 'from-amber-50 to-amber-100/50' },
          { label: 'Passengers', value: stats?.totalPassengers || 0, icon: Users, color: 'bg-green-100 text-green-600', bg: 'from-green-50 to-green-100/50' },
          { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', bg: 'from-emerald-50 to-emerald-100/50' },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Booking Status Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              Booking Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.totalBookings ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-10">No booking data</p>
            )}
          </CardContent>
        </Card>

        {/* Bookings by Class Bar Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-red-600" />
              Bookings by Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
            {destData.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={destData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-10">No destination data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats?.recentBookings?.length ? (
                stats.recentBookings.map((booking, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-red-700">{booking.bookingRef}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : booking.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {booking.flight.flightNumber} · {booking.passengerName}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{formatPrice(booking.totalPrice)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Manage Flights', page: 'admin-flights' as const, icon: Plane, desc: 'Add, edit, remove flights' },
                { label: 'Manage Bookings', page: 'admin-bookings' as const, icon: BookOpen, desc: 'View and process bookings' },
                { label: 'Passengers', page: 'admin-passengers' as const, icon: Users, desc: 'Manage passenger records' },
                { label: 'Employees', page: 'admin-employees' as const, icon: Users, desc: 'Assign tasks and roles' },
                { label: 'Reports', page: 'admin-reports' as const, icon: TrendingUp, desc: 'Generate analytics reports' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(action.page)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <action.icon className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{action.label}</span>
                  <span className="text-[10px] text-gray-400">{action.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
