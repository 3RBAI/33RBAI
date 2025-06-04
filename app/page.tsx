"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Menu,
  ArrowLeft,
  ArrowRight,
  Save,
  Download,
  Upload,
  Maximize,
  Minimize,
  BarChart3,
  Globe,
  Settings,
  X,
  UserIcon,
  BotIcon,
  SparklesIcon,
  MessageSquareIcon,
  FileTextIcon,
  HistoryIcon,
  LogOutIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  analysis?: string
  webResults?: string[]
  dataInsights?: any
}

interface ChatSession {
  id: string
  name: string
  messages: Message[]
  timestamp: Date
}

interface AppUser {
  id: string
  name: string
  email: string
  avatar?: string
  isPremium: boolean
}

const models = [
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", icon: "🧠", color: "blue" },
  { id: "qwen", name: "Qwen", icon: "🌐", color: "green" },
  { id: "deepseek-v3", name: "DeepSeek V3", icon: "🔍", color: "purple" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", icon: "💎", color: "teal" },
  { id: "wolf-ai", name: "WOLF-AI", icon: "🐺", color: "red" },
]

// الصور بجودة 4K محسنة
const characterImages = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40478.jpg-UFHxMja9MPeIlDHFQPsnRiz5a4ORek.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40486.jpg-MnzCUIJEqdEh2nfPPpeay5BKEBcIll.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40489.jpg-Xn9XGDmXTudhCxgaF15kp9x8AET5ZF.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40488.jpg-dGGWsLm0Wu1mFc0C8XvNISRVmuhOVq.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40490.jpg-KpPlGWJWqB4PLoFtH9g6hSPjUHkIWN.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40475.jpg-YomxN4u6DAgxjeuLxSUdJhQEWye2GU.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40468.jpg-YKiMvNFpncETHNscOfGaj3jwnRt5NI.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40477.jpg-G22pE6D2jAMs4IdLjQ0o0dahTeIBCZ.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40470.jpg-TWHMY0aw37PIBMUpIqbs6vXo68VwWF.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40474.jpg-2TqaaGgTB8NQ1XoZ1HEw98Ag9vmnLv.jpeg",
]

const colorThemes = {
  red: { primary: "red", secondary: "red-900", accent: "red-500" },
  blue: { primary: "blue", secondary: "blue-900", accent: "blue-500" },
  green: { primary: "green", secondary: "green-900", accent: "green-500" },
  purple: { primary: "purple", secondary: "purple-900", accent: "purple-500" },
  orange: { primary: "orange", secondary: "orange-900", accent: "orange-500" },
}

