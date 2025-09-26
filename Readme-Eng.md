# 🎓 Exam-Generation

![Exam-Generation Banner](https://img.shields.io/badge/Exam%20Auto%20Generator-v0-blue?style=for-the-badge)
![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&style=for-the-badge)
![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&style=for-the-badge)

---

## 🌄 Preview

<p align="center">
  <img src="https://raw.githubusercontent.com/vinkay215/Exam-Generation/25c9c77432aabbd8db470ae620356a9f6592860c/IMG/Preview.png" alt="Exam-Generation Preview" width="720"/>
</p>
<p align="center">
  <img src="https://github.com/vinkay215/Exam-Generation/blob/5b5f8acb6cf5c70f6da842b99acc5ae53f980ab3/IMG/Admin.png?raw=true" alt="Admin Panel Preview" width="360"/>
  <img src="https://github.com/vinkay215/Exam-Generation/blob/5b5f8acb6cf5c70f6da842b99acc5ae53f980ab3/IMG/Database.png?raw=true" alt="Database Preview" width="360"/>
</p>

---

## 📦 Introduction

**Exam-Generation** is a personal project developed to help teachers, schools, and educational organizations automatically generate exam papers quickly, professionally, and efficiently. The project also makes it easy to manage exams on MongoDB Atlas cloud platform and deploy instantly on Vercel.

> ⚡️ **This project is under active development. If you find any bugs or have ideas to improve, feel free to open an Issue or contribute so I can make the system even better!**
>
> ❤️ Every suggestion and contribution is a motivation to build a more useful and beautiful product for the community.

---

## ⚙️ How It Works

1. **Input exam criteria:** Users enter exam criteria (number of questions, types, difficulty level...).
2. **Automatic exam generation:** The system fetches data from MongoDB, processes, and generates suitable exam papers.
3. **Storage & Management:** Exams and generation history are stored in MongoDB Atlas.
4. **Web access:** All operations are performed through a web interface deployed on Vercel, accessible anywhere.

---

## 🚀 Deployment Guide on Vercel

### 1. Fork or clone the project

```bash
git clone https://github.com/vinkay215/Exam-Generation.git
```

### 2. Create a [Vercel](https://vercel.com/signup) account and log in.

### 3. Deploy

- Go to [Vercel Dashboard](https://vercel.com/dashboard).
- Choose **"Add New Project"** > **"Import Git Repository"**.
- Connect to the repository you forked/cloned.
- During setup, in **Environment Variables**, enter the following:
  - `MONGO_URI`: Your MongoDB connection string (see below for instructions)
  - Other variables as needed (see `.env.example` or project documentation).

- Click **Deploy** and wait for the build to finish.

---

## 🗄️ How to Register MongoDB Atlas & Get Your KEY

### 1. Register a MongoDB Atlas account

- Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
- Sign up with your email or Google.

### 2. Create a free Cluster

- Select **"Build a Database"** > **"Shared"** > **"Create"**.
- Choose your Cloud Provider, Region (default or nearest to your location).

### 3. Create User and Password

- Go to **Database Access** > **Add New Database User**.
- Choose **Password** and enter your username/password.
- Grant **Read and Write to any database** permission.
- Save your credentials.

### 4. Add allowed IP addresses

- Go to **Network Access** > **Add IP Address**.
- Enter your computer's IP address or addresses you want to allow.
- Or select **"Add My Current IP Address"** if unsure.
- Click **Confirm**.

**Note:** Only add trusted IP addresses for database security.

### 5. Get your connection string (KEY)

- Go to **Clusters** > **Connect** > **Connect your application**.
- Copy the **Connection String**, which looks like:

  ```
  mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<dbname>?retryWrites=true&w=majority
  ```

  - Replace `<username>`, `<password>`, `<cluster-name>`, `<dbname>` with your information.

- Put this string in your `MONGO_URI` environment variable when deploying on Vercel.

---

## 🗂️ Example `.env` file

```env
MONGO_URI=mongodb+srv://your_user:your_pass@yourcluster.mongodb.net/yourdb?retryWrites=true&w=majority
```

---

## 🛠️ How to Change Admin Login Info

The default admin account is initialized when the system first runs.  
You can change admin login information directly in the source code at:

**`lib/models/user.ts`**  
Path: [`@vinkay215/Exam-Generation/files/lib/models/user.ts`](https://github.com/vinkay215/Exam-Generation/blob/main/lib/models/user.ts)

Find the following function:

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

**How to update admin login information:**

- Change `username`, `email`, `password`, `fullName` to your desired values.
- Example to change password:
  ```typescript
  const hashedPassword = await bcrypt.hash("NewPassword123@", 12)
  // ...
  password: hashedPassword,
  ```
- Change email:
  ```typescript
  email: "admin@examgeneration.com", // your new email
  ```
- After editing, redeploy the project to initialize the admin account with new info.

**Note:**  
- If the admin account already exists in the database, this function will not overwrite it. To update, you need to delete the old admin record in MongoDB Atlas or edit directly in the database.
- Make sure to use a strong password to protect the admin account.

---

## 🛠️ How to Change Project Name

- Rename the GitHub repository to `Exam-Generation`.
- Update the project title in `README.md` to `Exam-Generation`.
- Change the project name in configuration files such as `package.json`, `vercel.json`, or `app.config.js` if present.
- Example in `package.json`:
  ```json
  {
    "name": "Exam-Generation",
    ...
  }
  ```

---

## 📖 Usage

After successful deployment:
- Visit the provided Vercel link.
- Check usage instructions or API docs in the project documentation.

---

## ❗️ Security Notes

- Never share your MongoDB connection string publicly.
- Only allow trusted IPs to access your database.
- For production, restrict IPs and consider VPN/Firewall.

---

## 📝 Contact & Contribution

- Author: [vinkay215](https://github.com/vinkay215)
- For feedback, bug reports, or contributions, please create an [issue](https://github.com/vinkay215/Exam-Generation/issues) or contact me via GitHub.
- **Thank you for your interest and support! Let's build a better and more beautiful application together!**

---

Wish you a successful deployment! 🚀
