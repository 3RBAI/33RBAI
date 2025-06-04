import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize, content } = await request.json()

    console.log("🔍 تحليل الملف:", fileName)

    // تحليل نوع الملف
    const fileExtension = fileName.split(".").pop()?.toLowerCase()
    let analysis = {
      summary: "",
      lines: 0,
      words: 0,
      complexity: "متوسط",
      recommendations: "",
    }

    // تحليل الملفات النصية
    if (fileType.includes("text") || fileType.includes("json") || fileType.includes("javascript")) {
      const lines = content.split("\n").length
      const words = content.split(/\s+/).filter((word) => word.length > 0).length
      const characters = content.length

      analysis = {
        summary: `ملف نصي يحتوي على ${lines} سطر و ${words} كلمة و ${characters} حرف`,
        lines,
        words,
        complexity: lines > 1000 ? "معقد" : lines > 100 ? "متوسط" : "بسيط",
        recommendations: generateTextRecommendations(fileExtension, lines, words),
      }
    }

    // تحليل ملفات البرمجة
    else if (isCodeFile(fileExtension)) {
      const lines = content.split("\n").length
      const codeLines = content
        .split("\n")
        .filter((line) => line.trim() && !line.trim().startsWith("//") && !line.trim().startsWith("/*")).length

      analysis = {
        summary: `ملف برمجي بلغة ${getLanguageName(fileExtension)} يحتوي على ${codeLines} سطر كود فعلي من أصل ${lines} سطر`,
        lines: codeLines,
        words: content.split(/\s+/).length,
        complexity: analyzeCodeComplexity(content, fileExtension),
        recommendations: generateCodeRecommendations(fileExtension, codeLines),
      }
    }

    // تحليل ملفات البيانات
    else if (fileType.includes("json") || fileExtension === "csv" || fileExtension === "xml") {
      analysis = {
        summary: `ملف بيانات بتنسيق ${fileExtension?.toUpperCase()} بحجم ${formatFileSize(fileSize)}`,
        lines: content.split("\n").length,
        words: 0,
        complexity: analyzeDataComplexity(content, fileExtension),
        recommendations: generateDataRecommendations(fileExtension, fileSize),
      }
    }

    // تحليل الملفات الأخرى
    else {
      analysis = {
        summary: `ملف من نوع ${fileType} بحجم ${formatFileSize(fileSize)}`,
        lines: 0,
        words: 0,
        complexity: "غير محدد",
        recommendations: "يمكن معالجة هذا النوع من الملفات حسب احتياجاتك الخاصة",
      }
    }

    console.log("✅ تم تحليل الملف بنجاح")

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("❌ خطأ في تحليل الملف:", error)
    return NextResponse.json({ error: "فشل في تحليل الملف" }, { status: 500 })
  }
}

function isCodeFile(extension?: string): boolean {
  const codeExtensions = [
    "js",
    "ts",
    "jsx",
    "tsx",
    "py",
    "java",
    "cpp",
    "c",
    "cs",
    "php",
    "rb",
    "go",
    "rs",
    "swift",
    "kt",
    "dart",
    "html",
    "css",
    "scss",
    "sass",
  ]
  return extension ? codeExtensions.includes(extension) : false
}

function getLanguageName(extension?: string): string {
  const languages: { [key: string]: string } = {
    js: "JavaScript",
    ts: "TypeScript",
    jsx: "React JSX",
    tsx: "React TypeScript",
    py: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    cs: "C#",
    php: "PHP",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    swift: "Swift",
    kt: "Kotlin",
    dart: "Dart",
    html: "HTML",
    css: "CSS",
  }
  return languages[extension || ""] || "غير محدد"
}

function analyzeCodeComplexity(content: string, extension?: string): string {
  const lines = content.split("\n").length
  const functions = (content.match(/function|def|class|interface/g) || []).length
  const loops = (content.match(/for|while|forEach/g) || []).length
  const conditions = (content.match(/if|switch|case/g) || []).length

  const complexityScore = functions * 2 + loops * 1.5 + conditions * 1 + lines * 0.1

  if (complexityScore > 100) return "معقد جداً"
  if (complexityScore > 50) return "معقد"
  if (complexityScore > 20) return "متوسط"
  return "بسيط"
}

function analyzeDataComplexity(content: string, extension?: string): string {
  if (extension === "json") {
    try {
      const data = JSON.parse(content)
      const keys = Object.keys(data).length
      return keys > 50 ? "معقد" : keys > 10 ? "متوسط" : "بسيط"
    } catch {
      return "تنسيق غير صحيح"
    }
  }

  if (extension === "csv") {
    const lines = content.split("\n").length
    const columns = content.split("\n")[0]?.split(",").length || 0
    return lines > 1000 || columns > 20 ? "معقد" : "متوسط"
  }

  return "متوسط"
}

function generateTextRecommendations(extension?: string, lines?: number, words?: number): string {
  const recommendations = []

  if (lines && lines > 1000) {
    recommendations.push("• يُنصح بتقسيم الملف إلى أجزاء أصغر لسهولة القراءة")
  }

  if (extension === "md") {
    recommendations.push("• ملف Markdown - يمكن تحويله إلى HTML أو PDF")
  }

  if (extension === "txt") {
    recommendations.push("• يمكن تحويل الملف إلى تنسيقات أخرى حسب الحاجة")
  }

  return recommendations.length > 0 ? recommendations.join("\n") : "الملف في حالة جيدة"
}

function generateCodeRecommendations(extension?: string, lines?: number): string {
  const recommendations = []

  if (lines && lines > 500) {
    recommendations.push("• يُنصح بتقسيم الكود إلى ملفات أو وحدات أصغر")
  }

  if (extension === "js" || extension === "ts") {
    recommendations.push("• تأكد من استخدام ESLint و Prettier لتحسين جودة الكود")
  }

  if (extension === "py") {
    recommendations.push("• استخدم PEP 8 لتنسيق الكود Python")
  }

  recommendations.push("• قم بإضافة تعليقات وثائقية للدوال المهمة")

  return recommendations.join("\n")
}

function generateDataRecommendations(extension?: string, fileSize?: number): string {
  const recommendations = []

  if (fileSize && fileSize > 10 * 1024 * 1024) {
    // أكبر من 10MB
    recommendations.push("• الملف كبير - يُنصح بضغطه أو تقسيمه")
  }

  if (extension === "json") {
    recommendations.push("• تأكد من صحة تنسيق JSON قبل الاستخدام")
  }

  if (extension === "csv") {
    recommendations.push("• يمكن استيراد البيانات إلى Excel أو قاعدة بيانات")
  }

  return recommendations.length > 0 ? recommendations.join("\n") : "ملف البيانات جاهز للاستخدام"
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
