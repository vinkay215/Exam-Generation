"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Settings, Package } from "lucide-react"
import type { ExamGenerationResult } from "@/lib/exam-generator"
import { examExporter, type ExportOptions, type ExportProgress } from "@/lib/exam-exporter"

interface DownloadManagerProps {
  examResult: ExamGenerationResult
}

export function DownloadManager({ examResult }: DownloadManagerProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "docx",
    includeAnswers: false,
    separateAnswerSheet: true,
    includeStatistics: true,
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<ExportProgress | null>(null)
  const [previewFiles, setPreviewFiles] = useState<string[]>([])

  const handleDownloadAll = async () => {
    setIsDownloading(true)
    setDownloadProgress({ current: 0, total: 1, status: "Bắt đầu tạo gói đề thi..." })

    try {
      await examExporter.downloadExamPackage(examResult.exams, exportOptions, setDownloadProgress)
    } catch (error) {
      console.error("Error downloading exams:", error)
      // TODO: Show error toast
    } finally {
      setIsDownloading(false)
      setDownloadProgress(null)
    }
  }

  const handleDownloadSingle = async (examIndex: number) => {
    const exam = examResult.exams[examIndex]
    if (!exam) return

    if (exportOptions.format === "docx") {
      try {
        const blob = await examExporter.exportToDocx(exam, exportOptions)
        const filename = `De${exam.version.toString().padStart(2, "0")}.docx`
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error downloading DOCX:", error)
      }
    } else {
      const content = examExporter.exportToText(exam, exportOptions)
      const filename = `De${exam.version.toString().padStart(2, "0")}.txt`
      examExporter.downloadFile(content, filename)
    }
  }

  const handleDownloadAnswers = async (examIndex: number) => {
    const exam = examResult.exams[examIndex]
    if (!exam) return

    if (exportOptions.format === "docx") {
      try {
        const blob = await examExporter.exportAnswerSheetDocx(exam)
        const filename = `DapAn${exam.version.toString().padStart(2, "0")}.docx`
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error downloading DOCX:", error)
      }
    } else {
      const content = examExporter.exportAnswerSheet(exam)
      const filename = `DapAn${exam.version.toString().padStart(2, "0")}.txt`
      examExporter.downloadFile(content, filename)
    }
  }

  const handlePreviewPackage = async () => {
    try {
      const files = await examExporter.getPackagePreview(examResult.exams, exportOptions)
      setPreviewFiles(files)
    } catch (error) {
      console.error("Error generating preview:", error)
    }
  }

  const estimatedFileCount =
    examResult.exams.length * (exportOptions.separateAnswerSheet ? 2 : 1) +
    (exportOptions.includeStatistics ? 1 : 0) +
    1 // README

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tùy chọn xuất file
          </CardTitle>
          <CardDescription>Cấu hình cách thức xuất đề thi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Định dạng file:</label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="format-docx"
                    name="format"
                    value="docx"
                    checked={exportOptions.format === "docx"}
                    onChange={(e) =>
                      setExportOptions((prev) => ({ ...prev, format: e.target.value as "txt" | "docx" }))
                    }
                  />
                  <label htmlFor="format-docx" className="text-sm font-medium">
                    DOCX (Word Document)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="format-txt"
                    name="format"
                    value="txt"
                    checked={exportOptions.format === "txt"}
                    onChange={(e) =>
                      setExportOptions((prev) => ({ ...prev, format: e.target.value as "txt" | "docx" }))
                    }
                  />
                  <label htmlFor="format-txt" className="text-sm font-medium">
                    TXT (Text File)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="separateAnswers"
                checked={exportOptions.separateAnswerSheet}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, separateAnswerSheet: checked as boolean }))
                }
              />
              <label
                htmlFor="separateAnswers"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tạo file đáp án riêng
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeStats"
                checked={exportOptions.includeStatistics}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, includeStatistics: checked as boolean }))
                }
              />
              <label
                htmlFor="includeStats"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Bao gồm file thống kê
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showAnswers"
                checked={exportOptions.includeAnswers}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, includeAnswers: checked as boolean }))
                }
              />
              <label
                htmlFor="showAnswers"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hiển thị đáp án trong đề thi (đánh dấu *)
              </label>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Gói sẽ chứa <Badge variant="secondary">{estimatedFileCount}</Badge> file{" "}
              <Badge variant="outline">{exportOptions.format.toUpperCase()}</Badge>
            </p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={handlePreviewPackage}>
              Xem trước nội dung gói
            </Button>
          </div>

          {previewFiles.length > 0 && (
            <div className="p-3 bg-secondary rounded-lg">
              <h4 className="text-sm font-medium mb-2">Nội dung gói ZIP:</h4>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {previewFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Tải xuống
          </CardTitle>
          <CardDescription>Tải về các phiên bản đề thi đã tạo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Download all as package */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-primary/5">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium">Gói đề thi hoàn chỉnh</span>
                  <p className="text-sm text-muted-foreground">{examResult.exams.length} đề thi + đáp án + thống kê</p>
                </div>
              </div>
              <Button onClick={handleDownloadAll} disabled={isDownloading} size="sm">
                {isDownloading ? "Đang tạo..." : "Tải gói ZIP"}
              </Button>
            </div>

            {/* Download progress */}
            {downloadProgress && (
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">{downloadProgress.status}</span>
                </div>
                <Progress value={(downloadProgress.current / downloadProgress.total) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {downloadProgress.current}/{downloadProgress.total} files
                </p>
              </div>
            )}

            {/* Individual downloads */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tải từng đề riêng lẻ:</h4>
              {examResult.exams.map((exam, index) => (
                <div key={exam.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <span className="text-sm font-medium">Đề thi {exam.version}</span>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {exam.metadata.totalQuestions} câu
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Dễ: {exam.metadata.difficulty.easy}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          TB: {exam.metadata.difficulty.medium}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Khó: {exam.metadata.difficulty.hard}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button size="sm" variant="outline" onClick={() => handleDownloadSingle(index)}>
                      Đề thi
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadAnswers(index)}>
                      Đáp án
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
