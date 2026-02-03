import { Router } from "express";
import { listFavorites, addFavorite, updateFavorite, deleteFavorite } from "../controllers/favoriteController";
import { verifyAccessToken } from "../middleware/auth";

const router = Router();

router.use(verifyAccessToken);

router.get("/", listFavorites);
router.post("/", addFavorite);
router.put("/:id", updateFavorite);
router.delete("/:id", deleteFavorite);

export default router;
