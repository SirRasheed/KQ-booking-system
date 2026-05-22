'use client';

import React from 'react';
import { Plane, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Kenya Airways</span>
            </div>
            <p className="text-sm text-gray-400">The Pride of Africa - Connecting Kenya to the World since 1977.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>Flight Search</li>
              <li>Manage Booking</li>
              <li>Check-in Online</li>
              <li>Flight Status</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-500" />
                +254 700 000 001
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-red-500" />
                info@kenya-airways.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                Embakasi, Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Kenya Airways. All rights reserved. | The Pride of Africa
        </div>
      </div>
    </footer>
  );
}
