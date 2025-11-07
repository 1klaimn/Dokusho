import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { create } from 'zustand';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats "PLAN_TO_READ" into "Plan To Read"
export function formatStatus(status: string) {
  if (!status) return "";
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
interface CommandState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));