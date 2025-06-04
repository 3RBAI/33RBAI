interface GitHubUser {
  id: string
  email: string
  name: string
  avatar?: string
  provider: "github"
  verified: boolean
  createdAt: string
  lastLogin: string
}

export class GitHubAuth {
  private clientId: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "demo-client-id"
    this.redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || "http://localhost:3000/auth/github/callback"
    console.log("🔐 تم تهيئة GitHub OAuth")
  }

  async signIn(): Promise<GitHubUser> {
    console.log("🚀 بدء تسجيل الدخول عبر GitHub")

    try {
      // في التطبيق الحقيقي، استخدم GitHub OAuth
      if (typeof window !== "undefined") {
        // محاكاة عملية OAuth
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=user:email`

        // في التطبيق الحقيقي، افتح نافذة OAuth أو أعد توجيه المستخدم
        // window.location.href = authUrl

        // محاكاة انتظار المصادقة
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // محاكاة بيانات المستخدم من GitHub
        const mockUser: GitHubUser = {
          id: "github_" + Math.random().toString(36).substr(2, 9),
          email: "user@github.example.com",
          name: "مطور GitHub",
          avatar: "https://github.com/github.png",
          provider: "github",
          verified: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }

        // حفظ في localStorage
        localStorage.setItem("user", JSON.stringify(mockUser))
        localStorage.setItem("authToken", "github_token_" + Date.now())

        console.log("✅ تم تسجيل الدخول عبر GitHub بنجاح")
        return mockUser
      }

      throw new Error("GitHub OAuth غير متاح في البيئة الحالية")
    } catch (error) {
      console.error("❌ خطأ في GitHub OAuth:", error)
      throw error
    }
  }

  async getUser(): Promise<GitHubUser | null> {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        if (user.provider === "github") {
          return user
        }
      }
    }
    return null
  }

  async signOut(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      console.log("👋 تم تسجيل الخروج من GitHub")
    }
  }

  async handleCallback(code: string): Promise<GitHubUser> {
    console.log("🔄 معالجة رد GitHub OAuth")

    try {
      // تبديل الكود بـ access token
      const tokenResponse = await fetch("/api/auth/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (!tokenResponse.ok) {
        throw new Error("فشل في الحصول على access token")
      }

      const { access_token } = await tokenResponse.json()

      // الحصول على بيانات المستخدم من GitHub
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!userResponse.ok) {
        throw new Error("فشل في الحصول على بيانات المستخدم")
      }

      const githubUser = await userResponse.json()

      // الحصول على البريد الإلكتروني
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      const emails = await emailResponse.json()
      const primaryEmail = emails.find((email: any) => email.primary)?.email

      const user: GitHubUser = {
        id: `github_${githubUser.id}`,
        email: primaryEmail || githubUser.email,
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
        provider: "github",
        verified: githubUser.email !== null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      // حفظ في localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("authToken", access_token)
      }

      // حفظ في قاعدة البيانات
      await this.saveUserToDatabase(user)

      console.log("✅ تم تسجيل الدخول عبر GitHub بنجاح")
      return user
    } catch (error) {
      console.error("❌ خطأ في GitHub OAuth:", error)
      throw error
    }
  }

  private async saveUserToDatabase(user: GitHubUser): Promise<void> {
    try {
      const response = await fetch("/api/auth/github/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })

      if (response.ok) {
        console.log("✅ تم حفظ بيانات المستخدم في قاعدة البيانات")
      } else {
        console.warn("⚠️ فشل في حفظ بيانات المستخدم")
      }
    } catch (error) {
      console.error("❌ خطأ في حفظ بيانات المستخدم:", error)
    }
  }

  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      const token = localStorage.getItem("authToken")

      if (user && token) {
        const userData = JSON.parse(user)
        return userData.provider === "github"
      }
    }
    return false
  }

  async linkAccount(existingUserId: string): Promise<void> {
    console.log("🔗 ربط حساب GitHub بحساب موجود")

    try {
      const githubUser = await this.getUser()
      if (!githubUser) {
        throw new Error("لم يتم العثور على بيانات GitHub")
      }

      const response = await fetch("/api/auth/link-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingUserId,
          githubData: githubUser,
        }),
      })

      if (response.ok) {
        console.log("✅ تم ربط حساب GitHub بنجاح")
      } else {
        throw new Error("فشل في ربط الحساب")
      }
    } catch (error) {
      console.error("❌ خطأ في ربط الحساب:", error)
      throw error
    }
  }

  async unlinkAccount(userId: string): Promise<void> {
    console.log("🔓 إلغاء ربط حساب GitHub")

    try {
      const response = await fetch("/api/auth/unlink-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        console.log("✅ تم إلغاء ربط حساب GitHub بنجاح")
      } else {
        throw new Error("فشل في إلغاء ربط الحساب")
      }
    } catch (error) {
      console.error("❌ خطأ في إلغاء ربط الحساب:", error)
      throw error
    }
  }
}
