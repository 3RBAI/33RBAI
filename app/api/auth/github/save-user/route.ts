import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const githubUser = await request.json()

    console.log("💾 حفظ بيانات مستخدم GitHub:", githubUser.email)

    // في التطبيق الحقيقي، احفظ أو حدث بيانات المستخدم في قاعدة البيانات
    // const user = await db.user.upsert({
    //   where: { email: githubUser.email },
    //   update: {
    //     name: githubUser.name,
    //     avatar: githubUser.avatar,
    //     lastLogin: new Date(),
    //   },
    //   create: {
    //     id: githubUser.id,
    //     email: githubUser.email,
    //     name: githubUser.name,
    //     avatar: githubUser.avatar,
    //     provider: 'github',
    //     verified: true,
    //     createdAt: new Date(),
    //     lastLogin: new Date(),
    //   }
    // })

    console.log("✅ تم حفظ بيانات المستخدم بنجاح")

    return NextResponse.json({
      success: true,
      message: "تم حفظ بيانات المستخدم بنجاح",
    })
  } catch (error) {
    console.error("❌ خطأ في حفظ بيانات المستخدم:", error)
    return NextResponse.json(
      {
        success: false,
        message: "خطأ في حفظ البيانات",
      },
      { status: 500 },
    )
  }
}
