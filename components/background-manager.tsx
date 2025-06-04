"use client"

import { useState, useEffect } from "react"

interface BackgroundManagerProps {
  images: string[]
  interval?: number
  className?: string
}

export function BackgroundManager({ images, interval = 10000, className = "" }: BackgroundManagerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Preload images
    const preloadImages = async () => {
      const promises = images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = resolve
          img.onerror = reject
          img.src = src
        })
      })

      try {
        await Promise.all(promises)
        setIsLoaded(true)
      } catch (error) {
        console.warn("Some images failed to preload:", error)
        setIsLoaded(true) // Continue anyway
      }
    }

    preloadImages()
  }, [images])

  useEffect(() => {
    if (!isLoaded) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval, isLoaded])

  if (!isLoaded) {
    return <div className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-black ${className}`} />
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-20" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${image})`,
            filter: "blur(1px) brightness(0.3)",
          }}
        />
      ))}
    </div>
  )
}
