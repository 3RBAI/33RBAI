"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Menu,
  Brain,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
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

const models = [
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "qwen", name: "Qwen" },
  { id: "deepseek-v3", name: "DeepSeek V3" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { id: "wolf-ai", name: "WOLF-AI" },
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

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col h-full">
        {/* الهيدر المحسن */}
        <header
          className={`flex items-center justify-between p-4 bg-black/50 backdrop-blur-md border-b border-${theme.primary}-900/50`}
        >
          <div className="flex items-center gap-3">
            <Menu className={`h-5 w-5 text-${theme.accent}`} />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">WOLF-AI</span>
                <Badge className={`bg-${theme.secondary}/70 text-${theme.primary}-300`}>
                  {models[currentModelIndex].name}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">الخبير الكوني الشامل • تحليل فوري • بحث ويب</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* أزرار التحكم */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={saveCurrentSession}
            >
              <Save className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={exportChat}
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={() => switchModel(-1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-${theme.primary}-950/50`}
              onClick={() => switchModel(1)}
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
                  <Upload className="h-4 w-4 mr-2" />
                  استيراد
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* منطقة المحادثة */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 backdrop-blur-sm ${
                    message.role === "user"
                      ? `bg-${theme.primary}-950/70 text-white ml-4 border border-${theme.primary}-800/50`
                      : `bg-black/70 border border-${theme.primary}-900/50 text-gray-100 mr-4`
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>

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
        <div className={`p-4 bg-black/50 backdrop-blur-md border-t border-${theme.primary}-900/50`}>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 bg-${theme.primary}-950/30 hover:bg-${theme.primary}-950/50 text-${theme.primary}-400`}
              onClick={nextImage}
            >
              <Brain className="h-5 w-5" />
            </Button>

            <div
              className={`flex-1 flex items-center gap-2 bg-black/50 rounded-xl border border-${theme.primary}-900/30 px-4 py-2`}
            >
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا للحصول على تحليل فوري وبحث ويب..."
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
      </div>
    </div>
  )
}
