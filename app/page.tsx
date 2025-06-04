"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ThreeDBackground } from "@/components/three-d-background"
import { ChatInterface } from "@/components/chat-interface"
import { UserDashboard } from "@/components/user-dashboard"
import { Sidebar } from "@/components/sidebar"
import { AuthService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Sparkles, Zap, Shield, Github, Mail } from "lucide-react"

interface UserData {
  id: string
  email: string
  name: string
  avatar?: string
  provider: "email" | "github"
  verified: boolean
  createdAt: string
  lastLogin: string
}

export default function ThreeRBAI() {
  const [user, setUser] = useState<UserData | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState("chat")

  const authService = new AuthService()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (error) {
      console.error("خطأ في التحقق من حالة المصادقة:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthRequired = () => {
    setShowAuth(true)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setShowDashboard(false)
      setShowAuth(false)
      setCurrentView("chat")
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error)
    }
  }

  const handleViewChange = (view: string) => {
    if (view === "profile" && user) {
      setShowDashboard(true)
      setSidebarOpen(false)
    } else {
      setCurrentView(view)
      setShowDashboard(false)
      setSidebarOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ThreeDBackground />
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">جاري تحميل 3RB AI...</p>
        </div>
      </div>
    )
  }

  if (showDashboard && user) {
    return (
      <>
        <ThreeDBackground />
        <UserDashboard user={user} onLogout={handleLogout} />
      </>
    )
  }

  if (showAuth) {
    return (
      <>
        <ThreeDBackground />
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(userData) => {
            setUser(userData)
            setShowAuth(false)
          }}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen relative">
      <ThreeDBackground />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentView={currentView}
        onViewChange={handleViewChange}
        user={user}
      />

      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        {user ? (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-black/20 backdrop-blur-md border-red-500/30 text-white hover:bg-red-500/20"
            >
              تسجيل الخروج
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowAuth(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            تسجيل الدخول
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className={`relative z-10 transition-all duration-300 ${sidebarOpen ? "mr-80" : "mr-0"}`}>
        <ChatInterface user={user} onAuthRequired={handleAuthRequired} currentView={currentView} />
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="text-center text-white/60 text-xs">
          <p>© 2024 3RB AI - وكيل الذكاء الاصطناعي العام | سلطنة عمان</p>
          <p className="mt-1">مطور بأحدث تقنيات الذكاء الاصطناعي العالمية</p>
        </div>
      </div>
    </div>
  )
}

// مكون نافذة المصادقة
function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (user: UserData) => void
}) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const authService = new AuthService()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let userData: UserData

      if (isLogin) {
        userData = await authService.login(email, password)
      } else {
        userData = await authService.signup(name, email, password)
      }

      onSuccess(userData)
    } catch (error) {
      console.error("خطأ في المصادقة:", error)
      alert("خطأ في المصادقة. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <Card className="relative w-full max-w-md bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-white">{isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}</CardTitle>
          <CardDescription className="text-gray-300">احصل على ميزات متقدمة مع 3RB AI</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? "جاري المعالجة..." : isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-purple-400 hover:text-purple-300 text-sm">
              {isLogin ? "ليس لديك حساب؟ أنشئ حساباً جديداً" : "لديك حساب؟ سجل دخولك"}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-600">
            <p className="text-xs text-gray-400 text-center mb-3">الميزات المتقدمة:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                حفظ آمن
              </div>
              <div className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                إجابات متقدمة
              </div>
              <div className="flex items-center">
                <Github className="w-3 h-3 mr-1" />
                تكامل GitHub
              </div>
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                تنبيهات ذكية
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
