import mongoose from "mongoose";
import {
  LegacyMigrationPayloadDTO,
  MigrationImportResultDTO,
  MigrationStatusDTO,
} from "@top1/shared";
import { CurriculumNodeModel, ICurriculumNode } from "../../models/curriculumNode.model.js";
import { TopicProgressModel } from "../../models/topicProgress.model.js";
import { DayNoteModel } from "../../models/dayNote.model.js";
import { UserLinkModel } from "../../models/userLink.model.js";
import { QuizBankModel } from "../../models/quizBank.model.js";
import { QuizHighScoreModel } from "../../models/quizHighScore.model.js";
import { UserScheduleModel } from "../../models/userSchedule.model.js";
import { UserModel } from "../../models/user.model.js";
import { streaksService } from "../streaks/streaks.service.js";
import { SlugTranslator } from "./slugTranslator.js";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";

export class MigrationService {
  /**
   * Performs an atomic, transactional ingestion of legacy localStorage data.
   */
  public static async importLegacyData(
    userId: string,
    payload: LegacyMigrationPayloadDTO,
  ): Promise<MigrationImportResultDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await UserModel.findById(userObjectId);
    if (!user) {
      throw AppError.notFound("Learner account not found");
    }

    // 1. Fetch published curriculum nodes to build translation map
    const curriculumNodes: ICurriculumNode[] = await CurriculumNodeModel.find({
      status: "published",
    }).sort({ globalDayNumber: 1 });

    if (curriculumNodes.length === 0) {
      throw AppError.internal(
        "Curriculum nodes not seeded. Migration cannot resolve canonical identities.",
      );
    }

    // Build translation lookup maps
    const nodesByWeekAndDay = new Map<string, ICurriculumNode>();
    const nodesByDayOffset = new Map<number, ICurriculumNode>();

    curriculumNodes.forEach((node, index) => {
      nodesByWeekAndDay.set(`${node.weekNumber}-${node.dayNumberInWeek}`, node);
      nodesByDayOffset.set(index, node);
    });

    const quizBanks = await QuizBankModel.find({});

    let importedTopicsCount = 0;
    let importedNotesCount = 0;
    let importedLinksCount = 0;
    let importedQuizzesCount = 0;
    let scheduleSet = false;
    const skippedItems: string[] = [];

    // 2. Start Atomic Multi-Document Transaction if cluster topology supports it
    let session: mongoose.ClientSession | null = null;
    let isTransactionActive = false;

    try {
      const client = mongoose.connection.getClient() as any;
      const topology = client?.topology?.description;
      const isReplicaOrSharded =
        topology &&
        (topology.setName ||
          topology.type === "ReplicaSetWithPrimary" ||
          topology.type === "ReplicaSetNoPrimary" ||
          topology.type === "Sharded");

      if (isReplicaOrSharded) {
        session = await mongoose.startSession();
        session.startTransaction();
        isTransactionActive = true;
      }
    } catch {
      session = null;
      isTransactionActive = false;
    }

    const sessionOpt = session ? { session } : {};