export default function WolfAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "مرحباً! أنا WOLF-AI، الخبير الكوني الشامل مع قدرات التحليل الفوري والبحث الويب. كيف يمكنني مساعدتك اليوم؟",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentModelIndex, setCurrentModelIndex] = useState(4)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("red")
  const [imageOpacity, setImageOpacity] = useState(50)
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const theme = colorThemes[currentTheme as keyof typeof colorThemes]

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        })
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % characterImages.length)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // محاكاة البحث الويب
  const simulateWebSearch = async (query: string) => {
    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSearching(false)
    return [
      `نتيجة بحث 1: معلومات حول "${query}"`,
      `نتيجة بحث 2: مصادر إضافية عن "${query}"`,
      `نتيجة بحث 3: تحليل متقدم لـ "${query}"`,
    ]
  }

  // محاكاة تحليل البيانات
  const simulateDataAnalysis = async (data: string) => {
    setIsAnalyzing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsAnalyzing(false)
    return {
      sentiment: Math.random() > 0.5 ? "إيجابي" : "محايد",
      keywords: ["تحليل", "بيانات", "ذكاء اصطناعي"],
      confidence: Math.floor(Math.random() * 30) + 70,
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsTyping(true)

    setCurrentImageIndex((prev) => (prev + 1) % characterImages.length)

    // تحليل فوري
    const webResults = await simulateWebSearch(currentInput)
    const dataAnalysis = await simulateDataAnalysis(currentInput)

    setTimeout(() => {
      const currentModel = models[currentModelIndex]
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `تحليل شامل من ${currentModel.name}:

📊 **التحليل الفوري:**
- المشاعر: ${dataAnalysis.sentiment}
- الثقة: ${dataAnalysis.confidence}%
- الكلمات المفتاحية: ${dataAnalysis.keywords.join(", ")}

🌐 **نتائج البحث الويب:**
${webResults.map((result, i) => `${i + 1}. ${result}`).join("\n")}

💡 **الاستنتاج:**
بناءً على التحليل الفوري والبحث الويب، يمكنني تقديم إجابة شاملة حول "${currentInput}".

هل تريد تحليلاً أعمق أو معلومات إضافية؟`,
        role: "assistant",
        timestamp: new Date(),
        analysis: `تحليل البيانات: ${JSON.stringify(dataAnalysis)}`,
        webResults: webResults,
        dataInsights: dataAnalysis,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 3000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const switchModel = (direction: number) => {
    setCurrentModelIndex((prev) => {
      const newIndex = (prev + direction + models.length) % models.length
      return newIndex
    })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % characterImages.length)
  }

  const saveCurrentSession = () => {
    const session: ChatSession = {
      id: Date.now().toString(),
      name: `محادثة ${new Date().toLocaleDateString("ar-SA")}`,
      messages: messages,
      timestamp: new Date(),
    }
    setSavedSessions((prev) => [...prev, session])

    // حفظ في localStorage
    const allSessions = [...savedSessions, session]
    localStorage.setItem("wolfai-sessions", JSON.stringify(allSessions))
  }

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages)
    setSidebarOpen(false)
  }

  const exportChat = () => {
    const chatData = {
      messages,
      timestamp: new Date(),
      model: models[currentModelIndex].name,
    }
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wolf-ai-chat-${Date.now()}.json`
    a.click()
  }

  const importChat = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const chatData = JSON.parse(e.target?.result as string)
          setMessages(chatData.messages || [])
        } catch (error) {
          console.error("خطأ في تحميل الملف:", error)
        }
      }
      reader.readAsText(file)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleLogin = () => {
    // محاكاة تسجيل الدخول
    setAppUser({
      id: "user1",
      name: "مستخدم WOLF-AI",
      email: "user@wolf-ai.com",
      isPremium: true,
    })
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    setAppUser(null)
  }

  const formatMessageContent = (content: string) => {
    // تحويل Markdown إلى JSX
    const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`|#{1,6}\s[^\n]+)/g)

    return parts.map((part, index) => {
      // العناوين
      if (part.match(/^#{1,6}\s/)) {
        const level = part.match(/^#{1,6}/)?.[0].length || 1
        const text = part.replace(/^#{1,6}\s/, "")
        const className =
          level === 1
            ? "text-xl font-bold text-white mb-3 mt-4"
            : level === 2
              ? "text-lg font-bold text-gray-200 mb-2 mt-3"
              : "text-base font-semibold text-gray-300 mb-2 mt-2"
        return (
          <div key={index} className={className}>
            {text}
          </div>
        )
      }

      // النص المميز
      if (part.match(/^\*\*[^*]+\*\*$/)) {
        const text = part.replace(/\*\*/g, "")
        return (
          <span key={index} className="font-bold text-white">
            {text}
          </span>
        )
      }

      // الكود
      if (part.match(/^`[^`]+`$/)) {
        const text = part.replace(/`/g, "")
        return (
          <code key={index} className="bg-gray-800 px-2 py-1 rounded text-green-300 font-mono text-sm">
            {text}
          </code>
        )
      }

      // النص العادي
      return part.split("\n").map((line, lineIndex) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < part.split("\n").length - 1 && <br />}
        </span>
      ))
    })
  }

  return (
    <div
      className={`flex flex-col h-screen bg-black text-white overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      {/* الصورة الخلفية بجودة 4K */}
      <div className="fixed inset-0 bg-black">
        <div className={`absolute inset-0 bg-gradient-to-br from-${theme.primary}-950/70 to-black/95`} />
      </div>

      {/* الصورة الرئيسية بجودة عالية */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-full h-full max-w-4xl overflow-hidden">
          <Image
            src={characterImages[currentImageIndex] || "/placeholder.svg"}
            alt="Wolf AI Character"
            fill
            className="object-contain transition-opacity duration-1000"
            style={{ opacity: imageOpacity / 100 }}
            quality={100}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        </div>
      </div>

      {/* القائمة الجانبية */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-black/80 backdrop-blur-md z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } border-l border-${theme.primary}-900/50`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-${theme.primary}-600 flex items-center justify-center`}>
                <BotIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">WOLF-AI</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* معلومات المستخدم */}
          <div className="p-4 border-b border-gray-800">
            {appUser ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{appUser.name}</p>
                  <p className="text-xs text-gray-400">{appUser.email}</p>
                </div>
              </div>
            ) : (
              <Button
                className={`w-full bg-${theme.primary}-600 hover:bg-${theme.primary}-700 text-white`}
                onClick={() => setShowLoginModal(true)}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                تسجيل الدخول
              </Button>
            )}
          </div>

          {/* القائمة الرئيسية */}
          <div className="flex-1 overflow-auto p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start text-right ${
                  activeTab === "chat" ? `bg-${theme.primary}-900/50 text-white` : "text-gray-400"
                }`}
                onClick={() => {
                  setActiveTab("chat")
                  setSidebarOpen(false)
                }}
              >
                <MessageSquareIcon className="w-4 h-4 ml-2" />
                المحادثة
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start text-right ${
                  activeTab === "files" ? `bg-${theme.primary}-900/50 text-white` : "text-gray-400"
                }`}
                onClick={() => setActiveTab("files")}
              >
                <FileTextIcon className="w-4 h-4 ml-2" />
                الملفات
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start text-right ${
                  activeTab === "history" ? `bg-${theme.primary}-900/50 text-white` : "text-gray-400"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <HistoryIcon className="w-4 h-4 ml-2" />
                السجل
              </Button>
            </div>

            {/* المحادثات المحفوظة */}
            {savedSessions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2 px-2">المحادثات المحفوظة</h3>
                <div className="space-y-1">
                  {savedSessions.map((session) => (
                    <Button
                      key={session.id}
                      variant="ghost"
                      className="w-full justify-start text-right text-gray-400 hover:text-white"
                      onClick={() => loadSession(session)}
                    >
                      <MessageSquareIcon className="w-4 h-4 ml-2" />
                      {session.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* أزرار التحكم السفلية */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className={`justify-start text-right border-${theme.primary}-800 text-gray-300`}
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 ml-2" />
                الإعدادات
              </Button>

              {appUser && (
                <Button
                  variant="outline"
                  className="justify-start text-right border-red-800 text-red-300 hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col h-full">
        {/* الهيدر المحسن */}
        <header
          className={`flex items-center justify-between p-3 md:p-4 bg-black/50 backdrop-blur-md border-b border-${theme.primary}-900/50`}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 text-${theme.accent} hover:bg-${theme.primary}-950/50`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base md:text-lg text-white">WOLF-AI</span>
                <Badge className={`bg-${theme.secondary}/70 text-${theme.primary}-300 text-xs`}>
                  {models[currentModelIndex].name}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 hidden md:block">الخبير الكوني الشامل • تحليل فوري • بحث ويب</p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* أزرار التحكم */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={saveCurrentSession}
              title="حفظ المحادثة"
            >
              <Save className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={exportChat}
              title="تصدير المحادثة"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={toggleFullscreen}
              title="ملء الشاشة"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={() => switchModel(-1)}
              title="النموذج السابق"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={() => switchModel(1)}
              title="النموذج التالي"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* لوحة الإعدادات */}
        {showSettings && (
          <div className={`p-4 bg-black/70 backdrop-blur-md border-b border-${theme.primary}-900/50`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">لون الواجهة</label>
                <Select value={currentTheme} onValueChange={setCurrentTheme}>
                  <SelectTrigger className={`bg-${theme.secondary}/30 border-${theme.primary}-700/50`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red">أحمر</SelectItem>
                    <SelectItem value="blue">أزرق</SelectItem>
                    <SelectItem value="green">أخضر</SelectItem>
                    <SelectItem value="purple">بنفسجي</SelectItem>
                    <SelectItem value="orange">برتقالي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">شفافية الصورة: {imageOpacity}%</label>
                <Slider
                  value={[imageOpacity]}
                  onValueChange={(value) => setImageOpacity(value[0])}
                  max={100}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">استيراد محادثة</label>
                <input ref={fileInputRef} type="file" accept=".json" onChange={importChat} className="hidden" />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full bg-${theme.secondary}/30 hover:bg-${theme.secondary}/50`}
                >
                  <Upload className="h-4 w-4 ml-2" />
                  استيراد
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* منطقة المحادثة */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsContent
            value="chat"
            className="flex-1 flex flex-col data-[state=active]:flex data-[state=inactive]:hidden"
          >
            <ScrollArea ref={scrollAreaRef} className="flex-1">
              <div className="p-3 md:p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[90%] md:max-w-[85%] rounded-xl px-3 py-2 md:px-4 md:py-3 backdrop-blur-sm ${
                        message.role === "user"
                          ? `bg-${theme.primary}-950/70 text-white ml-2 md:ml-4 border border-${theme.primary}-800/50`
                          : `bg-black/70 border border-${theme.primary}-900/50 text-gray-100 mr-2 md:mr-4`
                      }`}
                    >
                      <div className="text-sm whitespace-pre-line">{formatMessageContent(message.content)}</div>

                      {/* عرض التحليل والبيانات */}
                      {message.analysis && (
                        <div
                          className={`mt-3 p-2 bg-${theme.secondary}/20 rounded-lg border border-${theme.primary}-800/30`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="text-xs font-medium">تحليل البيانات</span>
                          </div>
                          <p className="text-xs text-gray-300">{message.analysis}</p>
                        </div>
                      )}

                      {message.webResults && (
                        <div
                          className={`mt-3 p-2 bg-${theme.secondary}/20 rounded-lg border border-${theme.primary}-800/30`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4" />
                            <span className="text-xs font-medium">نتائج البحث</span>
                          </div>
                          <div className="space-y-1">
                            {message.webResults.map((result, i) => (
                              <p key={i} className="text-xs text-gray-300">
                                • {result}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.role === "assistant" && (
                          <Badge className={`bg-${theme.secondary}/50 text-${theme.primary}-300 text-xs`}>
                            {models[currentModelIndex].name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* مؤشرات التحميل */}
                {(isTyping || isAnalyzing || isSearching) && (
                  <div className="flex justify-start">
                    <div
                      className={`bg-black/70 border border-${theme.primary}-900/50 text-gray-100 rounded-xl px-4 py-3 mr-4`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className={`w-2 h-2 bg-${theme.accent} rounded-full animate-bounce`}></div>
                          <div
                            className={`w-2 h-2 bg-${theme.accent} rounded-full animate-bounce`}
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className={`w-2 h-2 bg-${theme.accent} rounded-full animate-bounce`}
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {isSearching ? "يبحث في الويب..." : isAnalyzing ? "يحلل البيانات..." : "يكتب..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* منطقة الإدخال المحسنة */}
            <div className={`p-3 md:p-4 bg-black/50 backdrop-blur-md border-t border-${theme.primary}-900/50`}>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 bg-${theme.primary}-950/30 hover:bg-${theme.primary}-950/50 text-${theme.primary}-400`}
                  onClick={nextImage}
                >
                  <BotIcon className="h-5 w-5" />
                </Button>

                <div
                  className={`flex-1 flex items-center gap-2 bg-black/50 rounded-xl border border-${theme.primary}-900/30 px-3 py-2`}
                >
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                    dir="rtl"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    size="icon"
                    className={`h-8 w-8 bg-${theme.primary}-900/70 hover:bg-${theme.primary}-800 text-white rounded-lg flex-shrink-0`}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="flex-1 p-4 data-[state=active]:flex data-[state=inactive]:hidden">
            <div className="flex flex-col h-full items-center justify-center">
              <div className="text-center">
                <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold mb-4">إدارة الملفات</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  قم برفع وتحليل الملفات للحصول على رؤى متعمقة. يدعم النظام مختلف أنواع الملفات.
                </p>
                <Button
                  className={`bg-${theme.primary}-600 hover:bg-${theme.primary}-700 text-white`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 ml-2" />
                  رفع ملف
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 p-4 data-[state=active]:flex data-[state=inactive]:hidden">
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-bold mb-4">سجل المحادثات</h2>

              {savedSessions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium mb-2">لا توجد محادثات محفوظة</h3>
                    <p className="text-gray-400 mb-6">احفظ محادثاتك للرجوع إليها لاحقاً</p>
                    <Button
                      className={`bg-${theme.primary}-600 hover:bg-${theme.primary}-700 text-white`}
                      onClick={saveCurrentSession}
                    >
                      <Save className="w-4 h-4 ml-2" />
                      حفظ المحادثة الحالية
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedSessions.map((session) => (
                    <Card
                      key={session.id}
                      className={`bg-${theme.primary}-950/30 border-${theme.primary}-900/50 hover:border-${theme.primary}-700/50 cursor-pointer transition-colors`}
                      onClick={() => loadSession(session)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{session.name}</h3>
                          <Badge className={`bg-${theme.secondary}/50 text-${theme.primary}-300 text-xs`}>
                            {session.messages.length} رسائل
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(session.timestamp).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* نافذة تسجيل الدخول */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-md bg-black/90 border-${theme.primary}-900/50`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">تسجيل الدخول</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowLoginModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    className={`bg-gray-900/50 border-${theme.primary}-900/50`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    className={`bg-gray-900/50 border-${theme.primary}-900/50`}
                  />
                </div>

                <Button
                  className={`w-full bg-${theme.primary}-600 hover:bg-${theme.primary}-700 text-white`}
                  onClick={handleLogin}
                >
                  <UserIcon className="w-4 h-4 ml-2" />
                  تسجيل الدخول
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    ليس لديك حساب؟{" "}
                    <button className={`text-${theme.primary}-400 hover:underline`}>إنشاء حساب جديد</button>
                  </p>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-black px-2 text-gray-400">أو</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className={`w-full border-${theme.primary}-900/50 hover:bg-${theme.primary}-950/30`}
                  onClick={handleLogin}
                >
                  <SparklesIcon className="w-4 h-4 ml-2" />
                  تسجيل الدخول كضيف
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
