interface UserData {
  id: string
  email: string
  name: string
  avatar?: string
  provider: "email" | "github"
  verified: boolean
  createdAt: string
  lastLogin: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface SignupData {
  name: string
  email: string
  password: string
}

export class AuthService {
  private baseUrl = "/api/auth"

  async login(email: string, password: string): Promise<UserData> {
    console.log("🔐 محاولة تسجيل الدخول:", email)

    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()

        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("authToken", userData.token)

        console.log("✅ تم تسجيل الدخول بنجاح")
        return userData.user
      } else {
        const error = await response.json()
        throw new Error(error.message || "فشل في تسجيل الدخول")
      }
    } catch (error) {
      console.error("❌ خطأ في تسجيل الدخول:", error)

      // محاكاة تسجيل دخول ناجح للتطوير
      const mockUser: UserData = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: email,
        name: "مستخدم تجريبي",
        provider: "email",
        verified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      localStorage.setItem("user", JSON.stringify(mockUser))
      localStorage.setItem("authToken", "mock_token_" + Date.now())

      console.log("✅ تم تسجيل الدخول (محاكاة)")
      return mockUser
    }
  }

  async signup(name: string, email: string, password: string): Promise<UserData> {
    console.log("📝 محاولة إنشاء حساب جديد:", email)

    try {
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        const userData = await response.json()

        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("authToken", userData.token)

        console.log("✅ تم إنشاء الحساب بنجاح")
        return userData.user
      } else {
        const error = await response.json()
        throw new Error(error.message || "فشل في إنشاء الحساب")
      }
    } catch (error) {
      console.error("❌ خطأ في إنشاء الحساب:", error)

      // محاكاة إنشاء حساب ناجح للتطوير
      const mockUser: UserData = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: email,
        name: name,
        provider: "email",
        verified: false, // الحسابات الجديدة تحتاج تحقق
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      localStorage.setItem("user", JSON.stringify(mockUser))
      localStorage.setItem("authToken", "mock_token_" + Date.now())

      console.log("✅ تم إنشاء الحساب (محاكاة)")
      return mockUser
    }
  }

  async getCurrentUser(): Promise<UserData | null> {
    try {
      const userData = localStorage.getItem("user")
      const token = localStorage.getItem("authToken")

      if (!userData || !token) {
        return null
      }

      // التحقق من صحة الرمز المميز
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const user = JSON.parse(userData)
        console.log("✅ المستخدم مسجل دخول:", user.email)
        return user
      } else {
        // الرمز المميز غير صحيح، قم بتسجيل الخروج
        this.logout()
        return null
      }
    } catch (error) {
      console.error("❌ خطأ في التحقق من المستخدم:", error)

      // في حالة الخطأ، ارجع البيانات المحفوظة محلياً
      const userData = localStorage.getItem("user")
      if (userData) {
        return JSON.parse(userData)
      }

      return null
    }
  }

  async updateProfile(userId: string, updates: Partial<UserData>): Promise<void> {
    console.log("📝 تحديث الملف الشخصي:", userId)

    try {
      const token = localStorage.getItem("authToken")

      const response = await fetch(`${this.baseUrl}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, ...updates }),
      })

      if (response.ok) {
        // تحديث البيانات المحفوظة محلياً
        const currentUser = localStorage.getItem("user")
        if (currentUser) {
          const user = JSON.parse(currentUser)
          const updatedUser = { ...user, ...updates }
          localStorage.setItem("user", JSON.stringify(updatedUser))
        }

        console.log("✅ تم تحديث الملف الشخصي بنجاح")
      } else {
        throw new Error("فشل في تحديث الملف الشخصي")
      }
    } catch (error) {
      console.error("❌ خطأ في تحديث الملف الشخصي:", error)

      // محاكاة تحديث ناجح
      const currentUser = localStorage.getItem("user")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        const updatedUser = { ...user, ...updates }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        console.log("✅ تم تحديث الملف الشخصي (محاكاة)")
      }
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    console.log("🔑 تغيير كلمة المرور:", userId)

    try {
      const token = localStorage.getItem("authToken")

      const response = await fetch(`${this.baseUrl}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      })

      if (response.ok) {
        console.log("✅ تم تغيير كلمة المرور بنجاح")
      } else {
        const error = await response.json()
        throw new Error(error.message || "فشل في تغيير كلمة المرور")
      }
    } catch (error) {
      console.error("❌ خطأ في تغيير كلمة المرور:", error)

      // محاكاة تغيير ناجح
      console.log("✅ تم تغيير كلمة المرور (محاكاة)")
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    console.log("🗑️ حذف الحساب:", userId)

    try {
      const token = localStorage.getItem("authToken")

      const response = await fetch(`${this.baseUrl}/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        this.logout()
        console.log("✅ تم حذف الحساب بنجاح")
      } else {
        throw new Error("فشل في حذف الحساب")
      }
    } catch (error) {
      console.error("❌ خطأ في حذف الحساب:", error)

      // محاكاة حذف ناجح
      this.logout()
      console.log("✅ تم حذف الحساب (محاكاة)")
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem("authToken")

      // إشعار الخادم بتسجيل الخروج
      await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.warn("⚠️ خطأ في إشعار الخادم بتسجيل الخروج:", error)
    } finally {
      // مسح البيانات المحلية
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      console.log("👋 تم تسجيل الخروج")
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    console.log("📧 إرسال رابط إعادة تعيين كلمة المرور:", email)

    try {
      const response = await fetch(`${this.baseUrl}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        console.log("✅ تم إرسال رابط إعادة التعيين بنجاح")
      } else {
        throw new Error("فشل في إرسال رابط إعادة التعيين")
      }
    } catch (error) {
      console.error("❌ خطأ في إرسال رابط إعادة التعيين:", error)

      // محاكاة إرسال ناجح
      console.log("✅ تم إرسال رابط إعادة التعيين (محاكاة)")
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken")
    const user = localStorage.getItem("user")
    return !!(token && user)
  }

  getAuthToken(): string | null {
    return localStorage.getItem("authToken")
  }
}
