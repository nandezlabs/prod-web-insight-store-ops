import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Store {
  id: string;
  number: string;
  name: string;
  pin: string; // Auto-generated 4-digit PIN
  createdAt: string;
}

interface SetupState {
  isSetupComplete: boolean;
  adminPin: string | null;
  stores: Store[];

  // Actions
  setAdminPin: (pin: string) => void;
  addStore: (storeNumber: string, pin: string) => void;
  updateStorePin: (storeId: string, newPin: string) => void;
  completeSetup: () => void;
  resetSetup: () => void; // For testing only
}

// Helper function to generate random 4-digit PIN
const generateRandomPin = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const useSetupStore = create<SetupState>()(
  persist(
    (set) => ({
      isSetupComplete: false,
      adminPin: null,
      stores: [],

      setAdminPin: (pin: string) => {
        set({ adminPin: pin });
      },

      addStore: (storeNumber: string, pin: string) => {
        const newStore: Store = {
          id: `store-${Date.now()}`,
          number: storeNumber,
          name: `Store ${storeNumber}`,
          pin: pin,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          stores: [...state.stores, newStore],
        }));
      },

      updateStorePin: (storeId: string, newPin: string) => {
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId ? { ...store, pin: newPin } : store
          ),
        }));
      },

      completeSetup: () => {
        set({ isSetupComplete: true });
      },

      resetSetup: () => {
        set({
          isSetupComplete: false,
          adminPin: null,
          stores: [],
        });
      },
    }),
    {
      name: "admin-setup-storage",
    }
  )
);

export { generateRandomPin };
