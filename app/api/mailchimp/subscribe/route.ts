import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, listId } = await request.json()

    // تكامل Mailchimp الحقيقي
    const apiKey = process.env.MAILCHIMP_API_KEY
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX

    if (!apiKey || !serverPrefix) {
      console.log("📧 محاكاة اشتراك Mailchimp:", email)
      return NextResponse.json({
        success: true,
        message: "تم الاشتراك بنجاح (محاكاة)",
        service: "mailchimp",
      })
    }

    const response = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: "",
          LNAME: "",
        },
      }),
    })

    if (response.ok) {
      console.log("✅ تم الاشتراك في Mailchimp بنجاح")
      return NextResponse.json({
        success: true,
        message: "تم الاشتراك بنجاح",
        service: "mailchimp",
      })
    } else {
      const error = await response.json()
      console.error("❌ خطأ Mailchimp:", error)
      return NextResponse.json(
        {
          success: false,
          message: "فشل في الاشتراك",
          error: error.detail,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ خطأ في API Mailchimp:", error)
    return NextResponse.json(
      {
        success: false,
        message: "خطأ في الخادم",
      },
      { status: 500 },
    )
  }
}
