import { type NextRequest, NextResponse } from "next/server"
import { GitHubIntegration } from "@/lib/github-integration"

export async function GET(request: NextRequest) {
  try {
    const github = new GitHubIntegration()

    // جلب معلومات المستخدم والمستودعات
    const [userInfo, repos] = await Promise.all([github.getUserInfo(), github.getUserRepos()])

    console.log("✅ تم جلب بيانات GitHub بنجاح")

    return NextResponse.json({
      success: true,
      user: userInfo,
      repos: repos,
      total_repos: repos.length,
    })
  } catch (error) {
    console.error("❌ خطأ في GitHub API:", error)

    return NextResponse.json(
      {
        success: false,
        error: "فشل في جلب بيانات GitHub",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, isPrivate } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "اسم المستودع مطلوب" }, { status: 400 })
    }

    const github = new GitHubIntegration()
    const newRepo = await github.createRepo(name, description, isPrivate)

    if (newRepo) {
      console.log("✅ تم إنشاء مستودع جديد:", name)

      return NextResponse.json({
        success: true,
        repo: newRepo,
        message: "تم إنشاء المستودع بنجاح",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "فشل في إنشاء المستودع",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ خطأ في إنشاء المستودع:", error)

    return NextResponse.json(
      {
        success: false,
        error: "خطأ في الخادم",
      },
      { status: 500 },
    )
  }
}
