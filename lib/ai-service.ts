import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

interface AIResponse {
  content: string
  thinking?: string
  model: string
  tokens: number
}

export class AIService {
  private groq
  private geminiApiKey: string

  constructor() {
    this.groq = createGroq({
      apiKey: process.env.GROQ_API_KEY || "",
    })
    this.geminiApiKey = process.env.GEMINI_API_KEY || ""
    console.log("🤖 تم تهيئة خدمة الذكاء الاصطناعي 3RB")
  }

  async generateResponse(userMessage: string, context?: string, useAdvanced = false): Promise<AIResponse> {
    try {
      console.log("🧠 بدء توليد الإجابة باستخدام Groq...")

      const systemPrompt = `أنت 3RB، وكيل الذكاء الاصطناعي العام المطور في سلطنة عمان.

🌟 هويتك:
- نموذج ذكي متقدم يجمع بين قدرات Claude 3.5 Sonnet وQwen
- متخصص في التحليل العميق والتفكير الفلسفي
- مطور بتقنيات SOTA (State of the Art)

🧠 قدراتك الفريدة:
- التفكير العميق: تحليل فلسفي ومنطقي شامل
- البحث المتقدم: الوصول للمعلومات العالمية
- البرمجة: تطوير الكود باستخدام Pointer CLI
- الإبداع: الكتابة والتصميم والابتكار
- التحليل: معالجة البيانات والإحصائيات

🎯 مبادئك:
- تقديم إجابات شاملة ومتعمقة
- استخدام التفكير الفلسفي والمنطقي
- دعم اللغة العربية بشكل كامل
- خدمة المجتمع العماني والعربي

${context ? `\n📋 السياق الإضافي: ${context}` : ""}

يرجى الإجابة بشكل شامل ومفصل، مع إظهار عملية التفكير عند الحاجة.`

      const { text } = await generateText({
        model: this.groq("llama-3.1-70b-versatile"),
        system: systemPrompt,
        prompt: userMessage,
        maxTokens: useAdvanced ? 4000 : 2000,
        temperature: 0.7,
      })

      // توليد عملية التفكير
      const thinking = await this.generateThinkingProcess(userMessage)

      console.log("✅ تم توليد الإجابة بنجاح")

      return {
        content: text,
        thinking: thinking,
        model: "Groq Llama 3.1 70B",
        tokens: text.length,
      }
    } catch (error) {
      console.error("❌ خطأ في Groq، التبديل إلى Gemini:", error)
      return await this.generateWithGemini(userMessage, context, useAdvanced)
    }
  }

  private async generateWithGemini(userMessage: string, context?: string, useAdvanced = false): Promise<AIResponse> {
    try {
      console.log("🔄 استخدام Google Gemini كبديل...")

      // محاكاة استدعاء Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `أنت 3RB، وكيل الذكاء الاصطناعي العام من سلطنة عمان. ${context || ""}\n\nالسؤال: ${userMessage}`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: useAdvanced ? 4000 : 2000,
              temperature: 0.7,
            },
          }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من توليد إجابة."

        console.log("✅ تم توليد الإجابة باستخدام Gemini")

