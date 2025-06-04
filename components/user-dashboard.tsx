"use client"

import { useState } from "react"
import { User, Shield, LogOut, Edit, Save, Github, Mail, Calendar, Clock, Key, Bell, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AuthService } from "@/lib/auth-service"
import Image from "next/image"
import { GitHubIntegrationPanel } from "@/components/github-integration-panel"

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

interface UserDashboardProps {
  user: UserData
  onLogout: () => void
}

export function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(user.name)
  const [editedEmail, setEditedEmail] = useState(user.email)
  const [isLoading, setIsLoading] = useState(false)

  const authService = new AuthService()

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      await authService.updateProfile(user.id, {
        name: editedName,
        email: editedEmail,
      })
      setIsEditing(false)
      console.log("✅ تم تحديث الملف الشخصي بنجاح")
    } catch (error) {
      console.error("❌ خطأ في تحديث الملف الشخصي:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.")) {
      try {
        await authService.deleteAccount(user.id)
        onLogout()
        console.log("✅ تم حذف الحساب بنجاح")
      } catch (error) {
        console.error("❌ خطأ في حذف الحساب:", error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {user.avatar ? (
                      <Image
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        width={80}
                        height={80}
                        className="rounded-full border-4 border-white/20"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                    {user.verified && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h1 className="text-3xl font-bold mb-2">مرحباً، {user.name}</h1>
                    <p className="text-blue-100 mb-3">{user.email}</p>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {user.provider === "github" ? (
                          <>
                            <Github className="w-4 h-4 mr-1" />
                            GitHub
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-1" />
                            البريد الإلكتروني
                          </>
                        )}
                      </Badge>
                      {user.verified && (
                        <Badge variant="secondary" className="bg-green-500/20 text-white border-green-300">
                          <Shield className="w-4 h-4 mr-1" />
                          محقق
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            <TabsTrigger value="activity">النشاط</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      المعلومات الشخصية
                    </span>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        تعديل
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          size="sm"
                          className="flex items-center"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          حفظ
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditing(false)
                            setEditedName(user.name)
                            setEditedEmail(user.email)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          إلغاء
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                    {isEditing ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                    {isEditing ? (
                      <Input
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        placeholder="أدخل بريدك الإلكتروني"
                        type="email"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">معرف المستخدم</label>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg font-mono text-sm">{user.id}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    معلومات الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
                    </div>
                    <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">آخر تسجيل دخول</span>
                    </div>
                    <span className="text-sm font-medium">{formatDate(user.lastLogin)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">حالة التحقق</span>
                    </div>
                    <Badge variant={user.verified ? "default" : "secondary"}>
                      {user.verified ? "محقق" : "غير محقق"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {user.provider === "github" ? (
                        <Github className="w-4 h-4 text-gray-500 mr-2" />
                      ) : (
                        <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-600">طريقة التسجيل</span>
                    </div>
                    <span className="text-sm font-medium">
                      {user.provider === "github" ? "GitHub" : "البريد الإلكتروني"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    كلمة المرور
                  </CardTitle>
                  <CardDescription>قم بتغيير كلمة المرور لحسابك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input type="password" placeholder="كلمة المرور الحالية" />
                  <Input type="password" placeholder="كلمة المرور الجديدة" />
                  <Input type="password" placeholder="تأكيد كلمة المرور الجديدة" />
                  <Button className="w-full">تحديث كلمة المرور</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    إعدادات الأمان
                  </CardTitle>
                  <CardDescription>إدارة إعدادات الأمان لحسابك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">المصادقة الثنائية</p>
                      <p className="text-sm text-gray-500">حماية إضافية لحسابك</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">تنبيهات تسجيل الدخول</p>
                      <p className="text-sm text-gray-500">إشعار عند تسجيل دخول جديد</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">جلسات نشطة</p>
                      <p className="text-sm text-gray-500">إدارة الأجهزة المتصلة</p>
                    </div>
                    <Button variant="outline" size="sm">
                      عرض الجلسات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    الإشعارات
                  </CardTitle>
                  <CardDescription>إدارة تفضيلات الإشعارات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إشعارات البريد الإلكتروني</p>
                      <p className="text-sm text-gray-500">تلقي التحديثات عبر البريد</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إشعارات الأمان</p>
                      <p className="text-sm text-gray-500">تنبيهات الأمان المهمة</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إشعارات التسويق</p>
                      <p className="text-sm text-gray-500">عروض وأخبار المنتج</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Trash2 className="w-5 h-5 mr-2" />
                    منطقة الخطر
                  </CardTitle>
                  <CardDescription>إجراءات لا يمكن التراجع عنها</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-medium text-red-800 mb-2">حذف الحساب</h4>
                    <p className="text-sm text-red-600 mb-4">
                      سيتم حذف جميع بياناتك نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                    </p>
                    <Button onClick={handleDeleteAccount} variant="destructive" size="sm">
                      حذف الحساب نهائياً
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  سجل النشاط
                </CardTitle>
                <CardDescription>آخر الأنشطة على حسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">تسجيل دخول ناجح</p>
                        <p className="text-sm text-gray-500">من عنوان IP: 192.168.1.1</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">منذ 5 دقائق</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">تحديث الملف الشخصي</p>
                        <p className="text-sm text-gray-500">تم تغيير الاسم</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">منذ ساعة</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">تغيير كلمة المرور</p>
                        <p className="text-sm text-gray-500">تم تحديث كلمة المرور بنجاح</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">منذ يومين</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">إنشاء الحساب</p>
                        <p className="text-sm text-gray-500">مرحباً بك في المنصة</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="github">
            <GitHubIntegrationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
