import { create } from "zustand";

type UiState = {
  mobileNavigationOpen: boolean;
  commandPaletteOpen: boolean;
  setMobileNavigationOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileNavigationOpen: false,
  commandPaletteOpen: false,
  setMobileNavigationOpen: (mobileNavigationOpen) =>
    set({ mobileNavigationOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) =>
    set({ commandPaletteOpen }),
}));
