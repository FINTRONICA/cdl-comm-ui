import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SidebarLabelsUIStore, ProcessedLabels } from '@/types/sidebarLabels'

export const useSidebarLabelsStore = create<SidebarLabelsUIStore>()(
  persist(
    (set) => ({
      // UI State only
      currentLanguage: 'EN',
      labels: {}, // Keep for backward compatibility with existing components

      // UI Actions only
      setLanguage: (language: string) => set({ currentLanguage: language }),

      setLabels: (labels: ProcessedLabels) => set({ labels }),

      clearLabels: () => set({ labels: {} }),
    }),
    {
      name: 'sidebar-labels-ui-storage',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        labels: state.labels, // Keep for backward compatibility
      }),
    }
  )
)
