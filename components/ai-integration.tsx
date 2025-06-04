"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Cpu, Database, Globe, Code, Zap } from "lucide-react"

interface AICapability {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: "active" | "processing" | "idle"
  accuracy: number
}

export function AIIntegration() {
  const [capabilities] = useState<AICapability[]>([
    {
      id: "thinking",
      name: "التفكير العميق",
      description: "تحليل فلسفي ومنطقي متقدم",
      icon: <Brain className="w-5 h-5" />,
      status: "active",
      accuracy: 95,
    },
    {
      id: "web-search",
      name: "البحث الويب",
      description: "الوصول للمعلومات العالمية",
      icon: <Globe className="w-5 h-5" />,
      status: "active",
      accuracy: 92,
    },
    {
      id: "coding",
      name: "البرمجة المتقدمة",
      description: "تطوير الكود باستخدام Pointer CLI",
      icon: <Code className="w-5 h-5" />,
      status: "active",
      accuracy: 98,
    },
    {
      id: "data-analysis",
      name: "تحليل البيانات",
      description: "معالجة وتحليل البيانات المعقدة",
      icon: <Database className="w-5 h-5" />,
      status: "processing",
      accuracy: 94,
    },
    {
      id: "neural-processing",
      name: "المعالجة العصبية",
      description: "شبكات عصبية متقدمة",
      icon: <Cpu className="w-5 h-5" />,
      status: "active",
      accuracy: 96,
    },
    {
      id: "real-time",
      name: "التحليل الفوري",
      description: "معالجة في الوقت الفعلي",
      icon: <Zap className="w-5 h-5" />,
      status: "active",
      accuracy: 93,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "processing":
        return "bg-yellow-500"
      case "idle":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط"
      case "processing":
        return "معالجة"
      case "idle":
        return "خامل"
      default:
        return "غير معروف"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {capabilities.map((capability) => (
        <Card key={capability.id} className="bg-black/20 backdrop-blur-md border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-600/20 rounded-lg">{capability.icon}</div>
                <CardTitle className="text-sm text-white">{capability.name}</CardTitle>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(capability.status)} animate-pulse`}></div>
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                  {getStatusText(capability.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-gray-400 mb-3">{capability.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">الدقة</span>
                <span className="text-white">{capability.accuracy}%</span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${capability.accuracy}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
