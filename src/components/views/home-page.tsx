'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, Search, Shield, Globe, Clock, Headphones, ArrowRight, Star } from 'lucide-react';

export function HomePage() {
  const { setCurrentPage, setSearchOrigin, setSearchDestination } = useAppStore();

  const handleSearchFlights = () => {
    setCurrentPage('search');
  };

  const popularRoutes = [
    { from: 'Nairobi', to: 'Mombasa', price: 'KES 8,000', icon: '🏖️' },
    { from: 'Nairobi', to: 'London', price: 'KES 95,000', icon: '🇬🇧' },
    { from: 'Nairobi', to: 'Dubai', price: 'KES 55,000', icon: '🏙️' },
    { from: 'Nairobi', to: 'Johannesburg', price: 'KES 42,000', icon: '🇿🇦' },
  ];

  const features = [
    { icon: Search, title: 'Easy Booking', desc: 'Search and book flights in minutes' },
    { icon: Shield, title: 'Secure Payments', desc: 'Your transactions are protected' },
    { icon: Globe, title: 'Global Network', desc: 'Connecting you to 50+ destinations' },
    { icon: Clock, title: '24/7 Support', desc: 'Always here when you need us' },
    { icon: Headphones, title: 'Live Help', desc: 'AI-powered customer assistance' },
    { icon: Star, title: 'Loyalty Rewards', desc: 'Earn miles on every flight' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJILTEweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
              <Plane className="h-4 w-4" />
              The Pride of Africa
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Fly with <span className="text-yellow-300">Kenya Airways</span>
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl">
              Discover the beauty of Africa and beyond. Book your next adventure with Kenya Airways — reliable, comfortable, and affordable flights to 50+ destinations worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleSearchFlights}
                className="bg-white text-red-700 hover:bg-red-50 font-semibold text-base px-8 h-12"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Flights
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCurrentPage('help')}
                className="border-white text-white hover:bg-white/10 h-12"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popular Routes</h2>
          <p className="text-gray-500 mt-2">Explore our most booked destinations</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRoutes.map((route, i) => (
            <Card
              key={i}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
              onClick={() => {
                setSearchOrigin(route.from + ' (NBO)');
                setSearchDestination(route.to);
                setCurrentPage('search');
              }}
            >
              <CardContent className="p-5">
                <div className="text-3xl mb-3">{route.icon}</div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <span>{route.from}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-semibold text-gray-900">{route.to}</span>
                </div>
                <p className="text-red-600 font-bold text-lg">From {route.price}</p>
                <p className="text-xs text-gray-400 mt-1">Click to search →</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why Choose Kenya Airways?</h2>
            <p className="text-gray-500 mt-2">Experience world-class service on every flight</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Classes */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Travel Classes</h2>
          <p className="text-gray-500 mt-2">Choose the comfort that suits you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Executive Class', class: 'A', seats: 20, desc: 'Premium luxury with spacious seats, gourmet dining, and priority boarding.', color: 'from-amber-500 to-amber-600' },
            { name: 'Middle Class', class: 'B', seats: 50, desc: 'Enhanced comfort with extra legroom, quality meals, and personal entertainment.', color: 'from-red-500 to-red-600' },
            { name: 'Low Class', class: 'C', seats: 100, desc: 'Affordable fares with comfortable seating, complimentary snacks, and friendly service.', color: 'from-gray-500 to-gray-600' },
          ].map((cls, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 bg-gradient-to-r ${cls.color}`}></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">Class {cls.class}</span>
                  <span className="text-xs text-gray-400">{cls.seats} seats</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cls.name}</h3>
                <p className="text-sm text-gray-500">{cls.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-red-700 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Take Off?</h2>
          <p className="text-red-100 mb-8 max-w-lg mx-auto">
            Book your flight today and experience the warmth of African hospitality with Kenya Airways.
          </p>
          <Button
            size="lg"
            onClick={handleSearchFlights}
            className="bg-white text-red-700 hover:bg-red-50 font-semibold text-base px-8 h-12"
          >
            <Plane className="h-5 w-5 mr-2" />
            Book a Flight Now
          </Button>
        </div>
      </section>
    </div>
  );
}
