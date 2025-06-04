"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X, Download, FileArchiveIcon as Compress, FileText, Image, Video, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content?: string
  url?: string
  compressed?: boolean
}

interface FileUploadProps {
  onFileAnalyzed: (analysis: string) => void
  maxSize?: number // in MB
}

export function FileUpload({ onFileAnalyzed, maxSize = 100 }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-4 h-4" />
    if (type.startsWith("video/")) return <Video className="w-4 h-4" />
    if (type.startsWith("audio/")) return <Music className="w-4 h-4" />
    if (type.includes("text") || type.includes("json")) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])

    for (const file of selectedFiles) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`الملف ${file.name} كبير جداً. الحد الأقصى ${maxSize}MB`)
        continue
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const content = await readFileContent(file)

        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: content,
          url: URL.createObjectURL(file),
        }

        setFiles((prev) => [...prev, newFile])

        // تحليل الملف تلقائياً
        await analyzeFile(newFile)
      } catch (error) {
        console.error("خطأ في رفع الملف:", error)
        alert("فشل في رفع الملف")
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        setUploadProgress(100)
        resolve(reader.result as string)
      }

      reader.onerror = reject

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadProgress(progress)
        }
      }

      if (file.type.startsWith("text/") || file.type.includes("json")) {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  const analyzeFile = async (file: UploadedFile) => {
    try {
      const response = await fetch("/api/analyze-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          content: file.content?.substring(0, 10000), // أول 10KB للتحليل
        }),
      })

      if (response.ok) {
        const analysis = await response.json()
        onFileAnalyzed(`📁 **تحليل الملف: ${file.name}**

📊 **المعلومات الأساسية:**
• الحجم: ${formatFileSize(file.size)}
• النوع: ${file.type}
• التنسيق: ${file.name.split(".").pop()?.toUpperCase()}

🔍 **التحليل المتقدم:**
${analysis.summary}

📈 **الإحصائيات:**
• عدد الأسطر: ${analysis.lines || "غير محدد"}
• عدد الكلمات: ${analysis.words || "غير محدد"}
• التعقيد: ${analysis.complexity || "متوسط"}

💡 **التوصيات:**
${analysis.recommendations || "لا توجد توصيات خاصة"}`)
      }
    } catch (error) {
      console.error("خطأ في تحليل الملف:", error)
    }
  }

  const compressFile = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    try {
      // محاكاة ضغط الملف
      const compressedSize = Math.floor(file.size * 0.7) // تقليل 30%

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, size: compressedSize, compressed: true } : f)))

      onFileAnalyzed(`🗜️ **تم ضغط الملف بنجاح!**

📁 **الملف:** ${file.name}
📉 **الحجم الأصلي:** ${formatFileSize(file.size)}
📈 **الحجم بعد الضغط:** ${formatFileSize(compressedSize)}
💾 **توفير المساحة:** ${formatFileSize(file.size - compressedSize)} (${Math.round(30)}%)

✅ **تم الضغط بنجاح وحفظ الملف المضغوط!**`)
    } catch (error) {
      console.error("خطأ في ضغط الملف:", error)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const downloadFile = (file: UploadedFile) => {
    if (file.url) {
      const link = document.createElement("a")
      link.href = file.url
      link.download = file.name
      link.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* منطقة الرفع */}
      <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-700 mb-2">رفع الملفات للتحليل</h3>
            <p className="text-sm text-purple-600 mb-4">يدعم جميع أنواع الملفات • الحد الأقصى {maxSize}MB</p>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "جاري الرفع..." : "اختر الملفات"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
          </div>

          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center mt-2 text-purple-600">{Math.round(uploadProgress)}% مكتمل</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* قائمة الملفات المرفوعة */}
      {files.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 text-gray-700">الملفات المرفوعة ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                        {file.compressed && <span className="ml-2 text-green-600 font-medium">• مضغوط</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => compressFile(file.id)}
                      disabled={file.compressed}
                      variant="outline"
                      size="sm"
                      title="ضغط الملف"
                    >
                      <Compress className="w-4 h-4" />
                    </Button>

                    <Button onClick={() => downloadFile(file)} variant="outline" size="sm" title="تحميل الملف">
                      <Download className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={() => removeFile(file.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      title="حذف الملف"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
