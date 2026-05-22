'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, LogIn } from 'lucide-react';

export function LoginPage() {
  const { setCurrentPage, setUser, setNotification } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('kq_user', JSON.stringify(data.user));
        setNotification({ message: `Welcome back, ${data.user.name}!`, type: 'success' });
        setCurrentPage(data.user.role === 'ADMIN' ? 'admin-dashboard' : 'search');
      } else {
        setNotification({ message: data.error || 'Login failed', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-white">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
              <Plane className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Kenya Airways account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
              disabled={loading}
            >
              {loading ? 'Signing in...' : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => setCurrentPage('register')}
              className="text-red-600 hover:underline font-medium"
            >
              Register here
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>Admin: admin@kenyaairways.com / admin123</p>
              <p>Passenger: alice@example.com / pass123</p>
              <p>Employee: john.doe@kenyaairways.com / employee123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
