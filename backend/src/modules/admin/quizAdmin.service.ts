import mongoose from "mongoose";
import { QuizBankModel } from "../../models/quizBank.model.js";
import { QuizQuestionModel, IQuizQuestion } from "../../models/quizQuestion.model.js";
import { AppError } from "../../utils/appError.js";
import { AuditLogService } from "./auditLog.service.js";
import { CreateQuizQuestionInput, UpdateQuizQuestionInput } from "./admin.schema.js";

export interface AdminQuizBankListItem {
  _id: any;
  slug: string;
  title: string;
  description: string;
  tier: string;
  canonicalId: string;
  phaseNumber?: number;
  durationMinutes: number;
  passThresholdPercentage: number;
  isActive: boolean;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class QuizAdminService {
  /**
   * List all quiz banks with question counts
   */
  static async listQuizBanks(filters: { tier?: string; phaseNumber?: number } = {}): Promise<AdminQuizBankListItem[]> {
    const query: Record<string, any> = {};
    if (filters.tier) query.tier = filters.tier;
    if (filters.phaseNumber !== undefined) query.phaseNumber = filters.phaseNumber;

    const banks = await QuizBankModel.find(query).sort({ tier: 1, canonicalId: 1 }).lean();

    // Attach question counts
    const bankIds = banks.map((b) => b._id);
    const counts = await QuizQuestionModel.aggregate([
      { $match: { quizBankId: { $in: bankIds } } },
      { $group: { _id: "$quizBankId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => countMap.set(c._id.toString(), c.count));

    return banks.map((b: any) => ({
      ...b,
      questionCount: countMap.get(b._id.toString()) || 0,
    }));
  }

  /**
   * Get all questions for a specific quiz bank (Admin view - includes correct options and explanations)
   */
  static async getQuestionsByBankId(bankId: string) {
    if (!mongoose.Types.ObjectId.isValid(bankId)) {
      throw new AppError("Invalid quiz bank ID", 400);
    }

    const bank = await QuizBankModel.findById(bankId).lean();
    if (!bank) {
      throw new AppError("Quiz bank not found", 404);
    }

    const questions = await QuizQuestionModel.find({ quizBankId: bankId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return {
      bank,
      questions,
    };
  }

  /**
   * Get single question by ID
   */
  static async getQuestionById(questionId: string) {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new AppError("Invalid question ID", 400);
    }

    const question = await QuizQuestionModel.findById(questionId).lean();
    if (!question) {
      throw new AppError("Question not found", 404);
    }

    return question;
  }

  /**
   * Create question in a quiz bank
   */
  static async createQuestion(
    bankId: string,
    data: CreateQuizQuestionInput,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(bankId)) {
      throw new AppError("Invalid quiz bank ID", 400);
    }

    const bank = await QuizBankModel.findById(bankId);
    if (!bank) {
      throw new AppError("Quiz bank not found", 404);
    }

    if (data.correctOptionIndex >= data.options.length) {
      throw new AppError(
        `correctOptionIndex (${data.correctOptionIndex}) must be less than options length (${data.options.length})`,
        422,
      );
    }

    // Determine default order if not provided
    let order = data.order;
    if (order === undefined) {
      const highest = await QuizQuestionModel.findOne({ quizBankId: bankId })
        .sort({ order: -1 })
        .select("order")
        .lean();
      order = (highest?.order || 0) + 1;
    }

    const newQuestion = await QuizQuestionModel.create({
      quizBankId: bank._id,
      canonicalId: data.canonicalId || `${bank.canonicalId}-q-${Date.now()}`,
      questionText: data.questionText,
      options: data.options,
      correctOptionIndex: data.correctOptionIndex,
      explanation: data.explanation,
      difficulty: data.difficulty || "intermediate",
      order,
    });

    await AuditLogService.logAction({
      adminUserId,
      adminEmail,
      action: "create",
      entityType: "quiz_question",
      entityId: newQuestion._id.toString(),
      afterState: newQuestion.toObject(),
      metadata: { quizBankId: bank._id.toString(), bankSlug: bank.slug },
      ipAddress,
    });

    return newQuestion;
  }

  /**
   * Update question
   */
  static async updateQuestion(
    questionId: string,
    data: UpdateQuizQuestionInput,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new AppError("Invalid question ID", 400);
    }

    const question = await QuizQuestionModel.findById(questionId);
    if (!question) {
      throw new AppError("Question not found", 404);
    }

    const beforeState = question.toObject();

    const options = data.options || question.options;
    const correctOptionIndex =
      data.correctOptionIndex !== undefined ? data.correctOptionIndex : question.correctOptionIndex;

    if (correctOptionIndex >= options.length) {
      throw new AppError(
        `correctOptionIndex (${correctOptionIndex}) must be less than options length (${options.length})`,
        422,
      );
    }

    if (data.questionText !== undefined) question.questionText = data.questionText;
    if (data.options !== undefined) question.options = data.options;
    if (data.correctOptionIndex !== undefined) question.correctOptionIndex = data.correctOptionIndex;
    if (data.explanation !== undefined) question.explanation = data.explanation;
    if (data.difficulty !== undefined) question.difficulty = data.difficulty;
    if (data.order !== undefined) question.order = data.order;

    await question.save();

    await AuditLogService.logAction({
      adminUserId,
      adminEmail,
      action: "update",
      entityType: "quiz_question",
      entityId: question._id.toString(),
      beforeState,
      afterState: question.toObject(),
      metadata: { quizBankId: question.quizBankId.toString() },
      ipAddress,
    });

    return question;
  }

  /**
   * Delete question
   */
  static async deleteQuestion(
    questionId: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new AppError("Invalid question ID", 400);
    }

    const question = await QuizQuestionModel.findById(questionId);
    if (!question) {
      throw new AppError("Question not found", 404);
    }

    const beforeState = question.toObject();
    await QuizQuestionModel.findByIdAndDelete(questionId);

    await AuditLogService.logAction({
      adminUserId,
      adminEmail,
      action: "delete",
      entityType: "quiz_question",
      entityId: questionId,
      beforeState,
      metadata: { quizBankId: question.quizBankId.toString() },
      ipAddress,
    });

    return { success: true, deletedId: questionId };
  }
}
