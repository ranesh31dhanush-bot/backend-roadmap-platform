import mongoose from "mongoose";
import { TelemetryEventModel } from "../../models/telemetryEvent.model.js";
import { TopicProgressModel } from "../../models/topicProgress.model.js";
import { UserScheduleModel } from "../../models/userSchedule.model.js";
import { UserStreakModel } from "../../models/userStreak.model.js";
import { VelocityStatsDTO, TelemetryEventPayload } from "@top1/shared";
import { logger } from "../../utils/logger.js";

const TOTAL_TOPICS = 813;

export class AnalyticsService {
  /**
   * ANLT-001: Fire-and-forget telemetry event ingestion.
   * Non-blocking: resolves immediately; DB write is async.
   * Target: caller receives 202 in < 15ms.
   */
  ingestEvent(userId: string, payload: TelemetryEventPayload): void {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    // Deliberately not awaited — fire-and-forget pattern
    TelemetryEventModel.create({
      userId: userObjectId,
      eventType: payload.eventType,
      resourceId: payload.resourceId ?? null,
      metadata: payload.metadata ?? null,
      occurredAt: new Date(),
    }).catch((err: unknown) => {
      // Log failure but never propagate — telemetry must not block learner flow
      logger.warn({ err, userId, eventType: payload.eventType }, "Telemetry event ingestion failed");
    });
  }

  /**
   * ANLT-002: Compute personal velocity stats for the velocity dashboard widget.
   * Aggregates progress, streaks, and schedule data into a single DTO.
   */
  async getVelocityStats(userId: string): Promise<VelocityStatsDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Run queries in parallel
    const [topicsCompleted, streak, schedule] = await Promise.all([
      TopicProgressModel.countDocuments({ userId: userObjectId }),
      UserStreakModel.findOne({ userId: userObjectId }).lean(),
      UserScheduleModel.findOne({ userId: userObjectId }).lean(),
    ]);

    const globalPercentage = Number(((topicsCompleted / TOTAL_TOPICS) * 100).toFixed(2));

    // Compute days since start
    let daysSinceStart = 0;
    let startDate: string | null = null;
    let avgTopicsPerDay = 0;
    let estimatedDaysRemaining: number | null = null;
    let projectedCompletionDate: string | null = null;

    if (schedule?.startDate) {
      startDate = schedule.startDate;
      const start = new Date(schedule.startDate);
      const now = new Date();
      daysSinceStart = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      // Average topics completed per active day
      avgTopicsPerDay = daysSinceStart > 0 ? Number((topicsCompleted / daysSinceStart).toFixed(2)) : 0;

      // Estimate completion
      const topicsRemaining = TOTAL_TOPICS - topicsCompleted;
      if (avgTopicsPerDay > 0 && topicsRemaining > 0) {
        estimatedDaysRemaining = Math.ceil(topicsRemaining / avgTopicsPerDay);
        const projected = new Date();
        projected.setDate(projected.getDate() + estimatedDaysRemaining);
        projectedCompletionDate = projected.toISOString().slice(0, 10);
      } else if (topicsRemaining <= 0) {
        estimatedDaysRemaining = 0;
        projectedCompletionDate = new Date().toISOString().slice(0, 10);
      }
    }

    return {
      topicsCompleted,
      totalTopics: TOTAL_TOPICS,
      globalPercentage,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      avgTopicsPerDay,
      estimatedDaysRemaining,
      projectedCompletionDate,
      startDate,
      daysSinceStart,
    };
  }
}

export const analyticsService = new AnalyticsService();
