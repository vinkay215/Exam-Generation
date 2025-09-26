# 🎓 Exam Generation

![Exam-Generation Banner](https://img.shields.io/badge/Exam%20Auto%20Generator-v0-blue?style=for-the-badge)
![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&style=for-the-badge)
![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&style=for-the-badge)

---

## 📦 Giới thiệu

**Exam-Generation** là dự án cá nhân mình xây dựng với mong muốn giúp giáo viên, trường học hay các đơn vị giáo dục có thể tạo đề thi tự động nhanh chóng, chuyên nghiệp, tiết kiệm thời gian. Dự án này còn giúp quản lý đề thi dễ dàng trên nền tảng cloud MongoDB Atlas và triển khai tức thì trên Vercel.

> ⚡️ **Dự án vẫn đang hoàn thiện, nếu bạn phát hiện lỗi hoặc có ý tưởng hay, đừng ngần ngại góp ý hoặc tạo Issue để mình cải thiện hệ thống trở nên tuyệt vời hơn nhé!**
>
> ❤️ Mỗi lời góp ý, chia sẻ đều là động lực để mình xây dựng một sản phẩm hữu ích và đẹp hơn cho cộng đồng.

---

## ⚙️ Cách thức hoạt động

1. **Nhập tiêu chí đề thi:** Người dùng nhập các tiêu chí (số lượng câu, dạng đề, độ khó...).
2. **Sinh đề tự động:** Hệ thống sẽ lấy dữ liệu từ MongoDB, xử lý và sinh đề thi phù hợp.
3. **Lưu trữ & Quản lý:** Đề thi và lịch sử tạo đề được lưu trữ trên MongoDB Atlas.
4. **Truy cập qua Web:** Toàn bộ thao tác thực hiện qua giao diện web được deploy trên Vercel, có thể sử dụng mọi nơi.

---

## 🚀 Hướng dẫn triển khai trên Vercel

### 1. Fork hoặc clone dự án

```bash
git clone https://github.com/vinkay215/Exam-Generation.git
```

### 2. Tạo tài khoản [Vercel](https://vercel.com/signup) và đăng nhập.

### 3. Deploy

- Truy cập [Vercel Dashboard](https://vercel.com/dashboard).
- Chọn **"Add New Project"** > **"Import Git Repository"**.
- Kết nối với repo vừa fork/clone.
- Trong quá trình thiết lập, phần **Environment Variables** nhập các biến môi trường sau:
  - `MONGO_URI`: Đường dẫn kết nối MongoDB (ở bước dưới sẽ có hướng dẫn lấy)
  - Các biến khác nếu dự án yêu cầu (xem file `.env.example` hoặc tài liệu dự án).

- Bấm **Deploy** và chờ hệ thống xây dựng.

---

## 🗄️ Hướng dẫn đăng ký MongoDB Atlas & Lấy KEY sử dụng

### 1. Đăng ký tài khoản MongoDB Atlas

- Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
- Đăng ký bằng email hoặc Google.

### 2. Tạo Cluster miễn phí

- Chọn **"Build a Database"** > **"Shared"** > **"Create"**.
- Chọn Cloud Provider, Region tuỳ ý (mặc định hoặc gần Việt Nam).

### 3. Tạo User và Password

- Vào tab **Database Access** > **Add New Database User**.
- Chọn **Password** và nhập username/password tuỳ ý.
- Cấp quyền **Read and Write to any database**.
- Lưu lại thông tin này.

### 4. Thêm địa chỉ IP truy cập

- Vào tab **Network Access** > **Add IP Address**.
- Nhập địa chỉ IP của máy bạn hoặc các địa chỉ IP mà bạn muốn cho phép truy cập.
- Nếu không chắc địa chỉ IP của bạn, có thể chọn **"Add My Current IP Address"**.
- Bấm **Confirm**.

**Lưu ý:** Chỉ nên thêm các địa chỉ IP tin cậy để đảm bảo an toàn cho dữ liệu của bạn.

### 5. Lấy connection string (KEY)

- Vào tab **Clusters** > **Connect** > **Connect your application**.
- Copy dòng **Connection String** dạng:

  ```
  mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<dbname>?retryWrites=true&w=majority
  ```

  - Thay `<username>`, `<password>`, `<cluster-name>`, `<dbname>` bằng thông tin của bạn.

- Đặt chuỗi này vào biến môi trường `MONGO_URI` khi deploy trên Vercel.

---

## 🗂️ Ví dụ file `.env`

```env
MONGO_URI=mongodb+srv://your_user:your_pass@yourcluster.mongodb.net/yourdb?retryWrites=true&w=majority
```

---

## 🛠️ Hướng dẫn sửa thông tin đăng nhập admin

Thông tin tài khoản admin mặc định được khởi tạo khi hệ thống chạy lần đầu tiên.  
Bạn có thể thay đổi thông tin đăng nhập admin trực tiếp trong source code tại file:

**`lib/models/user.ts`**  
Đường dẫn: [`@vinkay215/Exam-Generation/files/lib/models/user.ts`](https://github.com/vinkay215/Exam-Generation/blob/main/lib/models/user.ts)

Trong file này, tìm đến hàm sau:

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

- Đổi giá trị `username`, `email`, `password`, `fullName` theo mong muốn của bạn.
- Ví dụ đổi mật khẩu:
  ```typescript
  const hashedPassword = await bcrypt.hash("MatKhauMoi123@", 12)
  // ...
  password: hashedPassword,
  ```
- Đổi email:
  ```typescript
  email: "admin@examgeneration.com", // sửa lại email mong muốn
  ```
- Sau khi sửa, bạn deploy lại để khởi tạo admin theo thông tin mới.

**Lưu ý:**  
- Nếu đã có admin trong database, hàm này sẽ không ghi đè. Nếu muốn cập nhật, bạn cần xóa bản ghi admin cũ trong MongoDB Atlas hoặc sửa trực tiếp trên database.
- Đảm bảo mật khẩu đủ mạnh để bảo vệ tài khoản quản trị.

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
- Truy cập link Vercel được cung cấp.
- Xem hướng dẫn sử dụng hoặc API thông qua tài liệu nội bộ dự án.

---

## ❗️ Lưu ý bảo mật

- Không chia sẻ connection string MongoDB lên public.
- Chỉ thêm IP tin cậy để truy cập database.
- Khi đưa lên sản xuất hãy giới hạn IP hoặc sử dụng VPN/Firewall.

---

## 📝 Liên hệ & Góp ý

- Tác giả: [vinkay215](https://github.com/vinkay215)
- Nếu bạn có góp ý, phát hiện lỗi hay muốn đóng góp, hãy tạo [issue](https://github.com/vinkay215/Exam-Generation/issues) hoặc liên hệ trực tiếp qua GitHub.
- **Cảm ơn bạn đã quan tâm và sử dụng dự án. Hãy cùng mình xây dựng nên một ứng dụng ngày càng hoàn thiện và đẹp hơn!**

---

Chúc bạn triển khai thành công! 🚀