    try {
      // ── A. Schedule Migration ──────────────────────────────────
      if (payload.startDate && /^\d{4}-\d{2}-\d{2}$/.test(payload.startDate)) {
        const scheduleQuery = UserScheduleModel.findOne({ userId: userObjectId });
        const existingSchedule = session ? await scheduleQuery.session(session) : await scheduleQuery.exec();
        if (!existingSchedule) {
          const startDateObj = new Date(`${payload.startDate}T12:00:00Z`);
          const endDateObj = new Date(startDateObj.getTime() + 363 * 86400000);
          const projectedEndDate = endDateObj.toISOString().split("T")[0];

          await UserScheduleModel.create(
            [
              {
                userId: userObjectId,
                startDate: payload.startDate,
                curDate: payload.startDate,
                curPhase: 1,
                targetRole: "Senior Backend Engineer",
                status: "active",
                isPaused: !!payload.pausedAt,
                pausedAt: payload.pausedAt || null,
                totalPauseDays: payload.totalPauseDays || 0,
                projectedCompletionDate: projectedEndDate,
                currentDayCanonicalId: curriculumNodes[0]?.canonicalDayId || "p1-w1-d1",
                curriculumVersion: "1.0.0",
              },
            ],
            sessionOpt,
          );
          scheduleSet = true;
        }
      }

      // ── B. Progress Ledger Migration (done: { "s::1::0::0": true }) ──
      if (payload.done && typeof payload.done === "object") {
        for (const [slotKey, isCompleted] of Object.entries(payload.done)) {
          if (!isCompleted) continue;

          const translated = SlugTranslator.translateSlotKey(slotKey, nodesByWeekAndDay);
          if (translated) {
            await TopicProgressModel.updateOne(
              { userId: userObjectId, topicId: translated.topicId },
              {
                $setOnInsert: {
                  userId: userObjectId,
                  topicId: translated.topicId,
                  canonicalDayId: translated.canonicalDayId,
                  phaseNumber: translated.phaseNumber,
                  weekNumber: translated.weekNumber,
                  completedAt: new Date(),
                },
              },
              { upsert: true, ...(session ? { session } : {}) },
            );
            importedTopicsCount++;
          } else {
            skippedItems.push(`Unmappable slot key: ${slotKey}`);
          }
        }
      }

      // ── C. Notes Migration (notes: { "2026-09-01": "content..." }) ────
      if (payload.notes && typeof payload.notes === "object") {
        for (const [dateKey, content] of Object.entries(payload.notes)) {
          if (!content || typeof content !== "string" || !content.trim()) continue;

          const canonicalDayId = SlugTranslator.translateDateToCanonicalDayId(
            dateKey,
            payload.startDate,
            curriculumNodes,
            nodesByDayOffset,
          );

          if (canonicalDayId) {
            const cleanContent = content.slice(0, 50000);
            const wordCount = cleanContent.trim().split(/\s+/).length;

            await DayNoteModel.updateOne(
              { userId: userObjectId, canonicalDayId },
              {
                $setOnInsert: {
                  userId: userObjectId,
                  canonicalDayId,
                  content: cleanContent,
                  version: 1,
                  wordCount,
                },
              },
              { upsert: true, ...(session ? { session } : {}) },
            );
            importedNotesCount++;
          } else {
            skippedItems.push(`Unmappable note date: ${dateKey}`);
          }
        }
      }

      // ── D. ChatGPT & PDF Links Migration ────────────────────────
      if (payload.chatLinks && typeof payload.chatLinks === "object") {
        for (const [dateKey, url] of Object.entries(payload.chatLinks)) {
          if (!url || typeof url !== "string" || url === "__editing__") continue;
          if (!url.startsWith("http://") && !url.startsWith("https://")) continue;

          const canonicalDayId = SlugTranslator.translateDateToCanonicalDayId(
            dateKey,
            payload.startDate,
            curriculumNodes,
            nodesByDayOffset,
          );

          if (canonicalDayId) {
            await UserLinkModel.updateOne(
              { userId: userObjectId, canonicalDayId, linkType: "CHATGPT" },
              {
                $setOnInsert: {
                  userId: userObjectId,
                  canonicalDayId,
                  title: "ChatGPT Study Chat",
                  url: url.slice(0, 2000),
                  linkType: "CHATGPT",
                },
              },
              { upsert: true, ...(session ? { session } : {}) },
            );
            importedLinksCount++;
          }
        }
      }

      if (payload.pdfLinks && typeof payload.pdfLinks === "object") {
        for (const [dateKey, url] of Object.entries(payload.pdfLinks)) {
          if (!url || typeof url !== "string" || url === "__editing__") continue;
          if (!url.startsWith("http://") && !url.startsWith("https://")) continue;

          const canonicalDayId = SlugTranslator.translateDateToCanonicalDayId(
            dateKey,
            payload.startDate,
            curriculumNodes,
            nodesByDayOffset,
          );

          if (canonicalDayId) {
            await UserLinkModel.updateOne(
              { userId: userObjectId, canonicalDayId, linkType: "PDF_NOTES" },
              {
                $setOnInsert: {
                  userId: userObjectId,
                  canonicalDayId,
                  title: "PDF Study Notes",
                  url: url.slice(0, 2000),
                  linkType: "PDF_NOTES",
                },
              },
              { upsert: true, ...(session ? { session } : {}) },
            );
            importedLinksCount++;
          }
        }
      }

      // ── E. Quiz Scores Migration (qscores: { ... }) ──────────────
      if (payload.qscores && typeof payload.qscores === "object") {
        for (const [qKey, scoreItem] of Object.entries(payload.qscores)) {
          if (!scoreItem || typeof scoreItem.pct !== "number") continue;

          const resolvedQuiz = SlugTranslator.translateQuizScoreKey(qKey, quizBanks);
          if (resolvedQuiz) {
            const pct = Math.min(100, Math.max(0, Math.round(scoreItem.pct)));
            await QuizHighScoreModel.updateOne(
              { userId: userObjectId, quizBankId: resolvedQuiz.quizBankId },
              {
                $max: { highScorePercentage: pct },
                $setOnInsert: {
                  userId: userObjectId,
                  quizBankId: resolvedQuiz.quizBankId,
                  canonicalId: resolvedQuiz.canonicalId,
                  passed: pct >= 75,
                  attemptsCount: 1,
                  lastAttemptAt: new Date(),
                },
              },
              { upsert: true, ...(session ? { session } : {}) },
            );
            importedQuizzesCount++;
          } else {
            skippedItems.push(`Unmappable quiz score bank: ${qKey}`);
          }
        }
      }

      // ── F. Update User Migration Status ─────────────────────────
      await UserModel.updateOne(
        { _id: userObjectId },
        {
          $set: {
            isMigrated: true,
            migratedAt: new Date(),
            isOnboarded: true,
          },
        },
        session ? { session } : {},
      );

      // Commit transaction atomically if active
      if (isTransactionActive && session) {
        await session.commitTransaction();
      }
    } catch (err) {
      if (isTransactionActive && session) {
        await session.abortTransaction();
      }
      logger.error(
        { userId, err },
        "MongoDB migration transaction aborted and rolled back",
      );
      throw err;
    } finally {
      if (session) {
        session.endSession();
      }
    }