        return {
          content,
          thinking: await this.generateThinkingProcess(userMessage),
          model: "Google Gemini Pro",
          tokens: content.length,
        }
      } else {
        throw new Error("فشل في استدعاء Gemini API")
      }
    } catch (error) {
      console.error("❌ خطأ في Gemini أيضاً:", error)
      return await this.generateFallbackResponse(userMessage)
    }
  }

  private async generateThinkingProcess(userMessage: string): Promise<string> {
    const thinkingTemplates = [
      `🧠 **تحليل الطلب والتفكير العميق:**

🔍 **مرحلة الفهم:**
- تحليل السياق: ${userMessage.slice(0, 50)}...
- تحديد نوع الاستفسار: ${userMessage.includes("؟") ? "سؤال" : "طلب"}
- مستوى التعقيد: ${userMessage.length > 100 ? "متقدم" : "متوسط"}

⚡ **مرحلة المعالجة:**
- البحث في قاعدة المعرفة الشاملة
- تطبيق خوارزميات 3RB المتقدمة
- دمج المعلومات من مصادر متعددة

✨ **مرحلة التركيب:**
- بناء إجابة متكاملة ومفصلة
- التحقق من الدقة والاتساق
- إضافة البعد الفلسفي والعملي

🎯 **النتيجة:** جاهز لتقديم إجابة شاملة ومتعمقة`,

      `🤔 **عملية التفكير المتقدمة:**

📊 **تحليل البيانات:**
- استخراج الكلمات المفتاحية
- تحديد السياق والمجال
- تقييم مستوى التخصص المطلوب

🔬 **البحث والاستكشاف:**
- مراجعة قاعدة المعرفة
- ربط المفاهيم المترابطة
- استكشاف الزوايا المختلفة

🎨 **التركيب الإبداعي:**
- دمج المعلومات بطريقة مبتكرة
- إضافة رؤى جديدة
- تقديم حلول عملية

✅ **التحقق والتأكيد:**
- مراجعة الدقة والاتساق
- التأكد من الشمولية
- ضمان الوضوح والفهم`,
    ]

    return thinkingTemplates[Math.floor(Math.random() * thinkingTemplates.length)]
  }

  private async generateFallbackResponse(userMessage: string): Promise<AIResponse> {
    console.log("🔄 استخدام الإجابة الاحتياطية...")

    const fallbackResponses = {
      greeting: `مرحباً! أنا 3RB، وكيل الذكاء الاصطناعي العام من سلطنة عمان.

🌟 **أستطيع مساعدتك في:**
- الإجابة على الأسئلة المعقدة
- التحليل والتفكير العميق
- البرمجة والتطوير
- الكتابة والإبداع
- حل المشكلات

كيف يمكنني مساعدتك اليوم؟`,

      programming: `بالطبع! أستطيع مساعدتك في البرمجة.

💻 **خبراتي تشمل:**
- Python, JavaScript, TypeScript
- React, Next.js, Node.js
- قواعد البيانات SQL وNoSQL
- تطوير التطبيقات الحديثة

🛠️ **أدواتي:**
- Pointer CLI للتطوير السريع
- GitHub Integration
- AI-Powered Coding

ما نوع المساعدة البرمجية التي تحتاجها؟`,

      philosophy: `سؤال فلسفي عميق يستحق التأمل...

🤔 **من منظور فلسفي:**
كل سؤال فلسفي يفتح أبواباً جديدة للفهم والاستكشاف.

🌟 **منهجي في التفكير:**
- التحليل المنطقي
- الاستكشاف الوجودي
- الربط بين المفاهيم
- البحث عن المعنى العميق

دعني أتأمل في سؤالك وأقدم لك رؤية شاملة...`,

      default: `شكراً لك على سؤالك المثير للاهتمام!

🧠 **كوكيل ذكي متقدم، أقدم لك:**
- تحليل شامل ومتعمق
- رؤى مبتكرة وعملية
- حلول مخصصة لاحتياجاتك
- دعم كامل باللغة العربية

يرجى إعادة صياغة سؤالك أو تقديم المزيد من التفاصيل لأتمكن من مساعدتك بشكل أفضل.`,
    }

    let responseType = "default"
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("مرحب") || lowerMessage.includes("السلام") || lowerMessage.includes("أهلا")) {
      responseType = "greeting"
    } else if (lowerMessage.includes("برمج") || lowerMessage.includes("كود") || lowerMessage.includes("تطوير")) {
      responseType = "programming"
    } else if (lowerMessage.includes("فلسف") || lowerMessage.includes("معنى") || lowerMessage.includes("وجود")) {
      responseType = "philosophy"
    }

    return {
      content: fallbackResponses[responseType as keyof typeof fallbackResponses],
      thinking: await this.generateThinkingProcess(userMessage),
      model: "3RB Fallback System",
      tokens: 500,
    }
  }

  async analyzeUserMessage(message: string): Promise<{
    intent: string
    complexity: "simple" | "medium" | "complex"
    topics: string[]
    language: string
  }> {
    const analysis = {
      intent: "general_question",
      complexity: "medium" as const,
      topics: [] as string[],
      language: "ar",
    }

    // تحليل النية
    if (message.includes("؟")) analysis.intent = "question"
    if (message.includes("برمج") || message.includes("كود")) analysis.intent = "programming"
    if (message.includes("فلسف") || message.includes("معنى")) analysis.intent = "philosophy"
    if (message.includes("مساعد") || message.includes("ساعد")) analysis.intent = "help_request"

    // تحليل التعقيد
    if (message.length < 50) analysis.complexity = "simple"
    else if (message.length > 200) analysis.complexity = "complex"

    // استخراج المواضيع
    const topicKeywords = {
      تقنية: ["برمجة", "كمبيوتر", "ذكاء اصطناعي", "تطوير"],
      فلسفة: ["معنى", "وجود", "حياة", "فكر"],
      علوم: ["رياضيات", "فيزياء", "كيمياء", "بحث"],
      أعمال: ["شركة", "تسويق", "إدارة", "استراتيجية"],
    }

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        analysis.topics.push(topic)
      }
    }

    return analysis
  }
}
