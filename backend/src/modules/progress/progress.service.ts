import mongoose from "mongoose";
import { TopicProgressModel } from "../../models/topicProgress.model.js";
import { CurriculumNodeModel } from "../../models/curriculumNode.model.js";
import { curriculumService } from "../curriculum/curriculum.service.js";
import {
  ToggleProgressResponse,
  DayProgressDTO,
  ProgressSummaryDTO,
  PhaseProgressRollupDTO,
} from "@top1/shared";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";
import { streaksService } from "../streaks/streaks.service.js";

export class ProgressService {
  /**
   * Atomically toggles completion status for a specific canonical topic
   */
  async toggleTopicProgress(
    userId: string,
    topicId: string,
    canonicalDayId: string,
  ): Promise<ToggleProgressResponse> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch canonical day node to extract hierarchy metadata & total subtopics
    const dayNode = await CurriculumNodeModel.findOne({
      version: "1.0.0",
      canonicalDayId,
      status: "published",
    });

    if (!dayNode) {
      throw AppError.notFound(`Curriculum day '${canonicalDayId}' not found`);
    }

    // Verify topic belongs to day
    const validTopic = dayNode.subtopics.some((st) => st.topicId === topicId);
    if (!validTopic) {
      throw AppError.badRequest(`Topic '${topicId}' does not belong to day '${canonicalDayId}'`);
    }

    // 2. Atomic Toggle: check if already exists
    const existing = await TopicProgressModel.findOne({
      userId: userObjectId,
      topicId,
    });

    let isCompleted = false;

    if (existing) {
      await TopicProgressModel.deleteOne({ _id: existing._id });
      isCompleted = false;
      logger.debug({ userId, topicId, action: "uncomplete" }, "Topic progress unchecked");
    } else {
      await TopicProgressModel.updateOne(
        { userId: userObjectId, topicId },
        {
          $setOnInsert: {
            userId: userObjectId,
            topicId,
            canonicalDayId,
            phaseNumber: dayNode.phaseNumber,
            weekNumber: dayNode.weekNumber,
            completedAt: new Date(),
          },
        },
        { upsert: true },
      );
      isCompleted = true;
      logger.debug({ userId, topicId, action: "complete" }, "Topic progress checked");
    }

    // Synchronize streak from strictly completed days (all subtopics + day test)
    streaksService.syncLearnerStreakFromCompletedDays(userId).catch((e) =>
      logger.warn({ err: e }, "Failed to sync streak activity on topic toggle"),
    );

    // 3. Compute Day Progress
    const dayTotalTopics = dayNode.subtopics.length;
    const completedInDay = await TopicProgressModel.countDocuments({
      userId: userObjectId,
      canonicalDayId,
    });

    const dayCompleted = dayTotalTopics > 0 && completedInDay === dayTotalTopics;
    const dayPercentage = dayTotalTopics > 0 ? Number(((completedInDay / dayTotalTopics) * 100).toFixed(1)) : 0;

    // 4. Compute Global Progress
    const totalCompletedGlobal = await TopicProgressModel.countDocuments({
      userId: userObjectId,
    });
    const totalCurriculumTopics = 813;
    const globalPercentage = Number(((totalCompletedGlobal / totalCurriculumTopics) * 100).toFixed(2));

    return {
      topicId,
      isCompleted,
      dayCompleted,
      dayProgress: {
        completed: completedInDay,
        total: dayTotalTopics,
        percentage: dayPercentage,
      },
      globalProgress: {
        completed: totalCompletedGlobal,
        total: totalCurriculumTopics,
        percentage: globalPercentage,
      },
    };
  }

  /**
   * Fetch progress breakdown for a single canonical day
   */
  async getDayProgress(userId: string, canonicalDayId: string): Promise<DayProgressDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const dayNode = await CurriculumNodeModel.findOne({
      version: "1.0.0",
      canonicalDayId,
      status: "published",
    });

    if (!dayNode) {
      throw AppError.notFound(`Curriculum day '${canonicalDayId}' not found`);
    }

    const completedDocs = await TopicProgressModel.find({
      userId: userObjectId,
      canonicalDayId,
    }).select("topicId");

    const completedTopicIds = completedDocs.map((doc) => doc.topicId);
    const completedCount = completedTopicIds.length;
    const totalCount = dayNode.subtopics.length;
    const percentage = totalCount > 0 ? Number(((completedCount / totalCount) * 100).toFixed(1)) : 0;
    const isCompleted = totalCount > 0 && completedCount === totalCount;

    return {
      canonicalDayId,
      completedTopicIds,
      completedCount,
      totalCount,
      percentage,
      isCompleted,
    };
  }

  /**
   * Fetch comprehensive progress summary & rollups across all phases and days
   */
  async getProgressSummary(userId: string): Promise<ProgressSummaryDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch all completed topic records for learner
    const completedDocs = await TopicProgressModel.find({
      userId: userObjectId,
    }).select("topicId canonicalDayId phaseNumber");

    const completedTopicIds = completedDocs.map((doc) => doc.topicId);
    const completedTopicSet = new Set(completedTopicIds);

    // 2. Fetch full curriculum tree to compute exact phase & day rollups
    const tree = await curriculumService.getCurriculumTree("1.0.0");

    const phaseMap = new Map<number, { phaseName: string; total: number; completed: number }>();
    const dayCompletionStatus: Record<string, boolean> = {};

    tree.nodes.forEach((node) => {
      const pNum = node.phaseNumber;
      if (!phaseMap.has(pNum)) {
        phaseMap.set(pNum, {
          phaseName: node.phaseName,
          total: 0,
          completed: 0,
        });
      }

      const pEntry = phaseMap.get(pNum)!;
      const subtopics = node.subtopics || [];
      pEntry.total += subtopics.length;

      let dayCompletedCount = 0;
      subtopics.forEach((st) => {
        if (completedTopicSet.has(st.topicId)) {
          pEntry.completed += 1;
          dayCompletedCount += 1;
        }
      });

      // Day is completed if it has topics and all are completed
      dayCompletionStatus[node.canonicalDayId] = subtopics.length > 0 && dayCompletedCount === subtopics.length;
    });

    const phaseProgress: PhaseProgressRollupDTO[] = Array.from(phaseMap.entries())
      .map(([phaseNumber, data]) => ({
        phaseNumber,
        phaseName: data.phaseName,
        completed: data.completed,
        total: data.total,
        percentage: data.total > 0 ? Number(((data.completed / data.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => a.phaseNumber - b.phaseNumber);

    const totalCompleted = completedTopicIds.length;
    const totalTopics = 813;
    const globalPercentage = Number(((totalCompleted / totalTopics) * 100).toFixed(2));

    return {
      completedTopicIds,
      totalCompleted,
      totalTopics,
      globalPercentage,
      phaseProgress,
      dayCompletionStatus,
    };
  }
}

export const progressService = new ProgressService();
