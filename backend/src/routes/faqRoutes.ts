import { Router } from "express";
import { listFAQs } from "../controllers/faqController";
import { verifyAccessToken } from "../middleware/auth";

const router = Router();

router.use(verifyAccessToken);
router.get("/", listFAQs);

export default router;
