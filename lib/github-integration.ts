interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  language: string
  stargazers_count: number
  private: boolean
}

interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string
  email: string
  public_repos: number
  followers: number
  following: number
}

export class GitHubIntegration {
  private token: string

  constructor() {
    this.token = process.env.GITHUB_TOKEN || ""
    console.log("🔗 تم تهيئة تكامل GitHub")
  }

  async getUserInfo(): Promise<GitHubUser | null> {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        const user = await response.json()
        console.log("✅ تم جلب معلومات المستخدم من GitHub")
        return user
      } else {
        console.error("❌ فشل في جلب معلومات المستخدم")
        return null
      }
    } catch (error) {
      console.error("❌ خطأ في GitHub API:", error)
      return null
    }
  }

  async getUserRepos(): Promise<GitHubRepo[]> {
    try {
      const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=10", {
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        const repos = await response.json()
        console.log("✅ تم جلب المستودعات من GitHub")
        return repos
      } else {
        console.error("❌ فشل في جلب المستودعات")
        return []
      }
    } catch (error) {
      console.error("❌ خطأ في جلب المستودعات:", error)
      return []
    }
  }

  async getRepoContent(owner: string, repo: string, path = ""): Promise<any> {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        const content = await response.json()
        console.log("✅ تم جلب محتوى المستودع")
        return content
      } else {
        console.error("❌ فشل في جلب محتوى المستودع")
        return null
      }
    } catch (error) {
      console.error("❌ خطأ في جلب المحتوى:", error)
      return null
    }
  }

  async createRepo(name: string, description: string, isPrivate = false): Promise<GitHubRepo | null> {
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          private: isPrivate,
          auto_init: true,
        }),
      })

      if (response.ok) {
        const repo = await response.json()
        console.log("✅ تم إنشاء مستودع جديد:", name)
        return repo
      } else {
        console.error("❌ فشل في إنشاء المستودع")
        return null
      }
    } catch (error) {
      console.error("❌ خطأ في إنشاء المستودع:", error)
      return null
    }
  }

  async updateFile(owner: string, repo: string, path: string, content: string, message: string): Promise<boolean> {
    try {
      // أولاً، جلب SHA الحالي للملف (إذا كان موجوداً)
      const existingFile = await this.getRepoContent(owner, repo, path)

      const body: any = {
        message,
        content: Buffer.from(content).toString("base64"),
      }

      if (existingFile && !Array.isArray(existingFile)) {
        body.sha = existingFile.sha
      }

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        console.log("✅ تم تحديث الملف بنجاح")
        return true
      } else {
        console.error("❌ فشل في تحديث الملف")
        return false
      }
    } catch (error) {
      console.error("❌ خطأ في تحديث الملف:", error)
      return false
    }
  }

  async searchCode(query: string, language?: string): Promise<any> {
    try {
      let searchQuery = query
      if (language) {
        searchQuery += ` language:${language}`
      }

      const response = await fetch(`https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        const results = await response.json()
        console.log("✅ تم البحث في الكود")
        return results
      } else {
        console.error("❌ فشل في البحث")
        return null
      }
    } catch (error) {
      console.error("❌ خطأ في البحث:", error)
      return null
    }
  }
}
