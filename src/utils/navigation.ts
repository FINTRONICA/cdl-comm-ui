import { addBasePath, stripBasePath } from './basePath'

export class NavigationService {
  static navigate(router: any, path: string, replace: boolean = false): void {
    if (replace) {
      router.replace(path)
    } else {
      router.push(path)
    }
  }

  static goToLogin(router: any, redirectTo?: string): void {
    const path = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/login'
    this.navigate(router, path, true)
  }

  static goToDashboard(router: any): void {
    this.navigate(router, '/dashboard', true)
  }

  static goToHome(router: any): void {
    this.navigate(router, '/')
  }

  static goBack(router: any): void {
    router.back()
  }

  static goForward(router: any): void {
    router.forward()
  }

  static refresh(router: any): void {
    router.refresh()
  }

  static goToTransaction(
    router: any,
    transactionId: string | number,
    step?: number,
    mode?: 'view' | 'edit'
  ): void {
    let path = `/transactions/tas/new/${transactionId}`
    const params = new URLSearchParams()

    if (step !== undefined) {
      params.set('step', step.toString())
    }
    if (mode) {
      params.set('mode', mode)
    }

    if (params.toString()) {
      path += `?${params.toString()}`
    }

    this.navigate(router, path)
  }

  static goToGuarantee(
    router: any,
    guaranteeId: string | number,
    step?: number,
    mode?: 'view' | 'edit'
  ): void {
    let path = `/surety_bond/new/${guaranteeId}`
    const params = new URLSearchParams()

    if (step !== undefined) {
      params.set('step', step.toString())
    }
    if (mode) {
      params.set('mode', mode)
    }

    if (params.toString()) {
      path += `?${params.toString()}`
    }

    this.navigate(router, path)
  }

  static goToInvestor(
    router: any,
    investorId: string | number,
    step?: number,
    mode?: 'view' | 'edit'
  ): void {
    let path = `/capital-partner/${investorId}`
    const params = new URLSearchParams()

    if (step !== undefined) {
      params.set('step', step.toString())
    }
    if (mode) {
      params.set('mode', mode)
    }

    if (params.toString()) {
      path += `?${params.toString()}`
    }

    this.navigate(router, path)
  }
}

export const useNavigation = () => {
  const router = require('next/navigation').useRouter()

  return {
    navigate: (path: string, replace: boolean = false) =>
      NavigationService.navigate(router, path, replace),
    goToLogin: (redirectTo?: string) =>
      NavigationService.goToLogin(router, redirectTo),
    goToDashboard: () => NavigationService.goToDashboard(router),
    goToHome: () => NavigationService.goToHome(router),
    goBack: () => NavigationService.goBack(router),
    goForward: () => NavigationService.goForward(router),
    refresh: () => NavigationService.refresh(router),
    goToTransaction: (
      transactionId: string | number,
      step?: number,
      mode?: 'view' | 'edit'
    ) => NavigationService.goToTransaction(router, transactionId, step, mode),
    goToGuarantee: (
      guaranteeId: string | number,
      step?: number,
      mode?: 'view' | 'edit'
    ) => NavigationService.goToGuarantee(router, guaranteeId, step, mode),
    goToInvestor: (
      investorId: string | number,
      step?: number,
      mode?: 'view' | 'edit'
    ) => NavigationService.goToInvestor(router, investorId, step, mode),
  }
}

let globalRouter: any = null

export const setGlobalRouter = (router: any) => {
  globalRouter = router
}

export const getGlobalRouter = () => globalRouter

export const serviceNavigation = {
  navigateTo: (path: string, replace: boolean = false) => {
    const normalizedPath = stripBasePath(path)
    if (globalRouter) {
      if (replace) {
        globalRouter.replace(normalizedPath)
      } else {
        globalRouter.push(normalizedPath)
      }
    } else if (typeof window !== 'undefined') {
      window.location.href = addBasePath(normalizedPath)
    }
  },

  goToLogin: (redirectTo?: string) => {
    const path = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/login'

    if (globalRouter) {
      globalRouter.replace(stripBasePath(path))
    } else if (typeof window !== 'undefined') {
      window.location.href = addBasePath(path)
    }
  },

  goToDashboard: () => {
    if (globalRouter) {
      globalRouter.replace('/dashboard')
    } else if (typeof window !== 'undefined') {
      window.location.href = addBasePath('/dashboard')
    }
  },

  goToHome: () => {
    if (globalRouter) {
      globalRouter.push('/')
    } else if (typeof window !== 'undefined') {
      window.location.href = addBasePath('/')
    }
  },

  refresh: () => {
    if (globalRouter) {
      globalRouter.refresh()
    } else if (typeof window !== 'undefined') {
      window.location.reload()
    }
  },
}
