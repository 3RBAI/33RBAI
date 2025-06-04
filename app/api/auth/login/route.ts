import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("🔐 محاولة تسجيل دخول:", email)

    // في التطبيق الحقيقي، ابحث عن المستخدم في قاعدة البيانات
    // const user = await db.user.findUnique({ where: { email } })

    // محاكاة البحث عن المستخدم
    const mockUser = {
      id: "user_123",
      email: email,
      name: "مستخدم تجريبي",
      password: await bcrypt.hash("password123", 10), // كلمة مرور مشفرة
      verified: true,
      provider: "email",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, mockUser.password)

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الدخول غير صحيحة",
        },
        { status: 401 },
      )
    }

    // إنشاء JWT token
    const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, process.env.JWT_SECRET || "demo-secret", {
      expiresIn: "7d",
    })

    // تحديث آخر تسجيل دخول
    // await db.user.update({
    //   where: { id: mockUser.id },
    //   data: { lastLogin: new Date() }
    // })

    console.log("✅ تم تسجيل الدخول بنجاح:", email)

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        verified: mockUser.verified,
        provider: mockUser.provider,
        createdAt: mockUser.createdAt,
        lastLogin: new Date().toISOString(),
      },
      token,
    })
  } catch (error) {
    console.error("❌ خطأ في تسجيل الدخول:", error)
    return NextResponse.json(
      {
        success: false,
        message: "خطأ في الخادم",
      },
      { status: 500 },
    )
  }
}
