import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, Info, FileText, Settings, Download, CheckCircle } from "lucide-react"

export function GuideSection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-balance mb-4">Hướng dẫn & Giới thiệu</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Tìm hiểu cách sử dụng ExamGen và các tính năng của hệ thống
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Hướng dẫn sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">1. Chuẩn bị file DOCX</h4>
                  <p className="text-sm text-muted-foreground">
                    File phải chứa câu hỏi trắc nghiệm với định dạng: "Câu 1: Nội dung câu hỏi" theo sau là các đáp án
                    A, B, C, D. Mỗi câu hỏi nên được đánh số rõ ràng và các đáp án được sắp xếp theo thứ tự.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">2. Nhập đáp án (tùy chọn)</h4>
                  <p className="text-sm text-muted-foreground">
                    Nhập đáp án theo định dạng: "1A,2B,3C" hoặc "Câu 1A, Câu 2B, Câu 3C" để tạo file đáp án chính xác.
                    Nếu không nhập, hệ thống sẽ tạo đề thi mà không có đáp án kèm theo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">3. Cài đặt đề thi</h4>
                  <p className="text-sm text-muted-foreground">
                    Chọn số câu hỏi muốn có trong mỗi đề thi, số phiên bản (tối đa 100), tỷ lệ độ khó (dễ/trung
                    bình/khó) và tỷ lệ lý thuyết/thực hành phù hợp với yêu cầu của bạn.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">4. Tạo và tải xuống</h4>
                  <p className="text-sm text-muted-foreground">
                    Nhấn "Tạo đề thi" và chờ hệ thống xử lý. Sau đó tải xuống gói ZIP chứa tất cả đề thi và đáp án được
                    định dạng sẵn, sẵn sàng để in và sử dụng.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium text-sm mb-2">Lưu ý quan trọng:</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• File DOCX phải có định dạng rõ ràng, không chứa ký tự đặc biệt</li>
                <li>• Mỗi câu hỏi nên có đúng 4 đáp án A, B, C, D</li>
                <li>• Số câu hỏi trong file phải đủ để tạo số đề thi yêu cầu</li>
                <li>• Hệ thống hỗ trợ tối đa 100 phiên bản đề thi</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Giới thiệu hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">ExamGen</strong> là hệ thống tạo đề thi trắc nghiệm tự động được phát
              triển dành riêng cho giáo viên và cán bộ giáo dục Việt Nam, giúp tiết kiệm thời gian và nâng cao chất
              lượng đánh giá.
            </p>

            <p className="text-sm text-muted-foreground">
              Với công nghệ AI tiên tiến, hệ thống giúp bạn tạo ra nhiều phiên bản đề thi khác nhau từ một bộ câu hỏi,
              đảm bảo tính công bằng và chống gian lận trong các kỳ thi, kiểm tra.
            </p>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Tính năng nổi bật:</h5>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Tạo nhiều phiên bản đề thi tự động</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Phân loại câu hỏi theo độ khó và loại</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Xuất file Word và PDF chuyên nghiệp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Tạo đáp án tự động theo đề thi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Bảo mật dữ liệu tuyệt đối</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Giao diện thân thiện, dễ sử dụng</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h5 className="font-medium text-sm mb-2 text-primary">Cam kết của chúng tôi:</h5>
              <p className="text-sm text-muted-foreground">
                ExamGen được phát triển với mục tiêu hỗ trợ giáo dục Việt Nam, giúp các thầy cô giáo tiết kiệm thời gian
                trong việc chuẩn bị đề thi và tập trung vào việc giảng dạy. Chúng tôi cam kết không ngừng cải tiến để
                mang lại trải nghiệm tốt nhất cho người dùng.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Hỗ trợ kỹ thuật:</h5>
              <p className="text-sm text-muted-foreground">
                Nếu gặp khó khăn trong quá trình sử dụng, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi. Chúng tôi
                luôn sẵn sàng giúp đỡ để bạn có thể sử dụng hệ thống một cách hiệu quả nhất.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
