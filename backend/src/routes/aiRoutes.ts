import { Router } from "express";
import { handleChatbotQuery } from "../controllers/chatbotController";
import { verifyAccessToken } from "../middleware/auth";

const router = Router();

router.use(verifyAccessToken);
router.post("/chat", handleChatbotQuery);

export default router;
