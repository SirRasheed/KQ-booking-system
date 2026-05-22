'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HomePage } from '@/components/views/home-page';
import { LoginPage } from '@/components/views/login-page';
import { RegisterPage } from '@/components/views/register-page';
import { FlightSearchPage } from '@/components/views/flight-search-page';
import { BookingPage } from '@/components/views/booking-page';
import { MyBookingsPage } from '@/components/views/my-bookings-page';
import { HelpPage } from '@/components/views/help-page';
import { AdminDashboard } from '@/components/views/admin-dashboard';
import { AdminFlights } from '@/components/views/admin-flights';
import { AdminBookings } from '@/components/views/admin-bookings';
import { AdminPassengers } from '@/components/views/admin-passengers';
import { AdminEmployees } from '@/components/views/admin-employees';
import { AdminReports } from '@/components/views/admin-reports';
import { Toaster } from '@/components/ui/sonner';

export default function KenyaAirwaysApp() {
  const { currentPage, notification, setNotification } = useAppStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('kq_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        useAppStore.getState().setUser(user);
      } catch {}
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'login': return <LoginPage />;
      case 'register': return <RegisterPage />;
      case 'search': return <FlightSearchPage />;
      case 'booking': return <BookingPage />;
      case 'my-bookings': return <MyBookingsPage />;
      case 'help': return <HelpPage />;
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-flights': return <AdminFlights />;
      case 'admin-bookings': return <AdminBookings />;
      case 'admin-passengers': return <AdminPassengers />;
      case 'admin-employees': return <AdminEmployees />;
      case 'admin-reports': return <AdminReports />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-600' : 
          notification.type === 'error' ? 'bg-red-600' : 'bg-amber-600'
        }`}>
          {notification.message}
        </div>
      )}
      <Toaster />
    </div>
  );
}
