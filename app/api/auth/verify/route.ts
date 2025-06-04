import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "رمز المصادقة مطلوب",
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7)

    // التحقق من صحة الرمز المميز
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "demo-secret") as any

    // في التطبيق الحقيقي، ابحث عن المستخدم في قاعدة البيانات
    // const user = await db.user.findUnique({ where: { id: decoded.userId } })

    console.log("✅ تم التحقق من الرمز المميز:", decoded.email)

    return NextResponse.json({
      success: true,
      message: "الرمز المميز صحيح",
      user: {
        id: decoded.userId,
        email: decoded.email,
      },
    })
  } catch (error) {
    console.error("❌ خطأ في التحقق من الرمز المميز:", error)
    return NextResponse.json(
      {
        success: false,
        message: "رمز مصادقة غير صحيح",
      },
      { status: 401 },
    )
  }
}
