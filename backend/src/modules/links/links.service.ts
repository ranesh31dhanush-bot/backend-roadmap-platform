import mongoose from "mongoose";
import { UserLinkModel, LinkType } from "../../models/userLink.model.js";
import { AppError } from "../../utils/appError.js";
import { UserLinkDTO } from "@top1/shared";
import { logger } from "../../utils/logger.js";

export class LinksService {
  async getLinks(userId: string, canonicalDayId: string): Promise<UserLinkDTO[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const links = await UserLinkModel.find({
      userId: userObjectId,
      canonicalDayId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return links.map((l) => ({
      id: l._id.toString(),
      dayCanonicalId: l.canonicalDayId,
      title: l.title,
      url: l.url,
      linkType: l.linkType,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }));
  }

  async createLink(
    userId: string,
    data: {
      canonicalDayId: string;
      title: string;
      url: string;
      linkType?: LinkType;
    },
  ): Promise<UserLinkDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const newLink = await UserLinkModel.create({
      userId: userObjectId,
      canonicalDayId: data.canonicalDayId,
      title: data.title.trim(),
      url: data.url.trim(),
      linkType: data.linkType || "OTHER",
    });

    logger.info(
      { userId, linkId: newLink._id, canonicalDayId: data.canonicalDayId },
      "External link created successfully",
    );

    return {
      id: newLink._id.toString(),
      dayCanonicalId: newLink.canonicalDayId,
      title: newLink.title,
      url: newLink.url,
      linkType: newLink.linkType,
      createdAt: newLink.createdAt.toISOString(),
      updatedAt: newLink.updatedAt.toISOString(),
    };
  }

  async deleteLink(userId: string, linkId: string): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      throw AppError.badRequest("Invalid link ID format");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const result = await UserLinkModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(linkId),
      userId: userObjectId,
    });

    if (!result) {
      throw AppError.notFound("Link not found or not owned by user");
    }

    logger.info({ userId, linkId }, "External link deleted successfully");
    return { deleted: true };
  }
}

export const linksService = new LinksService();
