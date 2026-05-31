import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Profile = {
  fullName: string;
  license: string;
  company?: string;
  avatarUrl?: string;
  vehicleNumber?: string;
  parkingZone?: string;
  parkingSlot?: string;
  phone?: string;
  licenseExpiry?: string;
  vehicleType?: string;
  insurancePolicy?: string;
  medicalExpiry?: string;
  emergencyContact?: { name: string; phone: string } | null;
  allowedCargoTypes?: string[];
};

// For now this is a simple in-memory profile provider. Replace with
// persistent store or backend fetch when available.
const DEFAULT_PROFILE: Profile = {
  fullName: "Nguyen Van An",
  license: "AP-1024",
  company: "Công ty Cảng Sài Gòn",
  avatarUrl:
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300&auto=format&fit=crop",
  vehicleNumber: "51C-123.45",
  parkingZone: "Khu A",
  parkingSlot: "A-18",
  phone: "+84 912 345 678",
  licenseExpiry: "2026-12-31",
  vehicleType: "Container Truck (Prime mover)",
  insurancePolicy: "BH-2024-9901",
  medicalExpiry: "2025-06-30",
  emergencyContact: { name: "Tran Van B", phone: "+84 987 654 321" },
  allowedCargoTypes: ["General Goods", "Palletized"],
};

let profileState: Profile = DEFAULT_PROFILE;

const subscribers: Array<(p: Profile) => void> = [];
const STORAGE_KEY = "@app:driver_profile_v1";

async function loadProfileFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Profile;
      profileState = { ...DEFAULT_PROFILE, ...parsed };
      subscribers.forEach((s) => {
        try {
          s(profileState);
        } catch (e) {
          // ignore
        }
      });
    }
  } catch (e) {
    // ignore storage errors
  }
}

// kick off async load (fire-and-forget)
loadProfileFromStorage();

export function getProfile(): Profile {
  return profileState;
}

export function setProfile(p: Profile) {
  profileState = p;
  // notify subscribers
  subscribers.forEach((s) => {
    try {
      s(profileState);
    } catch (e) {
      // swallow subscriber errors
    }
  });
  // persist in background
  (async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileState));
    } catch (e) {
      // ignore
    }
  })();
}

// Lightweight hook for components to get reactive profile updates
export function useProfile() {
  const [local, setLocal] = useState<Profile>(profileState);
  useEffect(() => {
    const sub = (p: Profile) => setLocal(p);
    subscribers.push(sub);
    // sync initial
    setLocal(profileState);
    return () => {
      const idx = subscribers.indexOf(sub);
      if (idx >= 0) subscribers.splice(idx, 1);
    };
  }, []);
  return local;
}
