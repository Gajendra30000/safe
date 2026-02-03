import { Router } from "express";
import { createSOS, getSOSHistory, updateSOSStatus } from "../controllers/sosController";
import { verifyAccessToken } from "../middleware/auth";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

const router = Router();

router.use(verifyAccessToken);

router.post("/", upload.single("media"), createSOS);
router.get("/", getSOSHistory);
router.put("/:id", updateSOSStatus);

export default router;
