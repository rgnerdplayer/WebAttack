import express from "express";
import { prisma } from "./adapters.js"; // 引入剛才建的連線工具 [cite: 1064]

const port = process.env.PORT || 8000;
const app = express();

// 重點：一定要加這行，後端才能讀取前端傳來的 JSON 資料 
app.use(express.json()); 

// 1. [GET] 取得所有使用者 [cite: 718, 1070]
app.get("/api/v1/users", async (req, res) => {
  const users = await prisma.user.findMany(); // 去資料庫抓所有人 [cite: 1070]
  res.json(users); // 把結果變成 JSON 丟回去 [cite: 810]
});

// 2. [POST] 新增一個使用者 [cite: 742, 1134]
app.post("/api/v1/users", async (req, res) => {
  const { name } = req.body; // 從 Request 裡面拆出名字 [cite: 1148]
  const newUser = await prisma.user.create({
    data: { name: name }, // 存進資料庫 [cite: 1148]
  });
  res.status(201).json(newUser); // 回傳成功訊息跟新 User [cite: 1148]
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});