import { create } from 'zustand';

interface Pond {
  id: string;
  name: string;
  area_acres: number;
  species: string;
  status: string;
}

interface PondStore {
  ponds: Pond[];
  selectedPond: Pond | null;
  setPonds: (ponds: Pond[]) => void;
  selectPond: (pond: Pond) => void;
  addPond: (pond: Pond) => void;
  removePond: (id: string) => void;
}

export const usePondStore = create<PondStore>((set) => ({
  ponds: [],
  selectedPond: null,
  setPonds: (ponds) => set({ ponds }),
  selectPond: (pond) => set({ selectedPond: pond }),
  addPond: (pond) => set((state) => ({ ponds: [...state.ponds, pond] })),
  removePond: (id) =>
    set((state) => ({
      ponds: state.ponds.filter((p) => p.id !== id),
    })),
}));
