import { type NextRequest, NextResponse } from "next/server"
import { AIService } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { message, context, userId } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "رسالة غير صحيحة" }, { status: 400 })
    }

    console.log("💬 طلب دردشة جديد:", message.slice(0, 50))

    const aiService = new AIService()

    // تحليل الرسالة
    const analysis = await aiService.analyzeUserMessage(message)

    // تحديد ما إذا كان المستخدم مسجل للحصول على ميزات متقدمة
    const useAdvanced = !!userId

    // توليد الإجابة
    const response = await aiService.generateResponse(message, context, useAdvanced)

    // حفظ المحادثة في قاعدة البيانات (للمستخدمين المسجلين)
    if (userId) {
      await saveChatToDatabase(userId, message, response.content)
    }

    console.log("✅ تم توليد الإجابة بنجاح")

    return NextResponse.json({
      success: true,
      response: response.content,
      thinking: response.thinking,
      model: response.model,
      tokens: response.tokens,
      analysis,
      isAdvanced: useAdvanced,
    })
  } catch (error) {
    console.error("❌ خطأ في API الدردشة:", error)

    return NextResponse.json(
      {
        error: "حدث خطأ في معالجة طلبك",
        fallback: "عذراً، أواجه مشكلة تقنية حالياً. يرجى المحاولة مرة أخرى.",
      },
      { status: 500 },
    )
  }
}

async function saveChatToDatabase(userId: string, userMessage: string, aiResponse: string) {
  try {
    // هنا يمكن إضافة كود حفظ المحادثة في قاعدة البيانات
    console.log("💾 حفظ المحادثة للمستخدم:", userId)

    // مثال على استخدام Neon PostgreSQL
    // const { neon } = require('@neondatabase/serverless')
    // const sql = neon(process.env.DATABASE_URL)
    //
    // await sql`
    //   INSERT INTO chat_history (user_id, user_message, ai_response, created_at)
    //   VALUES (${userId}, ${userMessage}, ${aiResponse}, NOW())
    // `
  } catch (error) {
    console.error("❌ خطأ في حفظ المحادثة:", error)
  }
}
