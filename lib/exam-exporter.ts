import JSZip from "jszip"
import { saveAs } from "file-saver"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import type { GeneratedExam } from "./exam-generator"

export interface ExportOptions {
  format: "txt" | "docx"
  includeAnswers: boolean
  separateAnswerSheet: boolean
  includeStatistics: boolean
}

export interface ExportProgress {
  current: number
  total: number
  status: string
}

export class ExamExporter {
  private formatQuestionText(question: string, index: number): string {
    return `${index}. ${question}`
  }

  private formatOption(letter: string, text: string, isCorrect = false): string {
    const prefix = isCorrect ? `*${letter}` : letter
    return `${prefix}. ${text}`
  }

  exportToText(exam: GeneratedExam, options: ExportOptions): string {
    let content = `ĐỀ THI PHIÊN BẢN ${exam.version}\n`
    content += `Tổng số câu: ${exam.metadata.totalQuestions}\n`
    content += `Thời gian làm bài: 60 phút\n`
    content += `Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}\n`
    content += "=" + "=".repeat(50) + "\n\n"

    exam.questions.forEach((question, index) => {
      content += this.formatQuestionText(question.question, index + 1) + "\n"

      Object.entries(question.options).forEach(([letter, text]) => {
        const isCorrect = options.includeAnswers && question.correct === letter
        content += this.formatOption(letter, text, isCorrect) + "\n"
      })

      content += "\n"
    })

    return content
  }

  exportAnswerSheet(exam: GeneratedExam): string {
    let content = `ĐÁP ÁN ĐỀ THI PHIÊN BẢN ${exam.version}\n`
    content += `Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}\n`
    content += "=" + "=".repeat(30) + "\n\n"

    // Tạo bảng đáp án dạng lưới
    const questionsPerRow = 5
    const totalQuestions = exam.questions.length

    for (let i = 0; i < totalQuestions; i += questionsPerRow) {
      // Header row (question numbers)
      let headerRow = ""
      let answerRow = ""

      for (let j = 0; j < questionsPerRow && i + j < totalQuestions; j++) {
        const questionNum = i + j + 1
        const answer = exam.questions[i + j].correct || "?"

        headerRow += `Câu ${questionNum.toString().padStart(2, "0")}`.padEnd(8)
        answerRow += `${answer}`.padEnd(8)
      }

      content += headerRow + "\n"
      content += answerRow + "\n\n"
    }

    // Thống kê đáp án
    content += "\nTHỐNG KÊ ĐÁP ÁN:\n"
    const answerStats = { A: 0, B: 0, C: 0, D: 0 }
    exam.questions.forEach((q) => {
      if (q.correct && q.correct in answerStats) {
        answerStats[q.correct as keyof typeof answerStats]++
      }
    })

    Object.entries(answerStats).forEach(([letter, count]) => {
      const percentage = ((count / totalQuestions) * 100).toFixed(1)
      content += `${letter}: ${count} câu (${percentage}%)\n`
    })

    return content
  }

  exportStatistics(exams: GeneratedExam[]): string {
    let content = `THỐNG KÊ TỔNG QUAN CÁC ĐỀ THI\n`
    content += `Số lượng đề: ${exams.length}\n`
    content += `Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}\n`
    content += "=" + "=".repeat(40) + "\n\n"

    exams.forEach((exam) => {
      content += `ĐỀ ${exam.version}:\n`
      content += `  Tổng câu hỏi: ${exam.metadata.totalQuestions}\n`
      content += `  Độ khó - Dễ: ${exam.metadata.difficulty.easy}, TB: ${exam.metadata.difficulty.medium}, Khó: ${exam.metadata.difficulty.hard}\n`
      content += `  Loại - LT: ${exam.metadata.type.lt}, TT: ${exam.metadata.type.tt}\n\n`
    })

    // Thống kê chung
    const totalQuestions = exams.reduce((sum, exam) => sum + exam.metadata.totalQuestions, 0)
    const avgEasy = exams.reduce((sum, exam) => sum + exam.metadata.difficulty.easy, 0) / exams.length
    const avgMedium = exams.reduce((sum, exam) => sum + exam.metadata.difficulty.medium, 0) / exams.length
    const avgHard = exams.reduce((sum, exam) => sum + exam.metadata.difficulty.hard, 0) / exams.length

    content += `TRUNG BÌNH:\n`
    content += `  Câu dễ: ${avgEasy.toFixed(1)}\n`
    content += `  Câu TB: ${avgMedium.toFixed(1)}\n`
    content += `  Câu khó: ${avgHard.toFixed(1)}\n`

    return content
  }

