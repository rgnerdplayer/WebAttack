import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "./adapters.js";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());

// 雲端環境變數 (部署時會在 Render 後台填寫)
const JWT_SECRET = process.env.JWT_SECRET || "ntu_gice_midterm_secret";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 圖片不再存本地，改存在記憶體，準備直接傳送給 Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const extname = /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error("Only .jpg and .png are allowed!"));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.status(401).json({ error: "Access denied." });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.user = user; next();
  });
};

app.post("/api/v1/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: "Username exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({ data: { username, password: hashedPassword } });
    res.status(201).json({ message: "User created", userId: newUser.id });
  } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/v1/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/v1/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { username: true, avatar: true } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/v1/comments", async (req, res) => {
  const comments = await prisma.comment.findMany({
    include: { author: { select: { username: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(comments);
});

app.post("/api/v1/comments", authenticateToken, async (req, res) => {
  const newComment = await prisma.comment.create({ data: { content: req.body.content, authorId: req.user.userId } });
  res.json(newComment);
});

app.delete("/api/v1/comments/:id", authenticateToken, async (req, res) => {
  await prisma.comment.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "Deleted" });
});

// 【重點升級】直接將圖片上傳至 Supabase Storage
app.post("/api/v1/upload-avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file selected" });

    const uniqueName = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(uniqueName, file.buffer, { contentType: file.mimetype });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uniqueName);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatar: publicUrl } // 存入雲端的絕對網址
    });
    res.json({ avatarUrl: publicUrl });
  } catch (error) { res.status(500).json({ error: "Upload failed" }); }
});

app.post("/api/v1/divination", authenticateToken, async (req, res) => {
  const { apiKey, question } = req.body;
  if (!apiKey || !question) return res.status(400).json({ error: "Required fields missing" });
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: { systemInstruction: "你是一位充滿神祕感與智慧的塔羅占卜師。請根據使用者的近期狀況與問題，給予一段大約 150 字的占卜結果與指引。語氣要神秘、溫暖、具有啟發性，並隨機引用一張塔羅牌的意象來解釋。" }
    });
    res.json({ result: response.text });
  } catch (error) { res.status(500).json({ error: "占卜失敗！可能是伺服器忙碌，請稍後再試。" }); }
});

// 使用 process.env.PORT 讓 Render 自動分配 Port
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));