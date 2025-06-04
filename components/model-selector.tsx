"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Star, Settings } from "lucide-react"

interface AIModel {
  id: string
  name: string
  description: string
  provider: string
  capabilities: string[]
  speed: "fast" | "medium" | "slow"
  quality: "high" | "medium" | "basic"
  maxTokens: number
  isActive: boolean
}

interface ModelSelectorProps {
  onModelChange: (modelId: string) => void
  currentModel: string
}

export function ModelSelector({ onModelChange, currentModel }: ModelSelectorProps) {
  const [models] = useState<AIModel[]>([
    {
      id: "groq-llama-70b",
      name: "Groq Llama 3.1 70B",
      description: "نموذج متقدم للمحادثات العامة والتحليل العميق",
      provider: "Groq",
      capabilities: ["محادثة", "تحليل", "برمجة", "كتابة"],
      speed: "fast",
      quality: "high",
      maxTokens: 8000,
      isActive: true,
    },
    {
      id: "gemini-pro",
      name: "Google Gemini Pro",
      description: "نموذج Google المتقدم للمهام المعقدة",
      provider: "Google",
      capabilities: ["تحليل", "إبداع", "بحث", "ترجمة"],
      speed: "medium",
      quality: "high",
      maxTokens: 4000,
      isActive: true,
    },
    {
      id: "deepseek-coder",
      name: "DeepSeek Coder",
      description: "متخصص في البرمجة والتطوير التقني",
      provider: "DeepSeek",
      capabilities: ["برمجة", "تطوير", "مراجعة كود", "تصحيح"],
      speed: "fast",
      quality: "high",
      maxTokens: 6000,
      isActive: true,
    },
    {
      id: "3rb-custom",
      name: "3RB Custom Model",
      description: "نموذج مخصص محسن للثقافة العربية",
      provider: "3RB AI",
      capabilities: ["عربي", "ثقافة", "تاريخ", "أدب"],
      speed: "medium",
      quality: "high",
      maxTokens: 5000,
      isActive: true,
    },
  ])

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "fast":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "slow":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "high":
        return "text-purple-600 bg-purple-100"
      case "medium":
        return "text-blue-600 bg-blue-100"
      case "basic":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Card className="bg-black/20 backdrop-blur-md border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Brain className="w-5 h-5 mr-2" />
          اختيار النموذج
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models
            .filter((model) => model.isActive)
            .map((model) => (
              <div
                key={model.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentModel === model.id
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-gray-600 bg-gray-800/50 hover:border-purple-400"
                }`}
                onClick={() => onModelChange(model.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{model.name}</h4>
                    <p className="text-sm text-gray-400">{model.provider}</p>
                  </div>
                  {currentModel === model.id && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                </div>

                <p className="text-sm text-gray-300 mb-3">{model.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {model.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {capability}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Badge className={getSpeedColor(model.speed)}>
                      <Zap className="w-3 h-3 mr-1" />
                      {model.speed === "fast" ? "سريع" : model.speed === "medium" ? "متوسط" : "بطيء"}
                    </Badge>
                    <Badge className={getQualityColor(model.quality)}>
                      <Settings className="w-3 h-3 mr-1" />
                      {model.quality === "high" ? "عالي" : model.quality === "medium" ? "متوسط" : "أساسي"}
                    </Badge>
                  </div>
                  <span className="text-gray-500">{model.maxTokens.toLocaleString()} رمز</span>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
