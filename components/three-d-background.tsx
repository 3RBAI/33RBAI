"use client"

import { useEffect, useRef } from "react"

export function ThreeDBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // تعيين حجم الكانفاس
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // متغيرات الرسوم المتحركة
    let animationId: number
    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
      color: string
      opacity: number
    }> = []

    // إنشاء الجسيمات
    const createParticles = () => {
      const colors = ["#7c3aed", "#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"]

      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          vz: (Math.random() - 0.5) * 3,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.8 + 0.2,
        })
      }
    }

    // رسم الشبكة ثلاثية الأبعاد
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(124, 58, 237, 0.1)"
      ctx.lineWidth = 1

      const gridSize = 50
      const perspective = 800

      // خطوط أفقية
      for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // خطوط عمودية مع منظور
      for (let i = 0; i < canvas.width; i += gridSize) {
        const depth = Math.sin(Date.now() * 0.001 + i * 0.01) * 100
        const x1 = i + (depth / perspective) * 50
        const x2 = i - (depth / perspective) * 50

        ctx.beginPath()
        ctx.moveTo(x1, 0)
        ctx.lineTo(x2, canvas.height)
        ctx.stroke()
      }
    }

    // رسم الجسيمات المتحركة
    const drawParticles = () => {
      particles.forEach((particle, index) => {
        // تحديث الموقع
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += particle.vz

        // إعادة تدوير الجسيمات
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        if (particle.z < 0 || particle.z > 1000) particle.vz *= -1

        // حساب المنظور
        const perspective = 800
        const scale = perspective / (perspective + particle.z)
        const x = particle.x * scale + (canvas.width * (1 - scale)) / 2
        const y = particle.y * scale + (canvas.height * (1 - scale)) / 2
        const size = particle.size * scale

        // رسم الجسيمة
        ctx.save()
        ctx.globalAlpha = particle.opacity * scale
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // إضافة توهج
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
        gradient.addColorStop(0, particle.color + "40")
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // رسم خطوط الاتصال
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const dz = particle.z - otherParticle.z
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

            if (distance < 150) {
              const otherScale = perspective / (perspective + otherParticle.z)
              const otherX = otherParticle.x * otherScale + (canvas.width * (1 - otherScale)) / 2
              const otherY = otherParticle.y * otherScale + (canvas.height * (1 - otherScale)) / 2

              ctx.save()
              ctx.globalAlpha = (1 - distance / 150) * 0.3 * Math.min(scale, otherScale)
              ctx.strokeStyle = particle.color
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(x, y)
              ctx.lineTo(otherX, otherY)
              ctx.stroke()
              ctx.restore()
            }
          }
        })
      })
    }

    // رسم موجات الطاقة
    const drawEnergyWaves = () => {
      const time = Date.now() * 0.002
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      for (let i = 0; i < 5; i++) {
        const radius = Math.sin(time + i) * 100 + 200 + i * 50
        const opacity = (Math.sin(time + i) + 1) * 0.1

        ctx.save()
        ctx.globalAlpha = opacity
        ctx.strokeStyle = "#7c3aed"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }

    // حلقة الرسوم المتحركة
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // رسم التدرج الخلفي
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#0f0f23")
      gradient.addColorStop(0.5, "#1a1a2e")
      gradient.addColorStop(1, "#16213e")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawGrid()
      drawEnergyWaves()
      drawParticles()

      animationId = requestAnimationFrame(animate)
    }

    createParticles()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)" }}
    />
  )
}
