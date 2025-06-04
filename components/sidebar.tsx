"use client"
import {
  MessageSquare,
  Upload,
  Settings,
  User,
  Github,
  Brain,
  ChevronLeft,
  ChevronRight,
  History,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentView: string
  onViewChange: (view: string) => void
  user?: any
}

export function Sidebar({ isOpen, onToggle, currentView, onViewChange, user }: SidebarProps) {
  const menuItems = [
    {
      id: "chat",
      label: "المحادثة",
      icon: MessageSquare,
      description: "دردشة مع 3RB AI",
    },
    {
      id: "files",
      label: "الملفات",
      icon: Upload,
      description: "رفع وتحليل الملفات",
    },
    {
      id: "models",
      label: "النماذج",
      icon: Brain,
      description: "اختيار نموذج الذكاء الاصطناعي",
    },
    {
      id: "history",
      label: "السجل",
      icon: History,
      description: "تاريخ المحادثات",
      requiresAuth: true,
    },
    {
      id: "analytics",
      label: "الإحصائيات",
      icon: BarChart3,
      description: "تحليل الاستخدام",
      requiresAuth: true,
    },
    {
      id: "github",
      label: "GitHub",
      icon: Github,
      description: "تكامل GitHub",
      requiresAuth: true,
    },
    {
      id: "profile",
      label: "الملف الشخصي",
      icon: User,
      description: "إعدادات الحساب",
      requiresAuth: true,
    },
    {
      id: "settings",
      label: "الإعدادات",
      icon: Settings,
      description: "إعدادات التطبيق",
    },
  ]

  return (
    <>
      {/* زر التبديل */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 bg-black/20 backdrop-blur-md border-purple-500/30 text-white hover:bg-purple-500/20"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      {/* الخلفية المظلمة للموبايل */}
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onToggle} />}

      {/* الشريط الجانبي */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-black/30 backdrop-blur-md border-r border-purple-500/30 z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* الشعار */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">3RB AI</h2>
                <p className="text-sm text-gray-300">سلطنة عمان</p>
              </div>
            </div>
          </div>

          {/* معلومات المستخدم */}
          {user && (
            <Card className="mb-6 bg-purple-500/20 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{user.name}</p>
                    <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                      متصل
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* قائمة التنقل */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              const isDisabled = item.requiresAuth && !user

              return (
                <Button
                  key={item.id}
                  onClick={() => !isDisabled && onViewChange(item.id)}
                  disabled={isDisabled}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-left p-3 h-auto ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : isDisabled
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-300 hover:text-white hover:bg-purple-500/20"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex-1 text-right">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                  {item.requiresAuth && !user && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-500">
                      تسجيل مطلوب
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>

          {/* معلومات إضافية */}
          <div className="mt-8 pt-6 border-t border-gray-600">
            <div className="text-center text-xs text-gray-400">
              <p>3RB AI Platform</p>
              <p>الإصدار 2.0</p>
              <p className="mt-2">© 2024 سلطنة عمان</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
