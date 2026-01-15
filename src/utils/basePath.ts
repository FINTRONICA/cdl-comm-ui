export const BASE_PATH = '/commercial'

function normalizePathname(pathname: string): string {
  if (!pathname) return '/'
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

function hasExactBasePath(pathname: string): boolean {
  const p = normalizePathname(pathname)
  return p === BASE_PATH || p.startsWith(`${BASE_PATH}/`)
}

/**
 * Strips the base path from a given pathname
 * Used when comparing routes in middleware or components
 * 
 * @param pathname - The full pathname (e.g., '/commercial/login')
 * @returns The pathname without base path (e.g., '/login')
 * 
 * @example
 * stripBasePath('/commercial/login') // returns '/login'
 * stripBasePath('/login') // returns '/login' (already stripped)
 */
export function stripBasePath(pathname: string): string {
  let p = normalizePathname(pathname)

  // Strip repeatedly to protect against accidental double basePath like:
  // `/commercial/commercial/agreement` -> `/agreement`
  while (hasExactBasePath(p)) {
    p = p.slice(BASE_PATH.length) || '/'
    p = normalizePathname(p)
  }

  return p
}

/**
 * Adds the base path to a given pathname
 * Used for window.location or manual redirects
 * 
 * @param pathname - The pathname without base path (e.g., '/login')
 * @returns The full pathname with base path (e.g., '/commercial/login')
 * 
 * @example
 * addBasePath('/login') // returns '/commercial/login'
 * addBasePath('/commercial/login') // returns '/commercial/login' (already has base path)
 */
export function addBasePath(pathname: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = normalizePathname(pathname)
  
  // If path already has base path (segment-aware), return as is
  if (hasExactBasePath(cleanPath)) {
    return cleanPath
  }
  
  // If it's the root path, return base path
  if (cleanPath === '/') {
    return BASE_PATH
  }
  
  return `${BASE_PATH}${cleanPath}`
}

/**
 * Checks if a pathname has the base path
 */
export function hasBasePath(pathname: string): boolean {
  return hasExactBasePath(pathname)
}


export function getPublicAssetPath(assetPath: string): string {
  // Ensure the path starts with /
  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`
  
  // If it already has the base path, return as is
  if (hasExactBasePath(normalizedPath)) {
    return normalizedPath
  }
  
  // Add base path prefix
  return `${BASE_PATH}${normalizedPath}`
}