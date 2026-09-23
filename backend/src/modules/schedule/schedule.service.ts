import mongoose from "mongoose";
import { UserScheduleModel, IUserSchedule } from "../../models/userSchedule.model.js";
import { CurriculumNodeModel } from "../../models/curriculumNode.model.js";
import { curriculumService } from "../curriculum/curriculum.service.js";
import {
  ScheduleDetailsDTO,
  PauseCourseResponse,
  ResumeCourseResponse,
  LearnerRoadmapResponse,
  LearnerRoadmapPhaseDTO,
  RoadmapDayDTO,
} from "@top1/shared";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";
import {
  getTodayUtcStr,
  calculateProjectedDate,
  calculateProjectedEndDate,
  calculateDaysBetween,
  calculateDaysRemaining,
  addDaysToDateStr,
  resolveCurrentDayOffset,
} from "./schedule.utils.js";

export class ScheduleService {
  /**
   * Get active schedule details with dynamic runtime projections
   */
  async getSchedule(userId: string): Promise<ScheduleDetailsDTO> {
    const schedule = await UserScheduleModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!schedule) {
      throw AppError.notFound("No active schedule found for this learner. Please complete onboarding first.");
    }

    const todayStr = getTodayUtcStr();
    const { currentGlobalDayNumber, referenceDate } = resolveCurrentDayOffset(
      schedule.startDate,
      schedule.isPaused,
      schedule.pausedAt,
      147,
      todayStr,
    );

    // Resolve matching canonicalDayId for currentGlobalDayNumber
    const currentDayNode = await CurriculumNodeModel.findOne({
      version: schedule.curriculumVersion || "1.0.0",
      globalDayNumber: currentGlobalDayNumber,
    });

    const currentDayCanonicalId = currentDayNode?.canonicalDayId || schedule.currentDayCanonicalId || "p1-w1-d1";
    const curPhase = currentDayNode?.phaseNumber || schedule.curPhase || 1;
    const daysRemaining = calculateDaysRemaining(schedule.projectedCompletionDate, referenceDate);

    // Update curDate and current coordinates in background if changed
    if (schedule.curDate !== referenceDate || schedule.currentDayCanonicalId !== currentDayCanonicalId) {
      schedule.curDate = referenceDate;
      schedule.currentDayCanonicalId = currentDayCanonicalId;
      schedule.curPhase = curPhase;
      await schedule.save();
    }

