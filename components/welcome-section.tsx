"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, FileText, Zap, Shield, Users, ArrowRight, CheckCircle } from "lucide-react"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/lib/auth" // điều chỉnh import theo dự án của bạn

export function WelcomeSection() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const openAuth = () => setShowAuthModal(true)
  const closeAuth = () => setShowAuthModal(false)

  const handleStart = () => {
    if (isLoading) return
    if (isAuthenticated)
      router.push("/app") // đổi route nếu cần
    else openAuth()
  }

  const handleSeeGuide = () => router.push("/huong-dan") // đổi route nếu cần
  const handleLoginNow = () => {
    if (isLoading) return
    if (isAuthenticated) router.push("/app")
    else openAuth()
  }

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Nền tảng tạo đề thi thông minh
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold text-balance mb-6 
               bg-gradient-to-r from-foreground to-foreground/70 
               bg-clip-text text-transparent leading-[1.2]"
            >
              Tạo Đề Thi Ngẫu Nhiên
              <br />
              <span className="text-primary">Một Cách Tự Động</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
              Tải lên file DOCX chứa câu hỏi và tạo nhiều phiên bản đề thi khác nhau chỉ trong vài giây. Tiết kiệm thời
              gian, tăng hiệu quả giảng dạy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" onClick={handleStart} disabled={isLoading}>
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-secondary animate-pulse" />
                    Đang kiểm tra phiên…
                  </span>
                ) : (
                  <>
                    Bắt Đầu Ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" onClick={handleSeeGuide}>
                Xem Hướng Dẫn
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Tải File DOCX</h3>
                <p className="text-muted-foreground">
                  Hỗ trợ định dạng chuẩn Microsoft Word với câu hỏi và đáp án được cấu trúc rõ ràng
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Tạo Đề Tự Động</h3>
                <p className="text-muted-foreground">
                  Thuật toán thông minh tạo ra nhiều phiên bản đề thi khác nhau từ cùng một bộ câu hỏi
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Lưu Trữ An Toàn</h3>
                <p className="text-muted-foreground">
                  Dữ liệu được bảo mật, chỉ bạn có thể truy cập và quản lý đề thi của mình
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Tại Sao Chọn ExamGen?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Tiết Kiệm Thời Gian</h4>
                      <p className="text-muted-foreground">Tạo hàng chục đề thi trong vài phút thay vì hàng giờ</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Đảm Bảo Công Bằng</h4>
                      <p className="text-muted-foreground">Mỗi học sinh nhận đề khác nhau nhưng cùng độ khó</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Dễ Sử Dụng</h4>
                      <p className="text-muted-foreground">Giao diện đơn giản, không cần kiến thức kỹ thuật</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Xuất File Đa Dạng</h4>
                      <p className="text-muted-foreground">Hỗ trợ xuất PDF, DOCX với nhiều tuỳ chọn định dạng</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-card rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="font-semibold">Thống kê đề thi</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Số phiên bản:</div>
                      <div className="text-2xl font-bold text-primary">5</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Câu hỏi/đề:</div>
                      <div className="text-2xl font-bold text-primary">25</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Độ khó:</div>
                      <div className="text-sm">
                        <span className="text-green-600">Dễ: 8</span> •<span className="text-yellow-600"> TB: 12</span>{" "}
                        •<span className="text-red-600"> Khó: 5</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Thời gian:</div>
                      <div className="text-2xl font-bold text-primary">90p</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-4">Sẵn Sàng Bắt Đầu?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Đăng nhập ngay để trải nghiệm tính năng tạo đề thi tự động
            </p>
            <Button size="lg" className="text-lg px-12 py-6" onClick={handleLoginNow} disabled={isLoading}>
              <Users className="mr-2 h-5 w-5" />
              {isLoading ? "Đang kiểm tra phiên…" : "Đăng Nhập Ngay"}
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={closeAuth} />
    </>
  )
}
