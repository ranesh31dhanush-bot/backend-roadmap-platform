import mongoose from "mongoose";
import { DayNoteModel, IDayNote } from "../../models/dayNote.model.js";
import { AppError } from "../../utils/appError.js";
import { DayNoteDTO, SaveNoteResponseDTO } from "@top1/shared";
import { logger } from "../../utils/logger.js";
import { streaksService } from "../streaks/streaks.service.js";

export class NotesService {
  private calculateWordCount(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  async getNote(userId: string, canonicalDayId: string): Promise<DayNoteDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const note = await DayNoteModel.findOne({
      userId: userObjectId,
      canonicalDayId,
    }).lean();

    if (!note) {
      return {
        dayCanonicalId: canonicalDayId,
        content: "",
        version: 1,
        wordCount: 0,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      id: note._id.toString(),
      dayCanonicalId: note.canonicalDayId,
      content: note.content,
      version: note.version,
      wordCount: note.wordCount,
      updatedAt: note.updatedAt.toISOString(),
      createdAt: note.createdAt?.toISOString(),
    };
  }

  async saveNote(
    userId: string,
    canonicalDayId: string,
    content: string,
    incomingVersion: number,
  ): Promise<SaveNoteResponseDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const wordCount = this.calculateWordCount(content);

    // 1. Check if note already exists
    const existingNote = await DayNoteModel.findOne({
      userId: userObjectId,
      canonicalDayId,
    });

    if (!existingNote) {
      // First-time write for this day
      // If client sent version 0 or 1, create initial note at version 1
      try {
        const newNote = await DayNoteModel.create({
          userId: userObjectId,
          canonicalDayId,
          content,
          version: 1,
          wordCount,
        });

        logger.info(
          { userId, canonicalDayId, version: newNote.version },
          "Day note created successfully",
        );

        return {
          saved: true,
          dayCanonicalId: newNote.canonicalDayId,
          content: newNote.content,
          version: newNote.version,
          wordCount: newNote.wordCount,
          updatedAt: newNote.updatedAt.toISOString(),
        };
      } catch (err: any) {
        // Handle race on initial creation (E11000 duplicate key)
        if (err.code === 11000) {
          // Retry with standard optimistic update
          return this.saveNote(userId, canonicalDayId, content, incomingVersion);
        }
        throw err;
      }
    }

    // 2. Document exists: perform atomic conditional optimistic lock update
    const updatedNote = await DayNoteModel.findOneAndUpdate(
      {
        userId: userObjectId,
        canonicalDayId,
        version: incomingVersion,
      },
      {
        $set: { content, wordCount },
        $inc: { version: 1 },
      },
      {
        new: true,
      },
    );

    if (!updatedNote) {
      // Version mismatch: incomingVersion does not match current DB version
      const currentDbNote = await DayNoteModel.findOne({
        userId: userObjectId,
        canonicalDayId,
      }).lean();

      logger.warn(
        {
          userId,
          canonicalDayId,
          incomingVersion,
          dbVersion: currentDbNote?.version,
        },
        "Optimistic concurrency lock conflict on day note",
      );

      throw AppError.conflict(
        "Note was modified in another session. Please refresh to load the latest changes.",
        {
          currentVersion: currentDbNote?.version,
          latestContent: currentDbNote?.content,
          updatedAt: currentDbNote?.updatedAt?.toISOString(),
        },
      );
    }

    logger.info(
      { userId, canonicalDayId, newVersion: updatedNote.version },
      "Day note updated with incremented version",
    );

    return {
      saved: true,
      dayCanonicalId: updatedNote.canonicalDayId,
      content: updatedNote.content,
      version: updatedNote.version,
      wordCount: updatedNote.wordCount,
      updatedAt: updatedNote.updatedAt.toISOString(),
    };
  }

  async searchNotes(userId: string, query: string): Promise<DayNoteDTO[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: any = {
      userId: userObjectId,
      content: { $ne: "" },
    };

    if (query && query.trim()) {
      const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ content: regex }, { canonicalDayId: regex }];
    }

    const notes = await DayNoteModel.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return notes.map((n) => ({
      id: n._id.toString(),
      dayCanonicalId: n.canonicalDayId,
      content: n.content,
      version: n.version,
      wordCount: n.wordCount,
      updatedAt: n.updatedAt.toISOString(),
      createdAt: n.createdAt?.toISOString(),
    }));
  }

  async getAllNotes(userId: string): Promise<DayNoteDTO[]> {
    return this.searchNotes(userId, "");
  }
}

export const notesService = new NotesService();
