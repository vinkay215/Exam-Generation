import mammoth from "mammoth"

export class DocxReader {
  static async readFile(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      return await this.extractText(arrayBuffer)
    } catch (error) {
      console.error("Error reading DOCX file:", error)
      throw new Error("Không thể đọc file DOCX. Vui lòng kiểm tra file có đúng định dạng không.")
    }
  }

  static async extractText(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      // Use mammoth.js to extract text from DOCX
      const result = await mammoth.extractRawText({ arrayBuffer })

      if (result.messages && result.messages.length > 0) {
        console.warn("DOCX parsing warnings:", result.messages)
      }

      // Clean up the extracted text
      let text = result.value

      // Normalize line breaks and remove excessive whitespace
      text = text.replace(/\r\n/g, "\n")
      text = text.replace(/\r/g, "\n")
      text = text.replace(/\n\s*\n/g, "\n\n")
      text = text.trim()

      if (!text) {
        throw new Error("File DOCX trống hoặc không có nội dung text")
      }

      return text
    } catch (error) {
      console.error("Error extracting text from DOCX:", error)
      throw new Error("Không thể trích xuất nội dung từ file DOCX. Vui lòng kiểm tra file có đúng định dạng không.")
    }
  }

  // Helper method to validate DOCX content structure
  static validateDocxContent(content: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = []

    // Check if content contains question patterns
    const questionPattern = /câu\s*\d+/i
    if (!questionPattern.test(content)) {
      issues.push("Không tìm thấy câu hỏi nào trong file")
    }

    // Check if content contains options (A, B, C, D)
    const optionPattern = /[A-D]\./
    if (!optionPattern.test(content)) {
      issues.push("Không tìm thấy các lựa chọn A, B, C, D")
    }

    // Check minimum content length
    if (content.length < 100) {
      issues.push("Nội dung file quá ngắn")
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  }
}
