"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, BarChart3 } from "lucide-react"
import type { ExamGenerationResult } from "@/lib/exam-generator"
import { DownloadManager } from "./download-manager"

interface ExamPreviewProps {
  examResult?: ExamGenerationResult
  providedAnswers?: Record<number, string>
}

export function ExamPreview({ examResult, providedAnswers }: ExamPreviewProps) {
  // Use generated exam or fall back to mock data
  const displayQuestions = examResult?.exams[0]?.questions || [
    {
      question: "Câu hỏi mẫu về lập trình web?",
      options: {
        A: "HTML là ngôn ngữ đánh dấu",
        B: "CSS là ngôn ngữ tạo kiểu",
        C: "JavaScript là ngôn ngữ lập trình",
        D: "Tất cả đều đúng",
      },
      correct: "D",
      difficulty: "Dễ" as const,
      type: "LT" as const,
    },
    {
      question: "Framework nào được sử dụng để xây dựng giao diện người dùng?",
      options: {
        A: "React",
        B: "Vue.js",
        C: "Angular",
        D: "Tất cả đều đúng",
      },
      correct: "D",
      difficulty: "TB" as const,
      type: "TT" as const,
    },
  ]

  // Apply provided answers to questions if available
  const questionsWithAnswers = displayQuestions.map((q, index) => {
    const questionNumber = index + 1
    if (providedAnswers && providedAnswers[questionNumber]) {
      return { ...q, correct: providedAnswers[questionNumber] }
    }
    return q
  })

  return (
    <div className="space-y-6">
      {examResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Thống kê đề thi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">Tổng quan:</p>
                <p>Số phiên bản: {examResult.exams.length}</p>
                <p>Câu hỏi/đề: {examResult.settings.numQuestions}</p>
                <p>Nguồn: {examResult.sourceStats.totalQuestions} câu</p>
              </div>
              <div>
                <p className="font-medium mb-2">Phân bố (Đề 1):</p>
                {examResult.exams[0] && (
                  <>
                    <p>Dễ: {examResult.exams[0].metadata.difficulty.easy}</p>
                    <p>TB: {examResult.exams[0].metadata.difficulty.medium}</p>
                    <p>Khó: {examResult.exams[0].metadata.difficulty.hard}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Xem trước đề thi
          </CardTitle>
          <CardDescription>
            {examResult
              ? `Hiển thị toàn bộ ${questionsWithAnswers.length} câu hỏi từ đề ${examResult.exams[0]?.version || 1}`
              : "Đây là bản xem trước của đề thi sẽ được tạo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show all questions instead of limiting to 5 */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questionsWithAnswers.map((q, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">
                    Câu {index + 1}: {q.question}
                  </h4>
                  <div className="flex gap-1">
                    <Badge
                      variant={q.difficulty === "Dễ" ? "default" : q.difficulty === "TB" ? "secondary" : "destructive"}
                    >
                      {q.difficulty}
                    </Badge>
                    <Badge variant={q.type === "LT" ? "outline" : "secondary"}>{q.type}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  {Object.entries(q.options).map(([letter, text]) => (
                    <div
                      key={letter}
                      className={`flex items-start gap-2 p-1 rounded ${
                        q.correct === letter ? "bg-green-50 text-green-800" : ""
                      }`}
                    >
                      <span className="font-medium min-w-[20px]">{letter}.</span>
                      <span className={q.correct === letter ? "font-medium" : "text-muted-foreground"}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {examResult && <DownloadManager examResult={examResult} />}
    </div>
  )
}
