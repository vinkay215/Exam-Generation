import { DocxReader } from "./docx-reader" // Assuming DocxReader is imported from another file

export interface Question {
  question: string
  options: Record<string, string>
  correct: string | null
  difficulty: "Dễ" | "TB" | "Khó" | "Không rõ"
  type: "LT" | "TT" | "Không rõ"
}

export interface ParsedDocument {
  questions: Question[]
  totalQuestions: number
  categorized: {
    LT: { Dễ: Question[]; TB: Question[]; Khó: Question[] }
    TT: { Dễ: Question[]; TB: Question[]; Khó: Question[] }
  }
}

export class QuestionParser {
  private questionRegex = /^Câu\s*(\d+)[:.]?\s*(.*?)(?:\s*$$(.*?)$$)?\s*(?:$$(.*?)$$)?\s*$/i
  private optionRegex = /^(\*?)([A-D])\.\s*(.*)/
  private answerRegex = /^(?:Đáp\s*án|Answer)[:.]?\s*([A-D])/i
  private difficultyRegex = /\b(Dễ|TB|Khó|Easy|Medium|Hard)\b/i
  private typeRegex = /\b(LT|TT|Theory|Practice)\b/i

  parseLines(lines: string[]): Question[] {
    const questions: Question[] = []
    let currentQuestion: Partial<Question> | null = null
    let questionBuffer = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Check for question start
      const questionMatch = line.match(this.questionRegex)
      if (questionMatch) {
        // Save previous question if exists
        if (currentQuestion && this.isValidQuestion(currentQuestion)) {
          questions.push(currentQuestion as Question)
        }

        // Start new question
        const questionNumber = questionMatch[1]
        let questionText = questionMatch[2]?.trim() || ""
        const metadata1 = questionMatch[3] || ""
        const metadata2 = questionMatch[4] || ""

        // Extract difficulty and type from metadata or question text
        const fullText = `${questionText} ${metadata1} ${metadata2}`
        const difficultyMatch = fullText.match(this.difficultyRegex)
        const typeMatch = fullText.match(this.typeRegex)

        const difficulty = this.normalizeDifficulty(difficultyMatch?.[1] || "Không rõ")
        const type = this.normalizeType(typeMatch?.[1] || "Không rõ")

        // Clean question text from metadata
        questionText = questionText
          .replace(this.difficultyRegex, "")
          .replace(this.typeRegex, "")
          .replace(/$$[^)]*$$/g, "")
          .trim()

        currentQuestion = {
          question: questionText,
          options: {},
          correct: null,
          difficulty,
          type,
        }
        questionBuffer = ""
        continue
      }

      // Check for options
      const optionMatch = line.match(this.optionRegex)
      if (optionMatch && currentQuestion) {
        const isCorrect = !!optionMatch[1] // Check for asterisk
        const letter = optionMatch[2]
        const text = optionMatch[3].trim()

        if (!currentQuestion.options) currentQuestion.options = {}
        currentQuestion.options[letter] = text

        // Mark as correct if asterisk is present
        if (isCorrect) {
          currentQuestion.correct = letter
        }
        continue
      }

      // Check for answer line
      const answerMatch = line.match(this.answerRegex)
      if (answerMatch && currentQuestion) {
        const answerLetter = answerMatch[1].toUpperCase()
        if (["A", "B", "C", "D"].includes(answerLetter)) {
          currentQuestion.correct = answerLetter
        }
        continue
      }

      // If none of the above, append to current question text or buffer
      if (currentQuestion && !optionMatch && !answerMatch) {
        if (Object.keys(currentQuestion.options || {}).length === 0) {
          // Still building question text
          currentQuestion.question += " " + line
        } else {
          // Might be additional content, store in buffer
          questionBuffer += " " + line
        }
      }
    }

    // Don't forget the last question
    if (currentQuestion && this.isValidQuestion(currentQuestion)) {
      questions.push(currentQuestion as Question)
    }

    return questions
  }

  private normalizeDifficulty(difficulty: string): Question["difficulty"] {
    const normalized = difficulty.toLowerCase()
    if (normalized.includes("dễ") || normalized.includes("easy")) return "Dễ"
    if (normalized.includes("tb") || normalized.includes("medium") || normalized.includes("trung bình")) return "TB"
    if (normalized.includes("khó") || normalized.includes("hard")) return "Khó"
    return "Không rõ"
  }

  private normalizeType(type: string): Question["type"] {
    const normalized = type.toLowerCase()
    if (normalized.includes("lt") || normalized.includes("theory") || normalized.includes("lý thuyết")) return "LT"
    if (normalized.includes("tt") || normalized.includes("practice") || normalized.includes("thực hành")) return "TT"
    return "Không rõ"
  }

  private isValidQuestion(question: Partial<Question>): question is Question {
    return !!(
      question.question &&
      question.question.trim().length > 0 &&
      question.options &&
      Object.keys(question.options).length >= 2 &&
      question.difficulty &&
      question.type
    )
  }

  categorizeQuestions(questions: Question[]): ParsedDocument["categorized"] {
    const categorized: ParsedDocument["categorized"] = {
      LT: { Dễ: [], TB: [], Khó: [] },
      TT: { Dễ: [], TB: [], Khó: [] },
    }

    for (const question of questions) {
      const type = question.type === "LT" || question.type === "TT" ? question.type : "LT"
      const difficulty = ["Dễ", "TB", "Khó"].includes(question.difficulty)
        ? (question.difficulty as "Dễ" | "TB" | "Khó")
        : "Dễ"

      categorized[type][difficulty].push(question)
    }

    return categorized
  }

  parseDocument(content: string): ParsedDocument {
    try {
      // Validate content first
      const validation = DocxReader.validateDocxContent(content)
      if (!validation.isValid) {
        console.warn("DOCX content validation issues:", validation.issues)
      }

      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      const questions = this.parseLines(lines)

      if (questions.length === 0) {
        throw new Error("Không tìm thấy câu hỏi nào trong file. Vui lòng kiểm tra định dạng file.")
      }

      const categorized = this.categorizeQuestions(questions)

      console.log(`Parsed ${questions.length} questions from DOCX`)

      return {
        questions,
        totalQuestions: questions.length,
        categorized,
      }
    } catch (error) {
      console.error("Error parsing document:", error)
      throw error
    }
  }
}
