import { Model } from "mongoose";
import { IDiscussion, IReply } from "../../application/interface/IDiscussion";
import OrderModel from "../database/models/OrderModel";
import StudentModel from "../database/models/StudentModel";
import { IDiscussionRepository } from "../../application/interface/IDiscussionRepository";
import { ReplyEntity } from "../../domain/entities/Reply";
import { DiscussionEntity } from "../../domain/entities/Discussion";


// Mapper functions
const toReplyEntity = (reply: IReply): ReplyEntity => {
  return new ReplyEntity(
    reply._id.toString(),
    reply.discussionId,
    reply.userId.toString(),
    reply.text,
    reply.likes,
    reply.dislikes,
    reply.likedBy,
    reply.dislikedBy,
    reply.createdAt
  );
};

const toDiscussionEntity = (doc: IDiscussion): DiscussionEntity => {
  return new DiscussionEntity(
    doc._id.toString(),
    doc.studentId.toString(),
    doc.courseId,
    doc.text,
    doc.likes,
    doc.dislikes,
    doc.likedBy,
    doc.dislikedBy,
    (doc.replies || []).map(toReplyEntity),
    doc.createdAt
  );
};

export class DiscussionRepository implements IDiscussionRepository {
  constructor(private _discussionModel: Model<IDiscussion>) {}

  async createDiscussion(
    paypalOrderId: string,
    data: Partial<IDiscussion>
  ): Promise<DiscussionEntity | null> {
    const order = await OrderModel.findOne({ paypalOrderId });
    if (order?.courseId && order?.userId) {
      const student = await StudentModel.findById(order.userId);
      if (student) {
        const discussionData = {
          text: data.text,
          courseId: order.courseId,
          studentId: student._id,
        };
        const discussion = await this._discussionModel.create(discussionData);
        await discussion.populate("studentId");
        console.log("dissss", discussion);
        return toDiscussionEntity(discussion);
      }
    }
    return null;
  }

  async getAllDiscussions(paypalOrderId: string): Promise<DiscussionEntity[]> {
    const order = await OrderModel.findOne({ paypalOrderId });
    if (!order?.courseId) return [];

    const discussions = await this._discussionModel
      .find({ courseId: order.courseId })
      .populate("studentId", "firstName lastName profileImage");
    return discussions.map(toDiscussionEntity);
  }

  async findByIdDiscussion(id: string): Promise<DiscussionEntity | null> {
    const discussion = await this._discussionModel.findById(id);
    return discussion ? toDiscussionEntity(discussion) : null;
  }

  async updateReaction(
    id: string,
    data: Partial<DiscussionEntity>
  ): Promise<DiscussionEntity | null> {
    const updated = await this._discussionModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return updated ? toDiscussionEntity(updated) : null;
  }

  async updateReplay(
    id: string,
    data: Partial<DiscussionEntity>
  ): Promise<DiscussionEntity | null> {
    const updated = await this._discussionModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate("replies.userId", "firstName lastName profileImage");
    return updated ? toDiscussionEntity(updated) : null;
  }

  async findReplayById(id: string): Promise<ReplyEntity[]> {
    const discussion = await this._discussionModel
      .findById(id)
      .select("replies")
      .populate("replies.userId", "firstName lastName profileImage")
      .lean();
    return (discussion?.replies || []).map(toReplyEntity);
  }
  async create(
    data: Partial<DiscussionEntity>
  ): Promise<DiscussionEntity | null> {
    let res = await this._discussionModel.create(data);

    // populate after creation
    res = await res.populate("studentId");

    return toDiscussionEntity(res);
  }
}
