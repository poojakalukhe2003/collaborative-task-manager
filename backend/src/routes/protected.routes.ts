import { Router, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", (req: AuthRequest, res: Response) => {
  res.json({ userId: req.user?.id });
});

export default router;