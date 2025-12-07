import { useTheme } from '@/components/ThemeProvider'
import { themeConfig, getThemeColor } from '@/config/themeConfig'

/**
 * Custom hook to access theme configuration
 * Provides theme colors and utilities based on current theme mode
 * 
 * @example
 * const { colors, isDark, charts } = useAppTheme()
 * <div style={{ color: colors.text.primary }}>Text</div>
 */
export const useAppTheme = () => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  return {
    isDark,
    colors: isDark ? themeConfig.dark : themeConfig.light,
    brand: themeConfig.brand,
    charts: themeConfig.charts,
    status: themeConfig.status,
    getColor: (path: string) => getThemeColor(path, isDark),
  }
}

