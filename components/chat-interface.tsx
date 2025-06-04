"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, User, Bot, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileUpload } from "@/components/ui/file-upload"
import { ModelSelector } from "@/components/model-selector"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  thinking?: string
  model?: string
}

interface ChatInterfaceProps {
  user?: {
    id: string
    name: string
    email: string
    verified: boolean
  } | null
  onAuthRequired: () => void
  currentView: string
}

export function ChatInterface({ user, onAuthRequired, currentView }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `مرحباً! أنا **3RB**، وكيل الذكاء الاصطناعي العام من سلطنة عمان.

**🎯 كيف يمكنني مساعدتك اليوم؟**

• طرح الأسئلة والحصول على إجابات مفصلة
• تحليل الملفات والوثائق  
• المساعدة في البرمجة والتطوير
• الكتابة والإبداع
• حل المشكلات المعقدة

${user ? `**أهلاً بك ${user.name}!** 🌟` : "**💡 نصيحة:** سجل حسابك للحصول على ميزات متقدمة"}`,
      sender: "ai",
      timestamp: new Date(),
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentModel, setCurrentModel] = useState("groq-llama-70b")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id,
          model: currentModel,
          context: messages
            .slice(-3)
            .map((m) => `${m.sender}: ${m.content}`)
            .join("\n"),
        }),
      })

      if (response.ok) {
        const data = await response.json()

        return {
          id: Date.now().toString(),
          content: formatAIResponse(data.response),
          sender: "ai",
          timestamp: new Date(),
          thinking: data.thinking,
          model: data.model,
        }
      } else {
        throw new Error("فشل في الحصول على الإجابة")
      }
    } catch (error) {
      console.error("❌ خطأ في توليد الرد:", error)

      return {
        id: Date.now().toString(),
        content: "**⚠️ عذراً، أواجه مشكلة تقنية حالياً**\n\nيرجى المحاولة مرة أخرى خلال لحظات.",
        sender: "ai",
        timestamp: new Date(),
      }
    }
  }

  const formatAIResponse = (content: string): string => {
    // تحسين تنسيق الإجابة
    let formatted = content

    // إضافة مسافات حول العناوين
    formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, "\n$1 $2\n")

    // إضافة مسافات حول القوائم
    formatted = formatted.replace(/^([•\-*])\s*(.+)$/gm, "\n$1 $2")

    // إضافة مسافات حول الأرقام
    formatted = formatted.replace(/^(\d+\.)\s*(.+)$/gm, "\n$1 $2")

    // تحسين المسافات حول الأقسام
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "\n\n**$1**\n")

    // إزالة المسافات الزائدة
    formatted = formatted.replace(/\n{3,}/g, "\n\n")

    return formatted.trim()
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(inputValue)
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("خطأ في توليد الرد:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "**❌ خطأ في النظام**\n\nعذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    if (!user) {
      onAuthRequired()
      return
    }
    setIsListening(!isListening)
  }

  const handleFileAnalyzed = (analysis: string) => {
    const fileMessage: Message = {
      id: Date.now().toString(),
      content: analysis,
      sender: "ai",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, fileMessage])
  }

  const formatMessage = (content: string) => {
    // تحويل Markdown إلى JSX
    const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`|#{1,6}\s[^\n]+)/g)

    return parts.map((part, index) => {
      // العناوين
      if (part.match(/^#{1,6}\s/)) {
        const level = part.match(/^#{1,6}/)?.[0].length || 1
        const text = part.replace(/^#{1,6}\s/, "")
        const className =
          level === 1
            ? "text-xl font-bold text-purple-300 mb-3 mt-4"
            : level === 2
              ? "text-lg font-bold text-blue-300 mb-2 mt-3"
              : "text-base font-semibold text-green-300 mb-2 mt-2"
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
          <span key={index} className="font-bold text-yellow-300">
            {text}
          </span>
        )
      }

      // الكود
      if (part.match(/^`[^`]+`$/)) {
        const text = part.replace(/`/g, "")
        return (
          <code key={index} className="bg-gray-700 px-2 py-1 rounded text-green-300 font-mono text-sm">
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

  // عرض المكونات حسب العرض الحالي
  if (currentView === "files") {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-black/20 backdrop-blur-md border-purple-500/30 mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📁 إدارة الملفات</h2>
            <p className="text-gray-300 mb-6">
              ارفع ملفاتك للتحليل والمعالجة. يدعم النظام جميع أنواع الملفات مع تحليل ذكي متقدم.
            </p>
            <FileUpload onFileAnalyzed={handleFileAnalyzed} maxSize={100} />
          </CardContent>
        </Card>

        {/* عرض رسائل التحليل */}
        {messages.filter((m) => m.content.includes("📁")).length > 0 && (
          <Card className="bg-black/20 backdrop-blur-md border-purple-500/30">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">📊 نتائج التحليل</h3>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {messages
                    .filter((m) => m.content.includes("📁"))
                    .map((message) => (
                      <div key={message.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="whitespace-pre-line text-gray-100">{formatMessage(message.content)}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString("ar-SA")}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (currentView === "models") {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <ModelSelector currentModel={currentModel} onModelChange={setCurrentModel} />
      </div>
    )
  }

  // العرض الافتراضي - المحادثة
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card className="mb-4 bg-black/20 backdrop-blur-md border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">3RB AI Assistant</h1>
                <p className="text-sm text-gray-300">وكيل الذكاء الاصطناعي العام - سلطنة عمان</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {user ? (
                <Badge variant="default" className="bg-green-600">
                  <User className="w-3 h-3 mr-1" />
                  {user.name}
                </Badge>
              ) : (
                <Button
                  onClick={onAuthRequired}
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                >
                  <Star className="w-4 h-4 mr-1" />
                  ميزات إضافية
                </Button>
              )}

              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">متصل</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 bg-black/20 backdrop-blur-md border-purple-500/30 mb-4">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${message.sender === "user" ? "order-2" : "order-1"}`}>
                  <div
                    className={`p-6 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-gray-800/80 text-gray-100 border border-gray-700"
                    }`}
                  >
                    {message.thinking && (
                      <details className="mb-4 text-xs opacity-70">
                        <summary className="cursor-pointer text-purple-300 font-medium">🧠 عملية التفكير</summary>
                        <div className="mt-3 p-3 bg-black/30 rounded text-purple-200 whitespace-pre-line">
                          {message.thinking}
                        </div>
                      </details>
                    )}

                    <div className="whitespace-pre-line leading-relaxed">{formatMessage(message.content)}</div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-600/30">
                      <div className="text-xs opacity-60">{message.timestamp.toLocaleTimeString("ar-SA")}</div>
                      {message.model && <div className="text-xs opacity-60">{message.model}</div>}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.sender === "user" ? "order-1 ml-3 bg-purple-600" : "order-2 mr-3 bg-gray-700"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-gray-300">3RB يفكر ويحلل...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </Card>

      {/* Input Area */}
      <Card className="bg-black/20 backdrop-blur-md border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 pr-12 h-12"
                disabled={isLoading}
              />

              {!user && inputValue.length > 100 && (
                <div className="absolute -top-14 left-0 right-0 bg-yellow-600/90 text-white text-xs p-3 rounded-lg">
                  💡 سجل حسابك للحصول على إجابات أطول وميزات متقدمة
                </div>
              )}
            </div>

            <Button
              onClick={toggleVoiceInput}
              variant="outline"
              size="icon"
              className={`border-gray-600 h-12 w-12 ${isListening ? "bg-red-600 text-white" : "text-gray-300"}`}
              title={user ? "التعرف على الصوت" : "سجل للحصول على هذه الميزة"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {!user && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 mb-2">🎯 ميزات إضافية للمستخدمين المسجلين:</p>
              <div className="flex justify-center space-x-6 text-xs text-gray-500">
                <span>💾 حفظ المحادثات</span>
                <span>🎤 التعرف على الصوت</span>
                <span>📊 تحليل متقدم</span>
                <span>⚡ إجابات أطول</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
