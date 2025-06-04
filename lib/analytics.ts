interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp: number
}

export class AnalyticsTracker {
  private events: AnalyticsEvent[] = []
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    console.log("📊 تم تهيئة نظام التحليلات")
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  trackPageView(page: string) {
    const event: AnalyticsEvent = {
      name: "page_view",
      properties: {
        page,
        sessionId: this.sessionId,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
        timestamp: Date.now(),
        url: typeof window !== "undefined" ? window.location.href : "server",
      },
      timestamp: Date.now(),
    }

    this.events.push(event)
    this.sendToAnalytics(event)
    console.log("📈 تتبع زيارة الصفحة:", page)
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    }

    this.events.push(event)
    this.sendToAnalytics(event)
    console.log("📊 تتبع حدث:", eventName, properties)
  }

  private async sendToAnalytics(event: AnalyticsEvent) {
    // إرسال إلى Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", event.name, event.properties)
    }

    // إرسال إلى Mixpanel
    if (typeof window !== "undefined" && (window as any).mixpanel) {
      ;(window as any).mixpanel.track(event.name, event.properties)
    }

    // إرسال إلى خدمة مخصصة
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.warn("⚠️ فشل في إرسال البيانات للتحليلات:", error)
    }
  }

  getSessionEvents(): AnalyticsEvent[] {
    return this.events.filter((event) => event.properties?.sessionId === this.sessionId)
  }

  getEventsByType(eventName: string): AnalyticsEvent[] {
    return this.events.filter((event) => event.name === eventName)
  }

  getConversionRate(): number {
    const pageViews = this.getEventsByType("page_view").length
    const conversions = this.getEventsByType("newsletter_signup_success").length

    return pageViews > 0 ? (conversions / pageViews) * 100 : 0
  }

  exportAnalytics(): string {
    const analyticsData = {
      sessionId: this.sessionId,
      events: this.events,
      summary: {
        totalEvents: this.events.length,
        conversionRate: this.getConversionRate(),
        sessionDuration: Date.now() - (this.events[0]?.timestamp || Date.now()),
      },
    }

    return JSON.stringify(analyticsData, null, 2)
  }
}
