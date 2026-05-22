'use client';

import React, { useState } from 'react';
import { useAppStore, type PageView } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Plane,
  Menu,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Search,
  BookOpen,
  HelpCircle,
  Shield,
  UserCog,
} from 'lucide-react';

export function Header() {
  const { user, isLoggedIn, setUser, setCurrentPage } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  const handleLogout = () => {
    localStorage.removeItem('kq_user');
    setUser(null);
    setCurrentPage('home');
  };

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  const passengerLinks = [
    { page: 'search' as PageView, label: 'Search Flights', icon: Search },
    { page: 'my-bookings' as PageView, label: 'My Bookings', icon: BookOpen },
    { page: 'help' as PageView, label: 'Help & FAQ', icon: HelpCircle },
  ];

  const adminLinks = [
    { page: 'admin-dashboard' as PageView, label: 'Dashboard', icon: LayoutDashboard },
    { page: 'admin-flights' as PageView, label: 'Manage Flights', icon: Plane },
    { page: 'admin-bookings' as PageView, label: 'Manage Bookings', icon: BookOpen },
    { page: 'admin-passengers' as PageView, label: 'Passengers', icon: User },
    { page: 'admin-employees' as PageView, label: 'Employees', icon: Shield },
    { page: 'admin-reports' as PageView, label: 'Reports', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-red-700 leading-tight">Kenya Airways</span>
            <span className="text-[10px] text-gray-500 leading-tight tracking-widest uppercase">The Pride of Africa</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isLoggedIn && !isAdmin && !isEmployee && passengerLinks.map((link) => (
            <Button
              key={link.page}
              variant="ghost"
              size="sm"
              onClick={() => navigateTo(link.page)}
              className="text-gray-700 hover:text-red-700 hover:bg-red-50"
            >
              <link.icon className="h-4 w-4 mr-1" />
              {link.label}
            </Button>
          ))}

          {isAdmin && adminLinks.map((link) => (
            <Button
              key={link.page}
              variant="ghost"
              size="sm"
              onClick={() => navigateTo(link.page)}
              className="text-gray-700 hover:text-red-700 hover:bg-red-50"
            >
              <link.icon className="h-4 w-4 mr-1" />
              {link.label}
            </Button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-red-700" />
                  </div>
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-red-600 font-medium mt-1">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigateTo('admin-dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                {!isAdmin && !isEmployee && (
                  <>
                    <DropdownMenuItem onClick={() => navigateTo('profile')}>
                      <UserCog className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigateTo('my-bookings')}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigateTo('search')}>
                      <Search className="mr-2 h-4 w-4" />
                      Search Flights
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo('login')}
                className="text-gray-700"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigateTo('register')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Register
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                <h3 className="text-lg font-semibold text-red-700 mb-2">Navigation</h3>
                {isLoggedIn && !isAdmin && !isEmployee && passengerLinks.map((link) => (
                  <Button
                    key={link.page}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigateTo(link.page)}
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Button>
                ))}
                {isAdmin && adminLinks.map((link) => (
                  <Button
                    key={link.page}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigateTo(link.page)}
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Button>
                ))}
                {!isLoggedIn && (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => navigateTo('login')}>
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                    <Button variant="ghost" className="justify-start" onClick={() => navigateTo('register')}>
                      <User className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
