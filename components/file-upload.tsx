"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Settings, CheckCircle, AlertCircle, Loader2, Key } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { QuestionParser, type ParsedDocument } from "@/lib/question-parser"
import { DocxReader } from "@/lib/docx-reader"
import { examGenerator, type ExamSettings, type ExamGenerationResult } from "@/lib/exam-generator"
import { useAuth } from "@/lib/auth"

interface FileUploadProps {
  onExamsGenerated?: (result: ExamGenerationResult) => void
  onAnswersProvided?: (answers: Record<number, string>) => void
  providedAnswers?: Record<number, string>
  onUploadAttempt?: () => boolean
}

export function FileUpload({ onExamsGenerated, onAnswersProvided, providedAnswers, onUploadAttempt }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedDocument | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [answerInput, setAnswerInput] = useState<string>("")
  const [parsedAnswers, setParsedAnswers] = useState<Record<number, string>>({})
  const [answerError, setAnswerError] = useState<string | null>(null)
  const [settings, setSettings] = useState<ExamSettings>({
    numQuestions: 20,
    numVersions: 3,
    easyPercent: 40,
    mediumPercent: 40,
    hardPercent: 20,
    ltRatio: 0.5,
  })

  const { isAuthenticated } = useAuth()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!isAuthenticated) {
        if (onUploadAttempt) {
          onUploadAttempt()
        }
        return
      }

      const docxFile = acceptedFiles.find((file) => file.name.toLowerCase().endsWith(".docx"))
      if (docxFile) {
        setFile(docxFile)
        setIsProcessing(true)
        setProcessingError(null)
        setParsedData(null)

        try {
          const arrayBuffer = await docxFile.arrayBuffer()
          const textContent = await DocxReader.extractText(arrayBuffer)

          const validation = DocxReader.validateDocxContent(textContent)
          if (!validation.isValid) {
            throw new Error(`File không hợp lệ: ${validation.issues.join(", ")}`)
          }

          const parser = new QuestionParser()
          const parsed = parser.parseDocument(textContent)

          if (parsed.totalQuestions === 0) {
            throw new Error("Không tìm thấy câu hỏi nào trong file. Vui lòng kiểm tra định dạng.")
          }

          setParsedData(parsed)

          if (parsed.totalQuestions < settings.numQuestions) {
            setSettings((prev) => ({
              ...prev,
              numQuestions: parsed.totalQuestions,
            }))
          }

          console.log(`[v0] Successfully parsed ${parsed.totalQuestions} questions from DOCX`)
        } catch (error) {
          console.error("[v0] Error processing DOCX file:", error)
          const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định khi xử lý file"
          setProcessingError(errorMessage)
          setParsedData(null)
        } finally {
          setIsProcessing(false)
        }
      } else {
        setProcessingError("Vui lòng chọn file có định dạng .docx")
      }
    },
    [settings.numQuestions, isAuthenticated, onUploadAttempt],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
  })

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      if (onUploadAttempt) {
        onUploadAttempt()
      }
      return
    }

    if (!file || !parsedData) return

    setIsGenerating(true)

    try {
      const result = examGenerator.generateExams(parsedData, settings, providedAnswers)
      onExamsGenerated?.(result)
      console.log("Generated exams:", result)
    } catch (error) {
      console.error("Error generating exams:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const isSettingsValid = settings.easyPercent + settings.mediumPercent + settings.hardPercent === 100

  const parseAnswers = (input: string): Record<number, string> => {
    const answers: Record<number, string> = {}
    setAnswerError(null)

    if (!input.trim()) return answers

    try {
      const cleanInput = input.replace(/câu\s*/gi, "").trim()
      const pairs = cleanInput.split(",").map((s) => s.trim())

      for (const pair of pairs) {
        const match = pair.match(/^(\d+)([ABCD])$/i)
        if (match) {
          const questionNum = Number.parseInt(match[1])
          const answer = match[2].toUpperCase()
          answers[questionNum] = answer
        } else if (pair.trim()) {
          throw new Error(`Định dạng không hợp lệ: "${pair}". Sử dụng định dạng 1A,2B,3C hoặc Câu 1A, Câu 2B, Câu 3C`)
        }
      }
    } catch (error) {
      setAnswerError(error instanceof Error ? error.message : "Lỗi phân tích đáp án")
      return {}
    }

    return answers
  }

  const handleAnswerInputChange = (value: string) => {
    setAnswerInput(value)
    const parsed = parseAnswers(value)
    setParsedAnswers(parsed)
    onAnswersProvided?.(parsed)
  }

  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive text-lg">
              <AlertCircle className="h-6 w-6" />
              BẮT BUỘC ĐĂNG NHẬP
            </CardTitle>
            <CardDescription className="text-destructive/80 font-medium">
              Tất cả tính năng tải file và tạo đề thi yêu cầu đăng nhập. Vui lòng đăng nhập để tiếp tục sử dụng.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className={!isAuthenticated ? "opacity-30 pointer-events-none relative" : ""}>
        {!isAuthenticated && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="font-bold text-destructive">ĐĂNG NHẬP BẮT BUỘC</p>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Tải lên file câu hỏi
          </CardTitle>
          <CardDescription>Chọn file DOCX chứa câu hỏi trắc nghiệm của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div>
                  <p className="font-medium">Đang xử lý file DOCX...</p>
                  <p className="text-sm text-muted-foreground">Trích xuất và phân tích câu hỏi</p>
                </div>
              </div>
            ) : file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  {parsedData && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">{parsedData.totalQuestions} câu hỏi được tìm thấy</span>
                    </div>
                  )}
                  {processingError && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{processingError}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? "Thả file DOCX vào đây" : "Kéo thả file DOCX hoặc click để chọn"}
                </p>
                <p className="text-sm text-muted-foreground">Chỉ hỗ trợ file .docx chứa câu hỏi trắc nghiệm</p>
                {processingError && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{processingError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {parsedData && (
            <div className="mt-4 p-4 bg-secondary rounded-lg">
              <h4 className="font-medium mb-2">Thống kê câu hỏi</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Lý thuyết (LT):</p>
                  <div className="ml-2">
                    <p>Dễ: {parsedData.categorized.LT.Dễ.length}</p>
                    <p>TB: {parsedData.categorized.LT.TB.length}</p>
                    <p>Khó: {parsedData.categorized.LT.Khó.length}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Thực hành (TT):</p>
                  <div className="ml-2">
                    <p>Dễ: {parsedData.categorized.TT.Dễ.length}</p>
                    <p>TB: {parsedData.categorized.TT.TB.length}</p>
                    <p>Khó: {parsedData.categorized.TT.Khó.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={!isAuthenticated ? "opacity-30 pointer-events-none relative" : ""}>
        {!isAuthenticated && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="font-bold text-destructive">ĐĂNG NHẬP BẮT BUỘC</p>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Nhập đáp án
          </CardTitle>
          <CardDescription>
            Nhập đáp án cho các câu hỏi theo định dạng: 1A,2B,3C hoặc Câu 1A, Câu 2B, Câu 3C
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="answers">Đáp án</Label>
            <Textarea
              id="answers"
              placeholder="Ví dụ: 1A,2B,3C,4D,5A hoặc Câu 1A, Câu 2B, Câu 3C, Câu 4D, Câu 5A"
              value={answerInput}
              onChange={(e) => handleAnswerInputChange(e.target.value)}
              rows={3}
            />
            {answerError && (
              <div className="flex items-center gap-1 mt-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">{answerError}</span>
              </div>
            )}
          </div>

          {Object.keys(parsedAnswers).length > 0 && (
            <div className="p-3 bg-secondary rounded-lg">
              <h4 className="text-sm font-medium mb-2">Đáp án đã nhập ({Object.keys(parsedAnswers).length} câu):</h4>
              <div className="grid grid-cols-8 gap-1 text-xs">
                {Object.entries(parsedAnswers)
                  .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                  .map(([questionNum, answer]) => (
                    <div key={questionNum} className="flex items-center gap-1">
                      <span className="text-muted-foreground">{questionNum}:</span>
                      <span className="font-medium">{answer}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={!isAuthenticated ? "opacity-30 pointer-events-none relative" : ""}>
        {!isAuthenticated && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="font-bold text-destructive">ĐĂNG NHẬP BẮT BUỘC</p>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt đề thi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numQuestions">Số câu hỏi</Label>
              <Input
                id="numQuestions"
                type="number"
                value={settings.numQuestions}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    numQuestions: Number.parseInt(e.target.value) || 20,
                  }))
                }
                min="1"
                max={parsedData?.totalQuestions || 100}
              />
              {parsedData && settings.numQuestions > parsedData.totalQuestions && (
                <p className="text-xs text-destructive mt-1">Tối đa {parsedData.totalQuestions} câu</p>
              )}
            </div>
            <div>
              <Label htmlFor="numVersions">Số phiên bản</Label>
              <Input
                id="numVersions"
                type="number"
                value={settings.numVersions}
                onChange={(e) => {
                  const value = Math.min(Number.parseInt(e.target.value) || 3, 100)
                  setSettings((prev) => ({
                    ...prev,
                    numVersions: value,
                  }))
                }}
                min="1"
                max="100"
              />
              <p className="text-xs text-muted-foreground mt-1">Tối đa 100 phiên bản</p>
            </div>
          </div>

          <div>
            <Label htmlFor="ltRatio">Tỷ lệ Lý thuyết/Thực hành (%)</Label>
            <Input
              id="ltRatio"
              type="number"
              value={Math.round((settings.ltRatio || 0.5) * 100)}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  ltRatio: (Number.parseInt(e.target.value) || 50) / 100,
                }))
              }
              min="0"
              max="100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((settings.ltRatio || 0.5) * 100)}% Lý thuyết,{" "}
              {Math.round((1 - (settings.ltRatio || 0.5)) * 100)}% Thực hành
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Tỷ lệ độ khó (%)</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="easy" className="text-xs">
                  Dễ
                </Label>
                <Input
                  id="easy"
                  type="number"
                  value={settings.easyPercent}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      easyPercent: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="medium" className="text-xs">
                  Trung bình
                </Label>
                <Input
                  id="medium"
                  type="number"
                  value={settings.mediumPercent}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      mediumPercent: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="hard" className="text-xs">
                  Khó
                </Label>
                <Input
                  id="hard"
                  type="number"
                  value={settings.hardPercent}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      hardPercent: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>
            {!isSettingsValid && (
              <div className="flex items-center gap-1 mt-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">Tổng tỷ lệ phải bằng 100%</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!isAuthenticated || !file || !parsedData || !isSettingsValid || isProcessing || isGenerating}
            size="lg"
            className="w-full"
          >
            {!isAuthenticated ? (
              "Đăng nhập để tạo đề thi"
            ) : isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo đề thi...
              </>
            ) : isProcessing ? (
              "Đang xử lý..."
            ) : (
              "Tạo đề thi"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
