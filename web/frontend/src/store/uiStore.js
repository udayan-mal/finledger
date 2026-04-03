import { create } from "zustand";

export const useUiStore = create((set) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  quickAddOpen: false,
  setQuickAddOpen: (quickAddOpen) => set({ quickAddOpen })
}));
