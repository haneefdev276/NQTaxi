import {
  FileText,
  Navigation,
  CheckCircle,
  CreditCard,
  MessageSquare,
  Star,
  User,
  Car,
  HelpCircle,
  Gift,
  LogOut,
} from 'lucide-react';

export const bottomNavItems = [
  { id: 'ride-in-progress', label: 'Ride', icon: Navigation, path: '/driver/dashboard#ride-in-progress' },
  { id: 'trip-completion', label: 'Complete', icon: CheckCircle, path: '/driver/dashboard#trip-completion' },
  { id: 'trip-details', label: 'Details', icon: FileText, path: '/driver/dashboard#trip-details' },
  { id: 'payment-confirmation', label: 'Payment', icon: CreditCard, path: '/driver/dashboard#payment-confirmation' },
  { id: 'customer-rating', label: 'Rating', icon: Star, path: '/driver/dashboard#customer-rating' },
];

export const activeTripNavItems = [
  { id: 'ride-in-progress', label: 'Rider Progress', icon: Navigation, path: '/driver/dashboard#ride-in-progress' },
  { id: 'trip-completion', label: 'Trip Completion', icon: CheckCircle, path: '/driver/dashboard#trip-completion' },
  { id: 'trip-details', label: 'Trip Details', icon: FileText, path: '/driver/dashboard#trip-details' },
  { id: 'payment-confirmation', label: 'Payment Confirmation', icon: CreditCard, path: '/driver/dashboard#payment-confirmation' },
  { id: 'customer-rating', label: 'Customer Rating', icon: MessageSquare, path: '/driver/dashboard#customer-rating' },
];

export const accountNavItems = [
  { id: 'profile', label: 'Driver Profile Management', icon: User, path: '/driver/dashboard#profile' },
  { id: 'vehicle', label: 'Vehicle Information', icon: Car, path: '/driver/dashboard#vehicle' },
  { id: 'documents', label: 'Documents Management', icon: FileText, path: '/driver/dashboard#documents' },
  { id: 'support', label: 'Support & Help Center', icon: HelpCircle, path: '/driver/dashboard#support' },
  { id: 'referral', label: 'Refer & Earn', icon: Gift, path: '/driver/dashboard#referral' },
];

export const moreMenuItems = {
  driverFeatures: [
    { id: 'profile', label: 'Profile', icon: User, path: '/driver/dashboard#profile' },
    { id: 'vehicle', label: 'Vehicle Info', icon: Car, path: '/driver/dashboard#vehicle' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/driver/dashboard#documents' },
  ],
  safetySupport: [
    { id: 'support', label: 'Support', icon: HelpCircle, path: '/driver/dashboard#support' },
    { id: 'referral', label: 'Refer & Earn', icon: Gift, path: '/driver/dashboard#referral' },
  ],
  account: [
    { id: 'logout', label: 'Log Out', icon: LogOut, path: '#', action: true },
  ],
};

export const sidebarNavItems = activeTripNavItems;

