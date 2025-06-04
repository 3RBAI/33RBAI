"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Github, Star, GitFork, Eye, Lock, Unlock, Plus, RefreshCw } from "lucide-react"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  language: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  private: boolean
  updated_at: string
}

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  public_repos: number
  followers: number
  following: number
}

export function GitHubIntegrationPanel() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGitHubData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/github/repos")
      const data = await response.json()

      if (data.success) {
        setRepos(data.repos)
        setUser(data.user)
        console.log("✅ تم جلب بيانات GitHub بنجاح")
      } else {
        setError(data.error || "فشل في جلب البيانات")
      }
    } catch (error) {
      console.error("❌ خطأ في جلب بيانات GitHub:", error)
      setError("خطأ في الاتصال بـ GitHub")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGitHubData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-green-500",
      Java: "bg-red-500",
      "C++": "bg-purple-500",
      Go: "bg-cyan-500",
      Rust: "bg-orange-500",
      PHP: "bg-indigo-500",
    }
    return colors[language] || "bg-gray-500"
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <Github className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">خطأ في تحميل بيانات GitHub</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={fetchGitHubData} variant="outline" className="border-red-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* معلومات المستخدم */}
      {user && (
        <Card className="bg-black/20 backdrop-blur-md border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Github className="w-5 h-5 mr-2" />
              معلومات GitHub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-purple-500"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <p className="text-gray-300">@{user.login}</p>
                <div className="flex space-x-4 mt-2 text-sm text-gray-400">
                  <span>{user.public_repos} مستودع</span>
                  <span>{user.followers} متابع</span>
                  <span>{user.following} متابَع</span>
                </div>
              </div>
              <Button
                onClick={fetchGitHubData}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-300"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                تحديث
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة المستودعات */}
      <Card className="bg-black/20 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">المستودعات ({repos.length})</CardTitle>
            <Button
              onClick={() => window.open("https://github.com/new", "_blank")}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              مستودع جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300">جاري تحميل المستودعات...</p>
            </div>
          ) : repos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مستودعات</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-white hover:text-purple-300">
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                              {repo.name}
                            </a>
                          </h4>
                          {repo.private ? (
                            <Lock className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Unlock className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {repo.description && <p className="text-sm text-gray-400 mb-2">{repo.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {repo.language && (
                          <div className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                            <span>{repo.language}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{repo.stargazers_count}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks_count}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{repo.watchers_count}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">آخر تحديث: {formatDate(repo.updated_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
