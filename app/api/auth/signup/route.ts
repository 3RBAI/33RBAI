import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    console.log("📝 محاولة إنشاء حساب جديد:", email)

    // التحقق من صحة البيانات
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "جميع الحقول مطلوبة",
        },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
        },
        { status: 400 },
      )
    }

    // التحقق من وجود المستخدم
    // const existingUser = await db.user.findUnique({ where: { email } })
    // if (existingUser) {
    //   return NextResponse.json(
    //     { success: false, message: "البريد الإلكتروني مستخدم بالفعل" },
    //     { status: 409 }
    //   )
    // }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)

    // إنشاء المستخدم الجديد
    const newUser = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      verified: false,
      provider: "email",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    // في التطبيق الحقيقي، احفظ في قاعدة البيانات
    // const user = await db.user.create({ data: newUser })

    // إنشاء JWT token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET || "demo-secret", {
      expiresIn: "7d",
    })

    // إرسال بريد التحقق
    await sendVerificationEmail(newUser.email, newUser.id)

    console.log("✅ تم إنشاء الحساب بنجاح:", email)

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        verified: newUser.verified,
        provider: newUser.provider,
        createdAt: newUser.createdAt,
        lastLogin: newUser.lastLogin,
      },
      token,
    })
  } catch (error) {
    console.error("❌ خطأ في إنشاء الحساب:", error)
    return NextResponse.json(
      {
        success: false,
        message: "خطأ في الخادم",
      },
      { status: 500 },
    )
  }
}

async function sendVerificationEmail(email: string, userId: string) {
  try {
    // إنشاء رمز التحقق
    const verificationToken = jwt.sign({ userId, email }, process.env.JWT_SECRET || "demo-secret", { expiresIn: "24h" })

    // في التطبيق الحقيقي، أرسل البريد الإلكتروني
    console.log("📧 إرسال بريد التحقق إلى:", email)
    console.log("🔗 رابط التحقق:", `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`)

    // محاكاة إرسال البريد
    return true
  } catch (error) {
    console.error("❌ خطأ في إرسال بريد التحقق:", error)
    return false
  }
}
