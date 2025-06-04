import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, formId } = await request.json()

    // تكامل ConvertKit الحقيقي
    const apiKey = process.env.CONVERTKIT_API_KEY

    if (!apiKey) {
      console.log("📧 محاكاة اشتراك ConvertKit:", email)
      return NextResponse.json({
        success: true,
        message: "تم الاشتراك بنجاح (محاكاة)",
        service: "convertkit",
      })
    }

    const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        email: email,
      }),
    })

    if (response.ok) {
      console.log("✅ تم الاشتراك في ConvertKit بنجاح")
      return NextResponse.json({
        success: true,
        message: "تم الاشتراك بنجاح",
        service: "convertkit",
      })
    } else {
      const error = await response.json()
      console.error("❌ خطأ ConvertKit:", error)
      return NextResponse.json(
        {
          success: false,
          message: "فشل في الاشتراك",
          error: error.message,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ خطأ في API ConvertKit:", error)
    return NextResponse.json(
      {
        success: false,
        message: "خطأ في الخادم",
      },
      { status: 500 },
    )
  }
}
