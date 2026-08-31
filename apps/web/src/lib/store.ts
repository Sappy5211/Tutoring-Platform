import { create } from "zustand";
import type { UserRole } from "@vidya/contracts";

interface AppState { theme: "light" | "dark"; role: UserRole; setTheme: (theme: "light" | "dark") => void; setRole: (role: UserRole) => void }
export const useAppStore = create<AppState>((set) => ({ theme: "light", role: "student", setTheme: (theme) => set({ theme }), setRole: (role) => set({ role }) }));
