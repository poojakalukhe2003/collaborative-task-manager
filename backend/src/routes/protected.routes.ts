import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.userId,
  });
});

export default router;