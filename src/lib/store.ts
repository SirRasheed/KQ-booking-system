import { create } from 'zustand';

export type PageView = 
  | 'home'
  | 'login'
  | 'register'
  | 'search'
  | 'booking'
  | 'my-bookings'
  | 'help'
  | 'admin-dashboard'
  | 'admin-flights'
  | 'admin-bookings'
  | 'admin-passengers'
  | 'admin-employees'
  | 'admin-reports'
  | 'profile';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  nationality?: string;
  passportId?: string;
}

interface AppState {
  // Navigation
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  
  // Booking flow
  selectedFlightId: string | null;
  setSelectedFlightId: (id: string | null) => void;
  selectedTravelClass: string | null;
  setSelectedTravelClass: (cls: string | null) => void;
  
  // Search params
  searchOrigin: string;
  setSearchOrigin: (origin: string) => void;
  searchDestination: string;
  setSearchDestination: (dest: string) => void;
  searchDate: string;
  setSearchDate: (date: string) => void;
  
  // Notifications
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  setNotification: (n: { message: string; type: 'success' | 'error' | 'info' } | null) => void;

  // Accessibility
  accessibility: {
    highContrast: boolean;
    fontSize: 'normal' | 'large' | 'xlarge';
  };
  setAccessibility: (settings: Partial<AppState['accessibility']>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Auth
  user: null,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  isLoggedIn: false,
  
  // Booking flow
  selectedFlightId: null,
  setSelectedFlightId: (id) => set({ selectedFlightId: id }),
  selectedTravelClass: null,
  setSelectedTravelClass: (cls) => set({ selectedTravelClass: cls }),
  
  // Search params
  searchOrigin: '',
  setSearchOrigin: (origin) => set({ searchOrigin: origin }),
  searchDestination: '',
  setSearchDestination: (dest) => set({ searchDestination: dest }),
  searchDate: '',
  setSearchDate: (date) => set({ searchDate: date }),
  
  // Notifications
  notification: null,
  setNotification: (n) => set({ notification: n }),

  // Accessibility
  accessibility: { highContrast: false, fontSize: 'normal' },
  setAccessibility: (settings) => {
    set((state) => {
      const newA11y = { ...state.accessibility, ...settings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kq_accessibility', JSON.stringify(newA11y));
      }
      return { accessibility: newA11y };
    });
  },
}));

// Load saved accessibility settings from localStorage
const savedA11y = typeof window !== 'undefined' ? localStorage.getItem('kq_accessibility') : null;
if (savedA11y) {
  try {
    const parsed = JSON.parse(savedA11y);
    useAppStore.setState({ accessibility: parsed });
  } catch {
    // Ignore invalid saved data
  }
}
