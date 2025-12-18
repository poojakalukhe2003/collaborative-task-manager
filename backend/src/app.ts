import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ mount routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// health check (optional but useful)
app.get("/", (req, res) => {
  res.send("API running");
});

export default app;