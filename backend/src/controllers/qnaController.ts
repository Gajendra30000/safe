import { Request, Response } from "express";
import Question from "../models/Question";

function getUserId(req: any): string | null {
  return req.userId || null;
}

export async function listQuestions(req: Request, res: Response) {
  try {
    const { sort = "recent" } = req.query as any;
    const sortSpec = sort === "upvoted"
      ? ([ ["answers.upvotes", -1] as [string, 1 | -1], ["updatedAt", -1] as [string, 1 | -1] ])
      : ([ ["createdAt", -1] as [string, 1 | -1] ]);
    const questions = await Question.find()
      .populate("author", "name email")
      .sort(sortSpec)
      .limit(50);
    const shaped = questions.map((q: any) => {
      const base: any = q.toObject();
      let answers: any[] = [...(base.answers || [])].sort((a: any, b: any) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return (b.upvotes || 0) - (a.upvotes || 0);
      });
      base.answers = answers;
      return base;
    });
    res.json({ questions: shaped });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch questions" });
  }
}

export async function createQuestion(req: Request & any, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { title, description, category } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const question = await Question.create({
      author: userId,
      title,
      description,
      category: category || "General"
    });

    const populated = await question.populate("author", "name email");
    res.status(201).json({ question: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create question" });
  }
}

export async function addAnswer(req: Request & any, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    question.answers.push({
      author: userId as any,
      content,
      upvotes: 0,
      upvotedBy: [],
      downvotes: 0,
      downvotedBy: [],
      isAccepted: false
    } as any);

    await question.save();
    const populated = await question.populate("author", "name email");
    res.json({ question: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add answer" });
  }
}

export async function upvoteAnswer(req: Request & any, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id, answerId } = req.params;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const answer: any = (question.answers as any).id(answerId);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    const alreadyUpvoted = answer.upvotedBy.some((uid: any) => uid.toString() === userId);
    if (alreadyUpvoted) {
      answer.upvotedBy = answer.upvotedBy.filter((uid: any) => uid.toString() !== userId);
      answer.upvotes = Math.max(0, answer.upvotes - 1);
    } else {
      answer.upvotedBy.push(userId);
      answer.upvotes = (answer.upvotes || 0) + 1;
      answer.downvotedBy = answer.downvotedBy.filter((uid: any) => uid.toString() !== userId);
      if (answer.downvotes > 0) answer.downvotes -= 1;
    }

    await question.save();
    const populated = await question.populate("author", "name email");
    res.json({ question: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upvote" });
  }
}

export async function acceptAnswer(req: Request & any, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id, answerId } = req.params;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (question.author.toString() !== userId) {
      return res.status(403).json({ message: "Only the question author can accept answers" });
    }

    question.answers.forEach((a: any) => {
      a.isAccepted = a._id.toString() === answerId;
    });

    await question.save();
    const populated = await question.populate("author", "name email");
    res.json({ question: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to accept answer" });
  }
}

export async function downvoteAnswer(req: Request & any, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id, answerId } = req.params;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const answer: any = (question.answers as any).id(answerId);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    const alreadyDownvoted = answer.downvotedBy.some((uid: any) => uid.toString() === userId);
    if (alreadyDownvoted) {
      answer.downvotedBy = answer.downvotedBy.filter((uid: any) => uid.toString() !== userId);
      answer.downvotes = Math.max(0, answer.downvotes - 1);
    } else {
      answer.downvotedBy.push(userId);
      answer.downvotes = (answer.downvotes || 0) + 1;
      answer.upvotedBy = answer.upvotedBy.filter((uid: any) => uid.toString() !== userId);
      if (answer.upvotes > 0) answer.upvotes -= 1;
    }

    await question.save();
    const populated = await question.populate("author", "name email");
    res.json({ question: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to downvote" });
  }
}
