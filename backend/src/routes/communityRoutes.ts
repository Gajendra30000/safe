import { Router } from "express";
import {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  createReply,
  getReplies,
  toggleVote,
  getUserVotes,
  getCategories
} from "../controllers/communityController";
import { verifyAccessToken } from "../middleware/auth";

const router = Router();

router.use(verifyAccessToken);

router.get("/categories", getCategories);
router.post("/discussions", createDiscussion);
router.get("/discussions", getDiscussions);
router.get("/discussions/:id", getDiscussionById);
router.put("/discussions/:id", updateDiscussion);
router.delete("/discussions/:id", deleteDiscussion);

router.post("/discussions/:id/replies", createReply);
router.get("/discussions/:id/replies", getReplies);

router.post("/vote", toggleVote);
router.post("/votes", getUserVotes);

export default router;
