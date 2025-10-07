import { type StateCreator } from 'zustand'
import { type Project } from '@/types'

export interface ProjectSlice {
  projects: Project[]
  selectedProject: Project | null
  projectLoading: boolean
  projectError: string | null
  projectFilters: {
    status: string[]
    investorId: string[]
    search: string
  }
  projectPagination: {
    page: number
    limit: number
    total: number
  }
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setSelectedProject: (project: Project | null) => void
  setProjectLoading: (loading: boolean) => void
  setProjectError: (error: string | null) => void
  setProjectFilters: (filters: Partial<ProjectSlice['projectFilters']>) => void
  setProjectPagination: (pagination: Partial<ProjectSlice['projectPagination']>) => void
}

export const projectSlice: StateCreator<ProjectSlice> = (set, get) => ({
  projects: [],
  selectedProject: null,
  projectLoading: false,
  projectError: null,
  projectFilters: {
    status: [],
    investorId: [],
    search: '',
  },
  projectPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  
  setProjects: (projects) => set({ projects }),
  
  addProject: (project) => {
    const { projects } = get()
    set({ projects: [...projects, project] })
  },
  
  updateProject: (id, updates) => {
    const { projects } = get()
    set({
      projects: projects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      ),
    })
  },
  
  deleteProject: (id) => {
    const { projects } = get()
    set({
      projects: projects.filter(project => project.id !== id),
    })
  },
  
  setSelectedProject: (project) => set({ selectedProject: project }),
  
  setProjectLoading: (projectLoading) => set({ projectLoading }),
  
  setProjectError: (projectError) => set({ projectError }),
  
  setProjectFilters: (filters) => {
    const { projectFilters: currentFilters } = get()
    set({ projectFilters: { ...currentFilters, ...filters } })
  },
  
  setProjectPagination: (pagination) => {
    const { projectPagination: currentPagination } = get()
    set({ projectPagination: { ...currentPagination, ...pagination } })
  },
}) 