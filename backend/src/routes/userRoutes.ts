import { Router } from "express";
import { me, updateLocation, updateProfile } from "../controllers/userController";
import { verifyAccessToken } from "../middleware/auth";

const router = Router();

router.use(verifyAccessToken);
router.get("/me", me);
router.put("/location", updateLocation);
router.put("/profile", updateProfile);

export default router;
