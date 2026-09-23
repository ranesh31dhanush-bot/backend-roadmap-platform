import mongoose from "mongoose";
import { UserModel } from "../../models/user.model.js";
import { UserScheduleModel, IUserSchedule } from "../../models/userSchedule.model.js";
import {
  StartOnboardingRequest,
  StartOnboardingResponse,
  OnboardingStatusResponse,
  UserScheduleDTO,
} from "@top1/shared";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";

function toScheduleDTO(doc: IUserSchedule): UserScheduleDTO {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    startDate: doc.startDate,
    curDate: doc.curDate,
    curPhase: doc.curPhase,
    targetRole: doc.targetRole,
    status: doc.status,
    isPaused: doc.isPaused,
    pausedAt: doc.pausedAt,
    totalPauseDays: doc.totalPauseDays,
    projectedCompletionDate: doc.projectedCompletionDate,
    currentDayCanonicalId: doc.currentDayCanonicalId,
  };
}

export class OnboardingService {
  /**
   * Initializes learner schedule and sets isOnboarded = true
   * Safe against idempotent duplicate submissions
   */
  async startOnboarding(
    userId: string,
    data: StartOnboardingRequest,
  ): Promise<StartOnboardingResponse> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    // Calculate projected end date (+363 days / 52 weeks) in strict UTC
    const startDateParts = data.startDate.split("-").map(Number);
    const year = startDateParts[0] || new Date().getFullYear();
    const month = (startDateParts[1] || 1) - 1;
    const day = startDateParts[2] || 1;
    const startUtc = new Date(Date.UTC(year, month, day));
    const endUtc = new Date(startUtc.getTime() + 363 * 24 * 60 * 60 * 1000);
    const projectedCompletionDate = endUtc.toISOString().split("T")[0]!;

    const targetRole = data.targetRole?.trim() || "Backend Engineer";

    // Idempotent upsert of UserSchedule
    const schedule = await UserScheduleModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          startDate: data.startDate,
          curDate: data.startDate,
          curPhase: 1,
          targetRole,
          status: "active",
          isPaused: false,
          pausedAt: null,
          totalPauseDays: 0,
          projectedCompletionDate,
          currentDayCanonicalId: "p1-w1-d1",
          curriculumVersion: user.activeCurriculumVersion || "1.0.0",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Mark user as onboarded
    if (!user.isOnboarded) {
      user.isOnboarded = true;
      await user.save();
    }

    logger.info(
      {
        userId,
        startDate: data.startDate,
        projectedCompletionDate,
        targetRole,
      },
      "Learner successfully onboarded and schedule initialized",
    );

    return {
      schedule: toScheduleDTO(schedule),
      isOnboarded: true,
    };
  }

  /**
   * Fetch current onboarding status and schedule anchor
   */
  async getOnboardingStatus(userId: string): Promise<OnboardingStatusResponse> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const schedule = await UserScheduleModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return {
      isOnboarded: user.isOnboarded,
      schedule: schedule ? toScheduleDTO(schedule) : null,
    };
  }
}

export const onboardingService = new OnboardingService();