    return {
      startDate: schedule.startDate,
      curDate: referenceDate,
      curPhase,
      isPaused: schedule.isPaused,
      pausedAt: schedule.pausedAt,
      totalPauseDays: schedule.totalPauseDays,
      projectedEndDate: schedule.projectedCompletionDate,
      daysRemaining,
      currentDayCanonicalId,
      targetRole: schedule.targetRole || "Backend Engineer",
    };
  }

  /**
   * Reschedules course start date while preserving canonical curriculum IDs
   */
  async reschedule(userId: string, newStartDate: string): Promise<ScheduleDetailsDTO> {
    const schedule = await UserScheduleModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!schedule) {
      throw AppError.notFound("No active schedule found to reschedule.");
    }

    const newProjectedEndDate = calculateProjectedEndDate(newStartDate);
    const todayStr = getTodayUtcStr();

    const { currentGlobalDayNumber, referenceDate } = resolveCurrentDayOffset(
      newStartDate,
      schedule.isPaused,
      schedule.pausedAt,
      147,
      todayStr,
    );

    const currentDayNode = await CurriculumNodeModel.findOne({
      version: schedule.curriculumVersion || "1.0.0",
      globalDayNumber: currentGlobalDayNumber,
    });

    const currentDayCanonicalId = currentDayNode?.canonicalDayId || "p1-w1-d1";
    const curPhase = currentDayNode?.phaseNumber || 1;

    schedule.startDate = newStartDate;
    schedule.projectedCompletionDate = newProjectedEndDate;
    schedule.curDate = referenceDate;
    schedule.currentDayCanonicalId = currentDayCanonicalId;
    schedule.curPhase = curPhase;
    await schedule.save();

    logger.info({ userId, newStartDate, newProjectedEndDate }, "Learner schedule successfully rescheduled");

    const daysRemaining = calculateDaysRemaining(newProjectedEndDate, referenceDate);

    return {
      startDate: newStartDate,
      curDate: referenceDate,
      curPhase,
      isPaused: schedule.isPaused,
      pausedAt: schedule.pausedAt,
      totalPauseDays: schedule.totalPauseDays,
      projectedEndDate: newProjectedEndDate,
      daysRemaining,
      currentDayCanonicalId,
      targetRole: schedule.targetRole,
    };
  }

  /**
   * Freeze active learning journey
   */
  async pauseCourse(userId: string): Promise<PauseCourseResponse> {
    const schedule = await UserScheduleModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!schedule) {
      throw AppError.notFound("No active schedule found to pause.");
    }

    if (schedule.isPaused) {
      return {
        isPaused: true,
        pausedAt: schedule.pausedAt || getTodayUtcStr(),
      };
    }

    const pausedAt = getTodayUtcStr();
    schedule.isPaused = true;
    schedule.pausedAt = pausedAt;
    schedule.status = "paused";
    await schedule.save();

    logger.info({ userId, pausedAt }, "Course lifecycle paused");

    return {
      isPaused: true,
      pausedAt,
    };
  }

  /**
   * Unpause course, calculate delta (Δ), and shift start date forward
   */
  async resumeCourse(userId: string): Promise<ResumeCourseResponse> {
    const schedule = await UserScheduleModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!schedule) {
      throw AppError.notFound("No active schedule found to resume.");
    }

    if (!schedule.isPaused) {
      return {
        isPaused: false,
        daysPaused: 0,
        newStartDate: schedule.startDate,
        newEndDate: schedule.projectedCompletionDate,
      };
    }

    const todayStr = getTodayUtcStr();
    const pausedAt = schedule.pausedAt || todayStr;
    const pauseDeltaDays = Math.max(0, calculateDaysBetween(pausedAt, todayStr));

    const newStartDate = addDaysToDateStr(schedule.startDate, pauseDeltaDays);
    const newEndDate = calculateProjectedEndDate(newStartDate);
    const totalPauseDays = schedule.totalPauseDays + pauseDeltaDays;

    schedule.startDate = newStartDate;
    schedule.projectedCompletionDate = newEndDate;
    schedule.totalPauseDays = totalPauseDays;
    schedule.isPaused = false;
    schedule.pausedAt = null;
    schedule.status = "active";
    await schedule.save();

    logger.info(
      { userId, pauseDeltaDays, newStartDate, newEndDate, totalPauseDays },
      "Course lifecycle resumed and dates shifted forward",
    );

    return {
      isPaused: false,
      daysPaused: pauseDeltaDays,
      newStartDate,
      newEndDate,
    };
  }

  /**
   * Generates learner-specific interactive roadmap with dynamic date projections
   */
  async getLearnerRoadmap(userId: string): Promise<LearnerRoadmapResponse> {
    const scheduleDetails = await this.getSchedule(userId);
    const tree = await curriculumService.getCurriculumTree("1.0.0");

    const todayStr = scheduleDetails.curDate;

    // Group days by Phase and Week with runtime O(1) date projection
    const phaseMap = new Map<number, LearnerRoadmapPhaseDTO>();

    tree.nodes.forEach((node) => {
      const pNum = node.phaseNumber;
      if (!phaseMap.has(pNum)) {
        phaseMap.set(pNum, {
          phaseNumber: pNum,
          phaseName: node.phaseName,
          phaseColor: node.phaseColor,
          totalWeeks: 0,
          totalDays: 0,
          totalTopics: 0,
          salaryMeta: node.salaryMeta,
          projects: node.projects,
          weeks: [],
        });
      }

      const pEntry = phaseMap.get(pNum)!;
      pEntry.totalDays += 1;
      pEntry.totalTopics += node.subtopics ? node.subtopics.length : 0;

      // Project date for this day
      const projectedDate = calculateProjectedDate(scheduleDetails.startDate, node.globalDayNumber);
      const isCurrentDay = node.canonicalDayId === scheduleDetails.currentDayCanonicalId;
      const isPast = projectedDate < todayStr;
      const isFuture = projectedDate > todayStr;

      const roadmapDay: RoadmapDayDTO = {
        ...node,
        projectedDate,
        isCurrentDay,
        isPast,
        isFuture,
      };

      // Find or create week entry
      let wEntry = pEntry.weeks.find((w) => w.weekNumber === node.weekNumber);
      if (!wEntry) {
        wEntry = {
          weekNumber: node.weekNumber,
          weekTitle: node.weekTitle,
          days: [],
        };
        pEntry.weeks.push(wEntry);
        pEntry.totalWeeks = pEntry.weeks.length;
      }

      wEntry.days.push(roadmapDay);
    });

    const phases = Array.from(phaseMap.values()).sort((a, b) => a.phaseNumber - b.phaseNumber);

    return {
      version: tree.version,
      schedule: scheduleDetails,
      phases,
    };
  }
}

export const scheduleService = new ScheduleService();
