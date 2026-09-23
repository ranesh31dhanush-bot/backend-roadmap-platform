import { ICurriculumNode } from "../../models/curriculumNode.model.js";
import { IQuizBank } from "../../models/quizBank.model.js";
import mongoose from "mongoose";

export interface TranslatedTopicProgress {
  topicId: string;
  canonicalDayId: string;
  phaseNumber: number;
  weekNumber: number;
}

export interface TranslatedDayItem {
  canonicalDayId: string;
}

export class SlugTranslator {
  /**
   * Translates a legacy slot key (e.g. "s::1::0::0") to a modern canonical topic identity.
   * Format: s::<weekNumber>::<dayIndex0>::<topicIndex0>
   */
  public static translateSlotKey(
    slotKey: string,
    nodesByWeekAndDay: Map<string, ICurriculumNode>,
  ): TranslatedTopicProgress | null {
    if (!slotKey.startsWith("s::")) {
      return null;
    }

    const parts = slotKey.split("::");
    if (parts.length < 4) {
      return null;
    }

    const part1 = parts[1];
    const part2 = parts[2];
    const part3 = parts[3];
    if (!part1 || !part2 || !part3) {
      return null;
    }

    const weekNum = parseInt(part1, 10);
    const dayIdx = parseInt(part2, 10);
    const topicIdx = parseInt(part3, 10);

    if (isNaN(weekNum) || isNaN(dayIdx) || isNaN(topicIdx)) {
      return null;
    }

    const dayNum = dayIdx + 1;
    const lookupKey = `${weekNum}-${dayNum}`;
    const node = nodesByWeekAndDay.get(lookupKey);

    if (!node) {
      return null;
    }

    // Check if subtopic exists at index
    const subtopic = node.subtopics?.[topicIdx];
    const topicId = subtopic?.topicId || `${node.canonicalDayId}-t${topicIdx + 1}`;

    return {
      topicId,
      canonicalDayId: node.canonicalDayId,
      phaseNumber: node.phaseNumber,
      weekNumber: node.weekNumber,
    };
  }

  /**
   * Translates a legacy date string (YYYY-MM-DD) to a canonical day ID (e.g. "p1-w1-d1")
   * using the learner's legacy startDate anchor.
   */
  public static translateDateToCanonicalDayId(
    dateStr: string,
    legacyStartDate: string | null | undefined,
    allNodesSorted: ICurriculumNode[],
    nodesByDayOffset: Map<number, ICurriculumNode>,
  ): string | null {
    if (!dateStr) return null;

    // Direct canonical day ID match
    if (/^p\d+-w\d+-d\d+$/i.test(dateStr)) {
      const match = allNodesSorted.find(
        (n) => n.canonicalDayId.toLowerCase() === dateStr.toLowerCase(),
      );
      if (match) return match.canonicalDayId;
    }

    // Calculate chronological offset from startDate
    if (legacyStartDate && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && /^\d{4}-\d{2}-\d{2}$/.test(legacyStartDate)) {
      try {
        const start = new Date(`${legacyStartDate}T12:00:00Z`).getTime();
        const target = new Date(`${dateStr}T12:00:00Z`).getTime();
        const diffDays = Math.round((target - start) / 86400000);

        if (diffDays >= 0) {
          const node = nodesByDayOffset.get(diffDays);
          if (node) {
            return node.canonicalDayId;
          }
        }
      } catch {
        // Fall through to other translation strategies
      }
    }

    // Fallback: match by global day index or first node
    return null;
  }

  /**
   * Translates a legacy quiz score key (e.g. "daily::Node.js Event Loop", "weekly::1", "phase::1")
   * to matching QuizBank records.
   */
  public static translateQuizScoreKey(
    rawKey: string,
    quizBanks: IQuizBank[],
  ): { quizBankId: mongoose.Types.ObjectId; canonicalId: string } | null {
    if (!rawKey) return null;

    const parts = rawKey.split("::");
    const type = parts[0]?.toLowerCase() || "";
    const key = parts[1] || parts[0] || "";

    // 1. Direct canonicalId match
    const directMatch = quizBanks.find(
      (b) => b.canonicalId.toLowerCase() === key.toLowerCase() || b.canonicalId.toLowerCase() === rawKey.toLowerCase(),
    );
    if (directMatch) {
      return { quizBankId: directMatch._id as mongoose.Types.ObjectId, canonicalId: directMatch.canonicalId };
    }

    // 2. Type-based resolution
    if (type === "daily") {
      // e.g. "Node.js Event Loop" -> "p1-w1-d1"
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      const bank = quizBanks.find((b) => {
        const bankNormalized = b.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        const slugNormalized = b.canonicalId.toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          bankNormalized.includes(normalizedKey) ||
          normalizedKey.includes(bankNormalized) ||
          slugNormalized.includes(normalizedKey)
        );
      });

      if (bank) {
        return { quizBankId: bank._id as mongoose.Types.ObjectId, canonicalId: bank.canonicalId };
      }
    } else if (type === "weekly") {
      const weekNum = parseInt(key, 10);
      if (!isNaN(weekNum)) {
        const bank = quizBanks.find(
          (b) =>
            (b.tier === "weekly" || (b as any).type === "WEEKLY") &&
            (b.canonicalId === `weekly-${weekNum}` ||
              b.slug === `weekly-${weekNum}` ||
              (b as any).weekNumber === weekNum),
        );
        if (bank) {
          return { quizBankId: bank._id as mongoose.Types.ObjectId, canonicalId: bank.canonicalId };
        }
      }
    } else if (type === "phase") {
      const phaseNum = parseInt(key, 10);
      if (!isNaN(phaseNum)) {
        const bank = quizBanks.find(
          (b) =>
            (b.tier === "phase_exam" || (b as any).type === "PHASE") &&
            (b.canonicalId === `phase-${phaseNum}` ||
              b.slug === `phase-${phaseNum}` ||
              b.phaseNumber === phaseNum),
        );
        if (bank) {
          return { quizBankId: bank._id as mongoose.Types.ObjectId, canonicalId: bank.canonicalId };
        }
      }
    }

    // Fallback: match any bank containing the key text
    if (key) {
      const fallbackBank = quizBanks.find((b) =>
        b.title.toLowerCase().includes(key.toLowerCase()),
      );
      if (fallbackBank) {
        return { quizBankId: fallbackBank._id as mongoose.Types.ObjectId, canonicalId: fallbackBank.canonicalId };
      }
    }

    return null;
  }
}
