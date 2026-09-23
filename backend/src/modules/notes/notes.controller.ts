import { Request, Response, NextFunction } from "express";
import { notesService } from "./notes.service.js";
import { saveNoteSchema, getNoteParamsSchema, searchNotesSchema } from "./notes.schema.js";
import { AppError } from "../../utils/appError.js";

export class NotesController {
  async getNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const params = getNoteParamsSchema.parse(req.params);
      const note = await notesService.getNote(req.user.userId, params.dayId);

      res.status(200).json({
        success: true,
        data: note,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async saveNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const params = getNoteParamsSchema.parse(req.params);
      const body = saveNoteSchema.parse(req.body);

      const result = await notesService.saveNote(
        req.user.userId,
        params.dayId,
        body.content,
        body.version,
      );

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async listNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const query = searchNotesSchema.parse(req.query);
      const notes = await notesService.searchNotes(req.user.userId, query.q);

      res.status(200).json({
        success: true,
        data: {
          notes,
          total: notes.length,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const notesController = new NotesController();
