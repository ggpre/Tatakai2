import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(duration: string): string {
  // Convert duration from formats like "24m", "1h 30m" to readable format
  if (!duration) return ""
  
  const match = duration.match(/(\d+)h?\s*(\d+)?m?/)
  if (match) {
    const hours = match[1] ? parseInt(match[1]) : 0
    const minutes = match[2] ? parseInt(match[2]) : 0
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${minutes}m`
    }
  }
  
  return duration
}

export function formatEpisodeCount(episodes: { sub?: number; dub?: number }): string {
  if (!episodes) return ""
  
  const { sub = 0, dub = 0 } = episodes
  const parts = []
  
  if (sub > 0) parts.push(`${sub} Sub`)
  if (dub > 0) parts.push(`${dub} Dub`)
  
  return parts.join(" • ")
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export function getImageUrl(url: string): string {
  // Handle relative URLs and ensure proper image loading
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `https://aniwatch-api-taupe-eight.vercel.app${url}`
}

// TV-specific utilities
export function focusElement(element: HTMLElement | null) {
  if (element) {
    element.focus()
    element.scrollIntoView({ behavior: "smooth", block: "center" })
  }
}

export function getNextFocusableElement(current: HTMLElement, direction: "up" | "down" | "left" | "right"): HTMLElement | null {
  const focusableElements = Array.from(
    document.querySelectorAll('[data-focusable="true"]:not([disabled])')
  ) as HTMLElement[]
  
  const currentIndex = focusableElements.indexOf(current)
  if (currentIndex === -1) return null
  
  const currentRect = current.getBoundingClientRect()
  
  switch (direction) {
    case "right":
      // Find next element in the same row or next focusable element
      for (let i = currentIndex + 1; i < focusableElements.length; i++) {
        const rect = focusableElements[i].getBoundingClientRect()
        if (Math.abs(rect.top - currentRect.top) < 50 && rect.left > currentRect.left) {
          return focusableElements[i]
        }
      }
      break
      
    case "left":
      // Find previous element in the same row
      for (let i = currentIndex - 1; i >= 0; i--) {
        const rect = focusableElements[i].getBoundingClientRect()
        if (Math.abs(rect.top - currentRect.top) < 50 && rect.left < currentRect.left) {
          return focusableElements[i]
        }
      }
      break
      
    case "down":
      // Find element below in the same column
      for (let i = currentIndex + 1; i < focusableElements.length; i++) {
        const rect = focusableElements[i].getBoundingClientRect()
        if (rect.top > currentRect.bottom && Math.abs(rect.left - currentRect.left) < 100) {
          return focusableElements[i]
        }
      }
      break
      
    case "up":
      // Find element above in the same column
      for (let i = currentIndex - 1; i >= 0; i--) {
        const rect = focusableElements[i].getBoundingClientRect()
        if (rect.bottom < currentRect.top && Math.abs(rect.left - currentRect.left) < 100) {
          return focusableElements[i]
        }
      }
      break
  }
  
  return null
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
