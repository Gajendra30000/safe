import { Router } from "express";
import { nearby } from "../controllers/placesController";
import { verifyAccessToken } from "../middleware/auth";

const router = Router();

router.use(verifyAccessToken);
router.get("/nearby", nearby);

export default router;
