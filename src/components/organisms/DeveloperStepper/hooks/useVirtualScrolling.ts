import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number // Number of items to render outside visible area
  threshold?: number // Minimum items to enable virtualization
}

interface VirtualScrollState {
  startIndex: number
  endIndex: number
  totalHeight: number
  offsetY: number
  visibleItems: any[]
}

/**
 * Custom hook for virtual scrolling optimization
 */
export const useVirtualScrolling = <T>(
  items: T[],
  config: VirtualScrollConfig
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 50,
  } = config

  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate virtual scroll state
  const virtualState = useMemo((): VirtualScrollState => {
    const totalItems = items.length
    const totalHeight = totalItems * itemHeight

    // Only virtualize if we have enough items
    if (totalItems < threshold) {
      return {
        startIndex: 0,
        endIndex: totalItems - 1,
        totalHeight,
        offsetY: 0,
        visibleItems: items,
      }
    }

    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      totalItems - 1,
      startIndex + visibleCount + overscan * 2
    )

    const visibleItems = items.slice(startIndex, endIndex + 1)
    const offsetY = startIndex * itemHeight

    return {
      startIndex,
      endIndex,
      totalHeight,
      offsetY,
      visibleItems,
    }
  }, [items, itemHeight, containerHeight, scrollTop, overscan, threshold])

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    setScrollTop(target.scrollTop)
  }, [])

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight
      containerRef.current.scrollTop = scrollTop
    }
  }, [itemHeight])

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = virtualState.totalHeight
    }
  }, [virtualState.totalHeight])

  return {
    containerRef,
    virtualState,
    handleScroll,
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    isVirtualized: items.length >= threshold,
  }
}

/**
 * Custom hook for infinite scrolling
 */
export const useInfiniteScroll = <T>(
  items: T[],
  loadMore: () => void,
  hasMore: boolean,
  threshold: number = 100
) => {
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Load more items
  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      await loadMore()
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, loadMore])

  // Set up intersection observer
  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMoreItems()
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoading, loadMoreItems, threshold])

  return {
    loadMoreRef,
    isLoading,
  }
}

/**
 * Custom hook for optimized list rendering
 */
export const useOptimizedList = <T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactNode,
  config: {
    itemHeight: number
    containerHeight: number
    enableVirtualization?: boolean
    enableInfiniteScroll?: boolean
    loadMore?: () => void
    hasMore?: boolean
  }
) => {
  const {
    itemHeight,
    containerHeight,
    enableVirtualization = true,
    enableInfiniteScroll = false,
    loadMore,
    hasMore = false,
  } = config

  const virtualScroll = useVirtualScrolling(items, {
    itemHeight,
    containerHeight,
    threshold: enableVirtualization ? 50 : Infinity,
  })

  const infiniteScroll = useInfiniteScroll(
    items,
    loadMore || (() => {}),
    hasMore
  )

  const renderItems = useCallback(() => {
    if (virtualScroll.isVirtualized) {
      return virtualScroll.virtualState.visibleItems.map((item, index) =>
        renderItem(item, virtualScroll.virtualState.startIndex + index)
      )
    }

    return items.map((item, index) => renderItem(item, index))
  }, [
    items,
    renderItem,
    virtualScroll.isVirtualized,
    virtualScroll.virtualState,
  ])

  return {
    renderItems,
    virtualScroll,
    infiniteScroll,
  }
}
