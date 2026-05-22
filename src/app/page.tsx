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
import { ProfilePage } from '@/components/views/profile-page';
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
    const { accessibility } = useAppStore.getState();

    // Apply high contrast
    if (accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply font size
    document.documentElement.classList.remove('font-normal', 'font-large', 'font-xlarge');
    document.documentElement.classList.add(`font-${accessibility.fontSize}`);

    // Subscribe to changes
    const unsub = useAppStore.subscribe((state) => {
      if (state.accessibility.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      document.documentElement.classList.remove('font-normal', 'font-large', 'font-xlarge');
      document.documentElement.classList.add(`font-${state.accessibility.fontSize}`);
    });

    return unsub;
  }, []);

  useEffect(() => {
    // Check for saved session and validate user still exists
    const savedUser = localStorage.getItem('kq_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Verify user still exists in DB
        fetch(`/api/auth/me?userId=${user.id}`)
          .then(res => {
            if (res.ok) {
              useAppStore.getState().setUser(user);
            } else {
              // User no longer exists, clear stale session
              localStorage.removeItem('kq_user');
            }
          })
          .catch(() => {
            // Network error, still set user optimistically
            useAppStore.getState().setUser(user);
          });
      } catch {
        localStorage.removeItem('kq_user');
      }
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
      case 'profile': return <ProfilePage />;
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
