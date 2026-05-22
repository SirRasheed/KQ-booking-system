'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, Search, Clock, ArrowRight, Users, AlertCircle, Lightbulb } from 'lucide-react';

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
  _count?: { bookings: number };
}

export function FlightSearchPage() {
  const { user, setCurrentPage, setSelectedFlightId, setSelectedTravelClass, setNotification,
    searchOrigin, setSearchOrigin, searchDestination, setSearchDestination, searchDate, setSearchDate } = useAppStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      setNotification({ message: 'Please login to search and book flights', type: 'info' });
      setCurrentPage('login');
      return;
    }
    // Load all flights initially
    fetchFlights();
  }, [user]);

  const fetchFlights = async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params || {}).toString();
      const res = await fetch(`/api/flights${query ? `?${query}` : ''}`);
      const data = await res.json();
      setFlights(data.flights || data || []);
      setSearched(true);
    } catch {
      setNotification({ message: 'Failed to load flights', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchOrigin) params.origin = searchOrigin;
    if (searchDestination) params.destination = searchDestination;
    if (searchDate) params.date = searchDate;
    if (statusFilter !== 'all') params.status = statusFilter;
    fetchFlights(params);
  };

  const handleBook = (flightId: string, travelClass: string) => {
    setSelectedFlightId(flightId);
    setSelectedTravelClass(travelClass);
    setCurrentPage('booking');
  };

  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const filteredFlights = statusFilter === 'all' 
    ? flights 
    : flights.filter(f => f.status === statusFilter);

  // Find next available flights for sold-out destinations
  const getNextAvailableFlight = (currentFlight: Flight, travelClass: string) => {
    const getSeats = (f: Flight, cls: string) => {
      switch (cls) {
        case 'EXECUTIVE': return f.executiveSeats;
        case 'MIDDLE': return f.middleSeats;
        case 'LOW': return f.lowSeats;
        default: return 0;
      }
    };

    return flights
      .filter(f => 
        f.id !== currentFlight.id && 
        f.destination === currentFlight.destination && 
        f.origin === currentFlight.origin &&
        new Date(f.departureTime) > new Date(currentFlight.departureTime) &&
        getSeats(f, travelClass) > 0
      )
      .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())[0] || null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Search Flights</h1>
        <p className="text-gray-500 mt-1">Find and book your perfect flight</p>
      </div>

      {/* Search Form */}
      <Card className="mb-8 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Input
                  placeholder="e.g. Nairobi"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Input
                  placeholder="e.g. Mombasa"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="BOARDING">Boarding</SelectItem>
                    <SelectItem value="DEPARTED">Departed</SelectItem>
                    <SelectItem value="ARRIVED">Arrived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search Flights'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setSearchOrigin('');
                setSearchDestination('');
                setSearchDate('');
                setStatusFilter('all');
                fetchFlights();
              }}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
            </h2>
          </div>

          {filteredFlights.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">No flights found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFlights.map((flight) => (
                <Card key={flight.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Flight Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                            {flight.flightNumber}
                          </Badge>
                          <Badge variant={flight.status === 'SCHEDULED' ? 'default' : 'secondary'}>
                            {flight.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{flight.origin}</p>
                            <p className="text-gray-500 text-xs">{formatDateTime(flight.departureTime)}</p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="h-px w-8 bg-gray-300"></div>
                            <Plane className="h-4 w-4" />
                            <div className="h-px w-8 bg-gray-300"></div>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{flight.destination}</p>
                            <p className="text-gray-500 text-xs">{formatDateTime(flight.arrivalTime)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Class Options */}
                      <div className="grid grid-cols-3 gap-3 lg:gap-4">
                        {[
                          { label: 'Executive', class: 'EXECUTIVE', seats: flight.executiveSeats, price: flight.executivePrice },
                          { label: 'Middle', class: 'MIDDLE', seats: flight.middleSeats, price: flight.middlePrice },
                          { label: 'Economy', class: 'LOW', seats: flight.lowSeats, price: flight.lowPrice },
                        ].map((opt) => {
                          const nextFlight = opt.seats <= 0 ? getNextAvailableFlight(flight, opt.class) : null;
                          return (
                            <div
                              key={opt.class}
                              className={`p-3 rounded-lg border text-center ${
                                opt.seats > 0 ? 'border-gray-200 hover:border-red-300 cursor-pointer' : 'border-gray-100 bg-gray-50'
                              }`}
                              onClick={() => opt.seats > 0 && handleBook(flight.id, opt.class)}
                            >
                              <p className="text-xs text-gray-500 mb-1">{opt.label}</p>
                              <p className="font-bold text-sm text-gray-900">{formatPrice(opt.price)}</p>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span className={`text-xs ${opt.seats > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {opt.seats > 0 ? `${opt.seats} seats` : 'Sold out'}
                                </span>
                              </div>
                              {opt.seats <= 0 && nextFlight && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="flex items-center justify-center gap-1">
                                    <Lightbulb className="h-3 w-3 text-amber-500" />
                                    <span className="text-[10px] text-amber-600 font-medium">Next: {nextFlight.flightNumber}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    {new Date(nextFlight.departureTime).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
