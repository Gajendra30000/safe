import { Router } from "express";
import {
  listQuestions,
  createQuestion,
  addAnswer,
  upvoteAnswer,
  downvoteAnswer,
  acceptAnswer
} from "../controllers/qnaController";
import { verifyAccessToken } from "../middleware/auth";

const router = Router();

router.use(verifyAccessToken);

router.get("/", listQuestions);
router.post("/", createQuestion);
router.post("/:id/answers", addAnswer);
router.post("/:questionId/answers/:answerId/upvote", upvoteAnswer);
router.post("/:questionId/answers/:answerId/downvote", downvoteAnswer);
router.post("/:questionId/answers/:answerId/accept", acceptAnswer);

export default router;