    // ── G. Post-Migration: Record Study Activity on Streak ───────
    if (importedTopicsCount > 0) {
      try {
        await streaksService.recordActivity(userId);
      } catch {
        // Non-critical streak notification
      }
    }

    logger.info(
      {
        userId,
        importedTopics: importedTopicsCount,
        importedNotes: importedNotesCount,
        importedLinks: importedLinksCount,
        importedQuizzes: importedQuizzesCount,
        skippedCount: skippedItems.length,
      },
      "Legacy localStorage migration completed successfully",
    );

    return {
      status: "COMPLETED",
      migratedAt: new Date().toISOString(),
      importedTopics: importedTopicsCount,
      importedNotes: importedNotesCount,
      importedLinks: importedLinksCount,
      importedQuizzes: importedQuizzesCount,
      scheduleSet,
      skippedItems,
    };
  }

  /**
   * Retrieves the current migration status of the learner.
   */
  public static async getMigrationStatus(userId: string): Promise<MigrationStatusDTO> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("Learner not found", 404, "NOT_FOUND");
    }

    const [topicsCount, notesCount, linksCount, quizzesCount] = await Promise.all([
      TopicProgressModel.countDocuments({ userId }),
      DayNoteModel.countDocuments({ userId }),
      UserLinkModel.countDocuments({ userId }),
      QuizHighScoreModel.countDocuments({ userId }),
    ]);

    return {
      isMigrated: !!user.isMigrated,
      migratedAt: user.migratedAt ? user.migratedAt.toISOString() : null,
      stats: {
        importedTopics: topicsCount,
        importedNotes: notesCount,
        importedLinks: linksCount,
        importedQuizzes: quizzesCount,
      },
    };
  }
}
