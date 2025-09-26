# 🎓 Exam Generation

![Exam-Generation Banner](https://img.shields.io/badge/Exam%20Auto%20Generator-v0-blue?style=for-the-badge)
![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&style=for-the-badge)
![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&style=for-the-badge)

---

## 🌄 Xem trước giao diện

<p align="center">
  <img src="https://raw.githubusercontent.com/vinkay215/Exam-Generation/25c9c77432aabbd8db470ae620356a9f6592860c/IMG/Preview.png" alt="Exam-Generation Preview" width="720"/>
</p>
<p align="center">
  <img src="https://github.com/vinkay215/Exam-Generation/blob/5b5f8acb6cf5c70f6da842b99acc5ae53f980ab3/IMG/Admin.png?raw=true" alt="Admin Panel Preview" width="360"/>
  <img src="https://github.com/vinkay215/Exam-Generation/blob/5b5f8acb6cf5c70f6da842b99acc5ae53f980ab3/IMG/Database.png?raw=true" alt="Database Preview" width="360"/>
</p>

---

## 📦 Giới thiệu

**Exam-Generation** là dự án cá nhân hỗ trợ giáo viên, trường học và các đơn vị giáo dục tự động tạo đề thi nhanh chóng, chuyên nghiệp và tiết kiệm thời gian. Dự án giúp quản lý đề thi dễ dàng trên nền tảng cloud MongoDB Atlas và triển khai tức thì trên Vercel.

> ⚡️ **Dự án vẫn đang hoàn thiện. Nếu bạn phát hiện lỗi hoặc có ý tưởng hay, hãy góp ý hoặc tạo Issue để mình cải thiện hệ thống tốt hơn!**
>
> ❤️ Mỗi góp ý, đóng góp đều là động lực để mình phát triển sản phẩm hữu ích cho cộng đồng.

---

## ⚙️ Cách hoạt động

1. **Nhập tiêu chí đề thi:** Người dùng nhập các tiêu chí (số lượng câu hỏi, dạng đề, mức độ khó...).
2. **Sinh đề tự động:** Hệ thống lấy dữ liệu ngân hàng câu hỏi từ MongoDB, xử lý và sinh đề phù hợp.
3. **Lưu trữ & Quản lý:** Đề thi và lịch sử tạo đề được lưu trên MongoDB Atlas.
4. **Truy cập qua Web:** Tất cả thao tác thực hiện qua giao diện web đã deploy trên Vercel, sử dụng mọi nơi.

---

## 🚀 Hướng dẫn deploy trên Vercel

### 1. Fork hoặc clone dự án

```bash
git clone https://github.com/vinkay215/Exam-Generation.git
```

### 2. Đăng ký tài khoản [Vercel](https://vercel.com/signup) và đăng nhập.

### 3. Deploy

- Truy cập [Vercel Dashboard](https://vercel.com/dashboard).
- Chọn **"Add New Project"** > **"Import Git Repository"**.
- Kết nối với repo vừa fork/clone.
- Ở phần **Environment Variables** nhập:
  - `MONGO_URI`: Chuỗi kết nối MongoDB (hướng dẫn bên dưới)
  - Các biến khác nếu dự án yêu cầu (xem `.env.example` hoặc tài liệu dự án).

- Bấm **Deploy** và chờ hệ thống hoàn tất.

---

## 🗄️ Hướng dẫn đăng ký MongoDB Atlas & Lấy KEY

### 1. Đăng ký tài khoản MongoDB Atlas

- Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
- Đăng ký bằng email hoặc Google.

### 2. Tạo Cluster miễn phí

- Chọn **"Build a Database"** > **"Shared"** > **"Create"**.
- Chọn Cloud Provider, Region tuỳ ý.

### 3. Tạo User và Mật khẩu

- Vào mục **Database Access** > **Add New Database User**.
- Chọn **Password** và nhập username/password tuỳ ý.
- Cấp quyền **Read and Write to any database**.
- Lưu lại thông tin này.

### 4. Thêm địa chỉ IP truy cập

- Vào **Network Access** > **Add IP Address**.
- Nhập IP máy bạn hoặc chọn **"Add My Current IP Address"**.
- Bấm **Confirm**.

**Lưu ý:** Chỉ thêm IP tin cậy để bảo vệ dữ liệu.

### 5. Lấy chuỗi kết nối (Connection String/KEY)

- Vào **Clusters** > **Connect** > **Connect your application**.
- Copy dòng **Connection String** dạng:

  ```
  mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<dbname>?retryWrites=true&w=majority
  ```

  - Thay `<username>`, `<password>`, `<cluster-name>`, `<dbname>` bằng thông tin bạn.

- Dán chuỗi này vào biến môi trường `MONGO_URI` khi deploy trên Vercel.

---

## 🗂️ Ví dụ file `.env`

```env
MONGO_URI=mongodb+srv://your_user:your_pass@yourcluster.mongodb.net/yourdb?retryWrites=true&w=majority
```

---

## 🛠️ Sửa thông tin đăng nhập admin

Tài khoản admin mặc định được khởi tạo khi hệ thống chạy lần đầu.  
Bạn có thể chỉnh sửa thông tin đăng nhập admin trực tiếp tại:

**`lib/models/user.ts`**  
Đường dẫn: [`@vinkay215/Exam-Generation/files/lib/models/user.ts`](https://github.com/vinkay215/Exam-Generation/blob/main/lib/models/user.ts)

Tìm hàm sau:

```typescript
static async initializeAdmin(): Promise<void> {
  try {
    const db = await this.safeGetDatabase()
    const adminExists = await db.collection<User>(this.collection).findOne({ username: "Haiyen" })

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Yen2025@", 12)
      await db.collection(this.collection).insertOne({
        username: "Haiyen",
        email: "admin@examgenerator.com",
        password: hashedPassword,
        fullName: "Administrator",
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  } catch (error) {
    // ...
  }
}
```

**Cách thay đổi thông tin đăng nhập admin:**

- Đổi giá trị `username`, `email`, `password`, `fullName` theo mong muốn.
- Ví dụ đổi mật khẩu:
  ```typescript
  const hashedPassword = await bcrypt.hash("MatKhauMoi123@", 12)
  // ...
  password: hashedPassword,
  ```
- Đổi email:
  ```typescript
  email: "admin@examgeneration.com", // email mới
  ```
- Sau khi sửa, deploy lại để khởi tạo tài khoản admin mới.

**Lưu ý:**  
- Nếu đã có admin trong database, hàm này sẽ không ghi đè. Nếu muốn cập nhật, bạn cần xoá bản ghi admin cũ trong MongoDB Atlas hoặc sửa trực tiếp trên database.
- Đảm bảo mật khẩu mạnh để bảo vệ tài khoản quản trị.

---

## 🛠️ Sửa tên dự án

- Đổi tên repository trên GitHub thành `Exam-Generation`.
- Sửa tiêu đề dự án trong file `README.md` thành `Exam-Generation`.
- Sửa tên dự án ở các file cấu hình như `package.json`, `vercel.json`, hoặc `app.config.js` nếu có.
- Ví dụ trong `package.json`:
  ```json
  {
    "name": "Exam-Generation",
    ...
  }
  ```

---

## 📖 Sử dụng

Sau khi deploy thành công:
- Truy cập link Vercel bạn được cung cấp.
- Xem hướng dẫn sử dụng hoặc API trong tài liệu dự án.

---

## ❗️ Lưu ý bảo mật

- Không chia sẻ chuỗi kết nối MongoDB lên public.
- Chỉ thêm IP tin cậy để truy cập database.
- Đưa lên môi trường sản xuất nên giới hạn IP hoặc dùng VPN/Firewall.

---

## 📝 Liên hệ & Góp ý

- Tác giả: [vinkay215](https://github.com/vinkay215)
- Nếu có góp ý, phát hiện lỗi hoặc muốn đóng góp, hãy tạo [issue](https://github.com/vinkay215/Exam-Generation/issues) hoặc liên hệ qua GitHub.
- **Cảm ơn bạn đã quan tâm và sử dụng dự án. Cùng nhau xây dựng ứng dụng ngày càng hoàn thiện hơn!**

---

Chúc bạn triển khai thành công! 🚀