  // Tạo file ZIP chứa tất cả các đề thi
  async createExamPackage(
    exams: GeneratedExam[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void,
  ): Promise<Blob> {
    const zip = new JSZip()
    const total = exams.length * (options.separateAnswerSheet ? 2 : 1) + (options.includeStatistics ? 1 : 0)
    let current = 0

    // Tạo thư mục cho đề thi
    const examFolder = zip.folder("de-thi")
    const answerFolder = options.separateAnswerSheet ? zip.folder("dap-an") : null

    for (const exam of exams) {
      // Tạo file đề thi
      onProgress?.({ current: ++current, total, status: `Tạo đề ${exam.version}...` })

      if (options.format === "docx") {
        // Export as DOCX
        const examBlob = await this.exportToDocx(exam, { ...options, includeAnswers: false })
        const examBuffer = await examBlob.arrayBuffer()
        examFolder?.file(`De${exam.version.toString().padStart(2, "0")}.docx`, examBuffer)
      } else {
        // Export as TXT (existing functionality)
        const examContent = this.exportToText(exam, { ...options, includeAnswers: false })
        examFolder?.file(`De${exam.version.toString().padStart(2, "0")}.txt`, examContent)
      }

      // Tạo file đáp án riêng nếu cần
      if (options.separateAnswerSheet) {
        onProgress?.({ current: ++current, total, status: `Tạo đáp án đề ${exam.version}...` })

        if (options.format === "docx") {
          const answerBlob = await this.exportAnswerSheetDocx(exam)
          const answerBuffer = await answerBlob.arrayBuffer()
          answerFolder?.file(`DapAn${exam.version.toString().padStart(2, "0")}.docx`, answerBuffer)
        } else {
          const answerContent = this.exportAnswerSheet(exam)
          answerFolder?.file(`DapAn${exam.version.toString().padStart(2, "0")}.txt`, answerContent)
        }
      }

      // Delay nhỏ để UI có thể cập nhật
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    // Tạo file thống kê nếu cần
    if (options.includeStatistics) {
      onProgress?.({ current: ++current, total, status: "Tạo file thống kê..." })

      const statsContent = this.exportStatistics(exams)
      zip.file("ThongKe.txt", statsContent)
    }

    // Tạo file README
    const fileExtension = options.format === "docx" ? ".docx" : ".txt"
    const readmeContent = `HƯỚNG DẪN SỬ DỤNG\n\nGói đề thi này bao gồm:\n- ${exams.length} đề thi (${fileExtension}) trong thư mục 'de-thi/'\n${
      options.separateAnswerSheet ? `- Đáp án tương ứng (${fileExtension}) trong thư mục 'dap-an/'\n` : ""
    }${options.includeStatistics ? "- File thống kê 'ThongKe.txt'\n" : ""}\n\nNgày tạo: ${new Date().toLocaleString(
      "vi-VN",
    )}\nTạo bởi: ExamGen - Hệ thống tạo đề thi tự động`

    zip.file("README.txt", readmeContent)

    onProgress?.({ current: total, total, status: "Hoàn thành!" })

    return await zip.generateAsync({ type: "blob" })
  }

  // Download file đơn lẻ
  downloadFile(content: string, filename: string, mimeType = "text/plain") {
    const blob = new Blob([content], { type: mimeType })
    saveAs(blob, filename)
  }

  // Download package ZIP
  async downloadExamPackage(
    exams: GeneratedExam[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void,
  ) {
    try {
      const blob = await this.createExamPackage(exams, options, onProgress)
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
      const filename = `DeThiTuDong_${timestamp}_${exams.length}de.zip`

      saveAs(blob, filename)
    } catch (error) {
      console.error("Error creating exam package:", error)
      throw new Error("Không thể tạo gói đề thi. Vui lòng thử lại.")
    }
  }

  // Preview ZIP contents
  async getPackagePreview(exams: GeneratedExam[], options: ExportOptions): Promise<string[]> {
    const files: string[] = []
    const extension = options.format === "docx" ? ".docx" : ".txt" // Use correct extension

    files.push("README.txt")

    exams.forEach((exam) => {
      files.push(`de-thi/De${exam.version.toString().padStart(2, "0")}${extension}`)
      if (options.separateAnswerSheet) {
        files.push(`dap-an/DapAn${exam.version.toString().padStart(2, "0")}${extension}`)
      }
    })

    if (options.includeStatistics) {
      files.push("ThongKe.txt")
    }

    return files.sort()
  }

  async exportToDocx(exam: GeneratedExam, options: ExportOptions): Promise<Blob> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: `ĐỀ THI PHIÊN BẢN ${exam.version}`,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Tổng số câu: ${exam.metadata.totalQuestions}`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Thời gian làm bài: 60 phút`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "=" + "=".repeat(50),
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }), // Empty line

            // Questions
            ...exam.questions.flatMap((question, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${question.question}`,
                    bold: true,
                    size: 24,
                  }),
                ],
              }),

              ...Object.entries(question.options).map(([letter, text]) => {
                const isCorrect = options.includeAnswers && question.correct === letter
                return new Paragraph({
                  children: [
                    new TextRun({
                      text: `${isCorrect ? "*" : ""}${letter}. ${text}`,
                      bold: isCorrect,
                      size: 22,
                    }),
                  ],
                })
              }),

              new Paragraph({ text: "" }), // Empty line after each question
            ]),
          ],
        },
      ],
    })

    return await Packer.toBlob(doc)
  }

  async exportAnswerSheetDocx(exam: GeneratedExam): Promise<Blob> {
    const questionsPerRow = 5
    const totalQuestions = exam.questions.length
    const rows: Paragraph[] = []

    // Create answer grid
    for (let i = 0; i < totalQuestions; i += questionsPerRow) {
      // Header row (question numbers)
      let headerText = ""
      let answerText = ""

      for (let j = 0; j < questionsPerRow && i + j < totalQuestions; j++) {
        const questionNum = i + j + 1
        const answer = exam.questions[i + j].correct || "?"

        headerText += `Câu ${questionNum.toString().padStart(2, "0")}`.padEnd(8)
        answerText += `${answer}`.padEnd(8)
      }

      rows.push(
        new Paragraph({
          children: [new TextRun({ text: headerText, font: "Courier New" })],
        }),
        new Paragraph({
          children: [new TextRun({ text: answerText, font: "Courier New", bold: true })],
        }),
        new Paragraph({ text: "" }),
      )
    }

    // Statistics
    const answerStats = { A: 0, B: 0, C: 0, D: 0 }
    exam.questions.forEach((q) => {
      if (q.correct && q.correct in answerStats) {
        answerStats[q.correct as keyof typeof answerStats]++
      }
    })

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `ĐÁP ÁN ĐỀ THI PHIÊN BẢN ${exam.version}`,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "=" + "=".repeat(30),
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            ...rows,

            new Paragraph({
              children: [
                new TextRun({
                  text: "THỐNG KÊ ĐÁP ÁN:",
                  bold: true,
                  size: 24,
                }),
              ],
            }),

            ...Object.entries(answerStats).map(([letter, count]) => {
              const percentage = ((count / totalQuestions) * 100).toFixed(1)
              return new Paragraph({
                children: [
                  new TextRun({
                    text: `${letter}: ${count} câu (${percentage}%)`,
                    size: 22,
                  }),
                ],
              })
            }),
          ],
        },
      ],
    })

    return await Packer.toBlob(doc)
  }
}

export const examExporter = new ExamExporter()
