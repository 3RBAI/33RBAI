export class EmailService {
  // إزالة المفاتيح الحساسة من هنا
  // private apiKeys = { ... } // احذف هذا السطر

  async subscribe(email: string, service: "mailchimp" | "convertkit" | "custom") {
    console.log(`🔄 اشتراك ${email} في خدمة ${service}`)

    // استخدام Server Action بدلاً من الاستدعاء المباشر
    const response = await fetch("/api/email/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, service }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log("✅ تم الاشتراك بنجاح")
      return result
    } else {
      throw new Error("فشل في الاشتراك")
    }
  }

  async sendVerificationEmail(email: string) {
    console.log(`📧 إرسال بريد التحقق إلى ${email}`)

    const response = await fetch("/api/email/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (response.ok) {
      console.log("✅ تم إرسال بريد التحقق بنجاح")
      return { success: true, message: "تم إرسال بريد التحقق" }
    } else {
      throw new Error("فشل في إرسال بريد التحقق")
    }
  }

  async verifyEmail(token: string) {
    console.log(`🔍 التحقق من الرمز: ${token}`)

    const response = await fetch("/api/email/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })

    if (response.ok) {
      console.log("✅ تم التحقق من البريد الإلكتروني بنجاح")
      return { success: true, message: "تم التحقق بنجاح" }
    } else {
      throw new Error("فشل في التحقق")
    }
  }
}
