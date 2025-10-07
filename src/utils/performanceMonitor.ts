// Performance monitoring utility for tracking navigation and component performance

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private enabled: boolean = process.env.NODE_ENV === 'development'

  /**
   * Start timing a performance metric
   */
  start(name: string): void {
    if (!this.enabled) return

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    })
  }

  /**
   * End timing a performance metric and log the result
   */
  end(name: string): void {
    if (!this.enabled) return

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`)
      return
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    console.log(`⏱️ Performance [${name}]: ${metric.duration.toFixed(2)}ms`)

    // Log warning for slow operations
    if (metric.duration > 100) {
      console.warn(`⚠️ Slow operation detected [${name}]: ${metric.duration.toFixed(2)}ms`)
    }

    this.metrics.delete(name)
  }

  /**
   * Measure the execution time of a function
   */
  async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    if (!this.enabled) {
      return await fn()
    }

    this.start(name)
    try {
      const result = await fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }

  /**
   * Measure the execution time of a synchronous function
   */
  measureSync<T>(name: string, fn: () => T): T {
    if (!this.enabled) {
      return fn()
    }

    this.start(name)
    try {
      const result = fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }

  /**
   * Get all current metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Convenience functions
export const startTimer = (name: string) => performanceMonitor.start(name)
export const endTimer = (name: string) => performanceMonitor.end(name)
export const measure = <T>(name: string, fn: () => Promise<T> | T) => performanceMonitor.measure(name, fn)
export const measureSync = <T>(name: string, fn: () => T) => performanceMonitor.measureSync(name, fn) 