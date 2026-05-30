import { useState, useEffect } from 'react';

export type Profile = {
  fullName: string;
  license: string;
  company?: string;
  avatarUrl?: string;
  vehicleNumber?: string;
  parkingZone?: string;
  parkingSlot?: string;
};

// For now this is a simple in-memory profile provider. Replace with
// persistent store or backend fetch when available.
const DEFAULT_PROFILE: Profile = {
  fullName: 'Nguyen Van An',
  license: 'AP-1024',
  company: 'Công ty Cảng Sài Gòn',
  avatarUrl:
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300&auto=format&fit=crop',
  vehicleNumber: '51C-123.45',
  parkingZone: 'Khu A',
  parkingSlot: 'A-18',
};

let profileState: Profile = DEFAULT_PROFILE;

export function getProfile(): Profile {
  return profileState;
}

export function setProfile(p: Profile) {
  profileState = p;
}

// Lightweight hook for components that want reactive updates in future.
export function useProfile() {
  const [, setTick] = useState(0);
  useEffect(() => {
    // no-op for now; placeholder for subscription-based updates
  }, []);
  return getProfile();
}
