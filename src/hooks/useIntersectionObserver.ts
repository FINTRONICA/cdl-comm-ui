import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<Element | null>(null)

  const callback = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry) {
      setIsIntersecting(entry.isIntersecting)
      setEntry(entry)
    }
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(callback, {
      threshold: options.threshold || 0,
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options.threshold, options.root, options.rootMargin])

  const ref = (node: Element | null) => {
    elementRef.current = node
  }

  return { ref, isIntersecting, entry }
}

export function useInView(options: UseIntersectionObserverOptions = {}) {
  const { ref, isIntersecting } = useIntersectionObserver(options)
  return { ref, inView: isIntersecting }
} 