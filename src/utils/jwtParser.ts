
export class JWTParser {
  /**
   * Parse JWT token and extract all information
   * @param token - The JWT token to parse
   * @returns Parsed token information
   */
  static parseToken(token: string) {
    try {
      // Split the token into parts
      const parts = token.split('.')
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format')
      }

      // Decode header and payload
      const header = this.decodeBase64Url(parts[0]!)
      const payload = this.decodeBase64Url(parts[1]!)
      const signature = parts[2]

      // Parse JSON
      const headerObj = JSON.parse(header)
      const payloadObj = JSON.parse(payload) // Remove strict typing to handle different payload structures

      return {
        header: headerObj,
        payload: payloadObj,
        signature,
        raw: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2]
        }
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error)
      return null
    }
  }

  /**
   * Extract user role from realm_access.roles array
   * @param roles - Array of roles from token
   * @returns Mapped role name (admin, checker, maker, etc.)
   */
  static extractUserRole(roles: string[]): string {
    if (!roles || !Array.isArray(roles)) {
      return 'user'
    }

    // Find role that starts with "ROLE_"
    const roleWithPrefix = roles.find(role => role.startsWith('ROLE_'))
    
    if (!roleWithPrefix) {
      return 'user'
    }

    // Map role names: ROLE_ADMIN -> admin, ROLE_CHECKER -> checker, etc.
    const roleName = roleWithPrefix.replace('ROLE_', '').toLowerCase()
    
    // Additional mapping for specific roles if needed
    const roleMapping: Record<string, string> = {
      'admin': 'admin',
      'checker': 'checker', 
      'maker': 'maker',
      'user': 'user'
    }

    return roleMapping[roleName] || roleName
  }


  static extractUserInfo(token: string | any) {
    let parsed: any
    
    if (typeof token === 'string') {
      parsed = this.parseToken(token)
      if (!parsed) return null
    } else {
      parsed = token
    }

    const payload = parsed.payload

    const name = payload.name || payload.username || payload.userId || 'Unknown User'
    const email = payload.email || ''
    const userId = payload.sub || payload.userId || payload.user_id || payload.id || null
    
    // Extract role from realm_access.roles
    let role = 'user'
    if (payload.realm_access && payload.realm_access.roles) {
      role = this.extractUserRole(payload.realm_access.roles)
    } else if (payload.role) {
      role = payload.role
    }

    // let permissions: string[] = []
    // if (payload.resource_access) {
    //   Object.values(payload.resource_access).forEach((resource: any) => {
    //     if (resource.roles && Array.isArray(resource.roles)) {
    //       permissions = permissions.concat(resource.roles)
    //     }
    //   })
    // } else if (payload.permissions) {
    //   permissions = payload.permissions
    // }


    return {
      name,
      email,
      role,
      userId,
      // permissions,
      issuedAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000)
    }
  }

  static isExpired(token: string): boolean {
    const parsed = this.parseToken(token)
    if (!parsed) return true

    // Ensure exp exists and is a valid number
    const exp = parsed.payload.exp
    if (exp === undefined || exp === null || typeof exp !== 'number') {
      return true // Treat invalid tokens as expired for security
    }

    const currentTime = Math.floor(Date.now() / 1000)
    return exp < currentTime
  }


  static isExpiringSoon(token: string, minutes: number = 5): boolean {
    const parsed = this.parseToken(token)
    if (!parsed) return true

    const currentTime = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = parsed.payload.exp - currentTime
    const minutesUntilExpiry = timeUntilExpiry / 60

    return minutesUntilExpiry <= minutes
  }

  static getExpirationTime(token: string): Date | null {
    const parsed = this.parseToken(token)
    if (!parsed) return null

    return new Date(parsed.payload.exp * 1000)
  }


  static getIssueTime(token: string): Date | null {
    const parsed = this.parseToken(token)
    if (!parsed) return null

    return new Date(parsed.payload.iat * 1000)
  }


  static getTimeUntilExpiry(token: string): number {
    const parsed = this.parseToken(token)
    if (!parsed) return -1

    const currentTime = Date.now()
    const expirationTime = parsed.payload.exp * 1000
    return expirationTime - currentTime
  }


  static isValidFormat(token: string): boolean {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return false

      // Check if parts are valid base64url
      const header = this.decodeBase64Url(parts[0]!)
      const payload = this.decodeBase64Url(parts[1]!)

      // Try to parse JSON
      JSON.parse(header)
      JSON.parse(payload)

      return true
    } catch {
      return false
    }
  }


  static getTokenAge(token: string): number | null {
    const parsed = this.parseToken(token)
    if (!parsed) return null

    const currentTime = Math.floor(Date.now() / 1000)
    return currentTime - parsed.payload.iat
  }

  /**
   * Decode base64url string
   * @param str - Base64url encoded string
   * @returns Decoded string
   */
  private static decodeBase64Url(str: string): string {
    // Convert base64url to base64
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    
    // Decode - use Buffer for Node.js/Edge Runtime compatibility
    // Fallback to atob for browser environments
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf-8')
    } else if (typeof atob !== 'undefined') {
      return atob(padded)
    } else {
      throw new Error('No base64 decoding method available')
    }
  }


  static getTokenInfo(token: string) {
    const parsed = this.parseToken(token)
    if (!parsed) return null

    const userInfo = this.extractUserInfo(parsed)
    if (!userInfo) return null

    const age = this.getTokenAge(token)
    const timeUntilExpiry = this.getTimeUntilExpiry(token)

    return {
      token: {
        token: parsed.payload,
        issuedAt: new Date(parsed.payload.iat * 1000),
        expiresAt: new Date(parsed.payload.exp * 1000),
        age: age ? `${age} seconds` : 'Unknown',
        timeUntilExpiry: timeUntilExpiry > 0 ? `${Math.floor(timeUntilExpiry / 1000)} seconds` : 'Expired',
        isExpired: this.isExpired(token),
        isExpiringSoon: this.isExpiringSoon(token),
        isValid: this.isValidFormat(token) && !this.isExpired(token),
      },
      user: userInfo
    }
  }
}
