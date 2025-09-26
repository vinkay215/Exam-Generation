"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { Header } from "@/components/header"
import { ExamPreview } from "@/components/exam-preview"
import { GuideSection } from "@/components/guide-section"
import { WelcomeSection } from "@/components/welcome-section"
import { DatabaseStatus } from "@/components/database-status"
import { useAuth } from "@/lib/auth"
import { Shield } from "lucide-react"
import type { ExamGenerationResult } from "@/lib/exam-generator"

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const [examResult, setExamResult] = useState<ExamGenerationResult | undefined>()
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [providedAnswers, setProvidedAnswers] = useState<Record<number, string>>({})
  const [currentView, setCurrentView] = useState<"home" | "guide" | "database">("home")

  const handleExamsGenerated = (result: ExamGenerationResult) => {
    setExamResult(result)
  }

  const handleFileUploadAttempt = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return false
    }
    return true
  }

  const handleAnswersProvided = (answers: Record<number, string>) => {
    setProvidedAnswers(answers)
  }

  const handleNavigationChange = (view: "home" | "guide" | "database") => {
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigationChange={handleNavigationChange} currentView={currentView} />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {currentView === "guide" ? (
            <GuideSection />
          ) : currentView === "database" ? (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Kiểm tra kết nối Database</h1>
                <p className="text-muted-foreground">
                  Sử dụng công cụ này để chẩn đoán các vấn đề kết nối cơ sở dữ liệu
                </p>
              </div>
              <DatabaseStatus />
            </div>
          ) : (
            <>
              {!isAuthenticated ? (
                <WelcomeSection />
              ) : (
                <>
                  <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-balance mb-4">Tạo Đề Thi Ngẫu Nhiên</h1>
                    <p className="text-xl text-muted-foreground text-pretty">
                      Tải lên file DOCX chứa câu hỏi và tạo nhiều phiên bản đề thi khác nhau một cách tự động
                    </p>

                    {user && (
                      <div className="mt-6 p-4 bg-card border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Chào mừng trở lại, <span className="font-medium text-foreground">{user.fullName}</span>!
                          {user.role === "admin" && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              <Shield className="h-3 w-3" />
                              Admin
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-6">
                      <FileUpload
                        onExamsGenerated={handleExamsGenerated}
                        onUploadAttempt={handleFileUploadAttempt}
                        onAnswersProvided={handleAnswersProvided}
                        providedAnswers={providedAnswers}
                      />
                    </div>
                    <div className="space-y-6">
                      <div className="h-full">
                        <ExamPreview examResult={examResult} providedAnswers={providedAnswers} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-sm text-muted-foreground">© 2025 . All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
