import type { Question, ParsedDocument } from "./question-parser"

export interface ExamSettings {
  numQuestions: number
  numVersions: number
  easyPercent: number
  mediumPercent: number
  hardPercent: number
  ltRatio?: number // Tỷ lệ câu lý thuyết vs thực hành (mặc định 0.5)
}

export interface GeneratedExam {
  id: string
  questions: Question[]
  version: number
  metadata: {
    totalQuestions: number
    difficulty: {
      easy: number
      medium: number
      hard: number
    }
    type: {
      lt: number
      tt: number
    }
  }
}

export interface ExamGenerationResult {
  exams: GeneratedExam[]
  settings: ExamSettings
  sourceStats: {
    totalQuestions: number
    categorized: ParsedDocument["categorized"]
  }
}

export class ExamGenerator {
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private selectQuestionsFromPool(pool: Question[], needed: number): Question[] {
    if (pool.length <= needed) {
      return [...pool]
    }
    return this.shuffleArray(pool).slice(0, needed)
  }

  private generateSingleExam(
    categorized: ParsedDocument["categorized"],
    settings: ExamSettings,
    version: number,
    allQuestions: Question[],
    providedAnswers?: Record<number, string>,
  ): GeneratedExam {
    const { numQuestions, easyPercent, mediumPercent, hardPercent, ltRatio = 0.5 } = settings
    const exam: Question[] = []

    // Check if we have sufficient categories
    const hasCategories = this.hasSufficientCategories(categorized)

    if (hasCategories) {
      // Calculate number of questions by type and difficulty
      const totalLT = Math.round(numQuestions * ltRatio)
      const totalTT = numQuestions - totalLT

      const difficultyRatio = [easyPercent / 100, mediumPercent / 100, hardPercent / 100]

      // Generate questions for each type (LT, TT)
      for (const [qtype, count] of [
        ["LT", totalLT],
        ["TT", totalTT],
      ] as const) {
        for (const [index, difficulty] of (["Dễ", "TB", "Khó"] as const).entries()) {
          const needed = Math.round(count * difficultyRatio[index])
          const pool = categorized[qtype][difficulty]
          const selected = this.selectQuestionsFromPool(pool, needed)
          exam.push(...selected)
        }
      }

      // If not enough questions, supplement from all remaining questions
      if (exam.length < numQuestions) {
        const remaining = allQuestions.filter((q) => !exam.includes(q))
        const additional = this.selectQuestionsFromPool(remaining, numQuestions - exam.length)
        exam.push(...additional)
      }
    } else {
      // If no clear categorization, select randomly
      const selected = this.selectQuestionsFromPool(allQuestions, numQuestions)
      exam.push(...selected)
    }

    // Shuffle question order
    const shuffledExam = this.shuffleArray(exam).slice(0, numQuestions)

    if (providedAnswers) {
      shuffledExam.forEach((question, index) => {
        const questionNumber = index + 1
        if (providedAnswers[questionNumber]) {
          question.correct = providedAnswers[questionNumber]
        }
      })
    }

    // Calculate metadata
    const metadata = this.calculateExamMetadata(shuffledExam)

    return {
      id: `exam-${version}-${Date.now()}`,
      questions: shuffledExam,
      version,
      metadata,
    }
  }

  private hasSufficientCategories(categorized: ParsedDocument["categorized"]): boolean {
    // Check if we have at least one question in each category
    const ltTotal = categorized.LT.Dễ.length + categorized.LT.TB.length + categorized.LT.Khó.length
    const ttTotal = categorized.TT.Dễ.length + categorized.TT.TB.length + categorized.TT.Khó.length

    return ltTotal > 0 && ttTotal > 0
  }

  private calculateExamMetadata(questions: Question[]) {
    const difficulty = { easy: 0, medium: 0, hard: 0 }
    const type = { lt: 0, tt: 0 }

    for (const question of questions) {
      // Count difficulty
      switch (question.difficulty) {
        case "Dễ":
          difficulty.easy++
          break
        case "TB":
          difficulty.medium++
          break
        case "Khó":
          difficulty.hard++
          break
      }

      // Count type
      switch (question.type) {
        case "LT":
          type.lt++
          break
        case "TT":
          type.tt++
          break
      }
    }

    return {
      totalQuestions: questions.length,
      difficulty,
      type,
    }
  }

  generateExams(
    parsedData: ParsedDocument,
    settings: ExamSettings,
    providedAnswers?: Record<number, string>,
  ): ExamGenerationResult {
    const { questions, categorized } = parsedData
    const { numVersions } = settings

    if (questions.length === 0) {
      throw new Error("Không có câu hỏi nào để tạo đề thi")
    }

    if (settings.numQuestions > questions.length) {
      throw new Error(`Không đủ câu hỏi. Có ${questions.length} câu, yêu cầu ${settings.numQuestions} câu`)
    }

    const exams: GeneratedExam[] = []

    for (let version = 1; version <= numVersions; version++) {
      const exam = this.generateSingleExam(categorized, settings, version, questions, providedAnswers)
      exams.push(exam)
    }

    return {
      exams,
      settings,
      sourceStats: {
        totalQuestions: questions.length,
        categorized,
      },
    }
  }

  // Create preview for an exam
  generatePreview(parsedData: ParsedDocument, settings: ExamSettings): GeneratedExam | null {
    try {
      const result = this.generateExams(parsedData, { ...settings, numVersions: 1 })
      return result.exams[0] || null
    } catch (error) {
      console.error("Error generating preview:", error)
      return null
    }
  }
}

// Export singleton instance
export const examGenerator = new ExamGenerator()
