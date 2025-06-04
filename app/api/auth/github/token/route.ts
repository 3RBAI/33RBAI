import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.log("🔐 محاكاة GitHub OAuth token exchange")
      return NextResponse.json({
        access_token: "demo_access_token_" + Math.random().toString(36).substr(2, 9),
        token_type: "bearer",
        scope: "user:email",
      })
    }

    // تبديل الكود بـ access token
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    })

    if (response.ok) {
      const tokenData = await response.json()
      console.log("✅ تم الحصول على GitHub access token")
      return NextResponse.json(tokenData)
    } else {
      console.error("❌ فشل في الحصول على GitHub token")
      return NextResponse.json(
        {
          error: "فشل في تبديل الكود",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ خطأ في GitHub OAuth:", error)
    return NextResponse.json(
      {
        error: "خطأ في الخادم",
      },
      { status: 500 },
    )
  }
}
