import { create } from "zustand";

interface ComparisonStore {
  selectedCompanies: string[];
  toggleCompany: (id: string) => void;
  clearSelected: () => void;
  isCompanySelected: (id: string) => boolean;
}

export const useComparisonStore = create<ComparisonStore>((set, get) => ({
  selectedCompanies: [],
  toggleCompany: (id: string) => {
    set((state) => {
      if (state.selectedCompanies.includes(id)) {
        return {
          selectedCompanies: state.selectedCompanies.filter((cid) => cid !== id),
        };
      } else {
        return {
          selectedCompanies: [...state.selectedCompanies, id],
        };
      }
    });
  },
  clearSelected: () => set({ selectedCompanies: [] }),
  isCompanySelected: (id: string) => {
    return get().selectedCompanies.includes(id);
  },
}));

interface FilterStore {
  selectedColors: string[];
  searchQuery: string;
  setSelectedColors: (colors: string[]) => void;
  toggleColor: (color: string) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  selectedColors: [],
  searchQuery: "",
  setSelectedColors: (colors: string[]) => set({ selectedColors: colors }),
  toggleColor: (color: string) => {
    set((state) => {
      if (state.selectedColors.includes(color)) {
        return {
          selectedColors: state.selectedColors.filter((c) => c !== color),
        };
      } else {
        return {
          selectedColors: [...state.selectedColors, color],
        };
      }
    });
  },
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  clearFilters: () => set({ selectedColors: [], searchQuery: "" }),
}));
