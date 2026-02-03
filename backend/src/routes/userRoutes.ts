import { Router } from "express";
import { me, updateLocation } from "../controllers/userController";
import { verifyAccessToken } from "../middleware/auth";

const router = Router();

router.use(verifyAccessToken);
router.get("/me", me);
router.put("/location", updateLocation);

export default router;
