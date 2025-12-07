import { EnhancedSessionService } from '@/services/enhancedSessionService'

const mockCookieState = {
  token: null as string | null,
  userType: null as string | null,
  userName: null as string | null,
  userId: null as string | null,
  refreshToken: null as string | null,
}

jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
  },
}))

jest.mock('@/utils/cookieUtils', () => ({
  getAuthCookies: jest.fn(() => ({ ...mockCookieState })),
  setAuthCookies: jest.fn((
    token: string,
    userType: string,
    userName: string,
    userId: string,
    refreshToken?: string
  ) => {
    mockCookieState.token = token
    mockCookieState.userType = userType
    mockCookieState.userName = userName
    mockCookieState.userId = userId
    if (refreshToken) {
      mockCookieState.refreshToken = refreshToken
    }
  }),
  setRefreshTokenCookie: jest.fn((refreshToken: string) => {
    mockCookieState.refreshToken = refreshToken
  }),
  clearAuthCookies: jest.fn(() => {
    mockCookieState.token = null
    mockCookieState.userType = null
    mockCookieState.userName = null
    mockCookieState.userId = null
    mockCookieState.refreshToken = null
  }),
}))

jest.mock('@/utils/jwtParser', () => ({
  JWTParser: {
    parseToken: jest.fn(),
    extractUserInfo: jest.fn(),
    isExpired: jest.fn(),
  },
}))

jest.mock('@/utils/navigation', () => ({
  serviceNavigation: {
    goToLogin: jest.fn(),
  },
}))

describe('EnhancedSessionService', () => {
  const { apiClient } = require('@/lib/apiClient')
  const { getAuthCookies } = require('@/utils/cookieUtils')
  const { JWTParser } = require('@/utils/jwtParser')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})

    sessionStorage.clear()
    localStorage.clear()
    Object.assign(mockCookieState, {
      token: 'access-token',
      userType: 'user',
      userName: 'Test User',
      userId: '123',
      refreshToken: 'refresh-token',
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers()
    } catch {
      // ignore when there are no pending timers
    }
    EnhancedSessionService.destroy()
    jest.useRealTimers()
    jest.restoreAllMocks()
    sessionStorage.clear()
    localStorage.clear()
    Object.assign(mockCookieState, {
      token: null,
      userType: null,
      userName: null,
      userId: null,
      refreshToken: null,
    })
  })

  it('invokes refresh endpoint one minute before token expiry', async () => {
    const base = Date.now()

    ;(getAuthCookies as jest.Mock).mockImplementation(() => ({ ...mockCookieState }))
    ;(JWTParser.parseToken as jest.Mock).mockReturnValue({
      payload: {
        exp: Math.floor((base + 2 * 60 * 1000) / 1000), // expires in 2 minutes
      },
    })
    ;(JWTParser.extractUserInfo as jest.Mock).mockReturnValue({
      role: 'user',
      name: 'Test User',
      userId: '123',
    })

    ;(apiClient.post as jest.Mock).mockResolvedValue({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      expires_in: 120,
      refresh_expires_in: 3600,
      token_type: 'Bearer',
    })

    EnhancedSessionService.startSession()

    jest.advanceTimersByTime(60 * 1000)
    await Promise.resolve()

    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'refresh-token',
    })
  })

  it('skips refresh while inactive and resumes after activity', async () => {
    const base = Date.now()

    ;(getAuthCookies as jest.Mock).mockImplementation(() => ({ ...mockCookieState }))
    ;(JWTParser.parseToken as jest.Mock).mockReturnValue({
      payload: {
        exp: Math.floor((base + 2 * 60 * 1000) / 1000),
      },
    })
    ;(JWTParser.extractUserInfo as jest.Mock).mockReturnValue({
      role: 'user',
      name: 'Test User',
      userId: '123',
    })

    ;(apiClient.post as jest.Mock).mockResolvedValue({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      expires_in: 120,
      refresh_expires_in: 3600,
      token_type: 'Bearer',
    })

    let isActive = false
    const isUserActiveSpy = jest
      .spyOn(EnhancedSessionService as unknown as { isUserActive: () => boolean }, 'isUserActive')
      .mockImplementation(() => isActive)

    EnhancedSessionService.startSession()

    // Simulate user being inactive for 20 minutes so updateActivity can trigger refresh later
    localStorage.setItem(
      'last_activity',
      String(Date.now() - 20 * 60 * 1000),
    )

    jest.advanceTimersByTime(60 * 1000)

    expect(apiClient.post).not.toHaveBeenCalled()

    // User becomes active again
    isActive = true
    EnhancedSessionService.updateActivity()

    await Promise.resolve()

    expect(apiClient.post).toHaveBeenCalledTimes(1)

    isUserActiveSpy.mockRestore()
  })
})

