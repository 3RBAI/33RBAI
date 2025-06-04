import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function PUT(request: NextRequest) {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "demo-secret") as any

    const { userId, name, email } = await request.json()

    // التحقق من أن المستخدم يحدث ملفه الشخصي فقط
    if (decoded.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بتحديث هذا الملف الشخصي",
        },
        { status: 403 },
      )
    }

    // في التطبيق الحقيقي، حدث قاعدة البيانات
    // await db.user.update({
    //   where: { id: userId },
    //   data: { name, email }
    // })

    console.log("✅ تم تحديث الملف الشخصي:", email)

    return NextResponse.json({
      success: true,
      message: "تم تحديث الملف الشخصي بنجاح",
    })
  } catch (error) {
    console.error("❌ خطأ في تحديث الملف الشخصي:", error)
    return NextResponse.json(
      {
        success: false,
        message: "خطأ في الخادم",
      },
      { status: 500 },
    )
  }
}
