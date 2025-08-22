import { Model } from "mongoose";
import { IDiscussion, IReply } from "../../application/interface/IDiscussion";
import OrderModel from "../database/models/OrderModel";
import StudentModel from "../database/models/StudentModel";
import { IDiscussionRepository } from "../../application/interface/IDiscussionRepository";

export class DiscussionRepository implements IDiscussionRepository {
  constructor(private _discussionModel: Model<IDiscussion>) {}

  async createDiscussion(
    paypalOrderId: string,
    data: Partial<IDiscussion>
  ): Promise<any> {
    const order = await OrderModel.findOne({ paypalOrderId });
    if (order?.courseId && order?.userId) {
      const student = await StudentModel.findOne({ _id: order.userId });
      if (student) {
        const discussionData = {
          text: data,
          courseId: order.courseId,
          studentId: student._id,
        };
        const discussion = await this._discussionModel.create(discussionData);
        return await discussion.populate(
          "studentId",
          "firstName lastName profileImage"
        );
      }
    }
    return null;
  }

  async getAllDiscussions(paypalOrderId: string): Promise<IDiscussion[]> {
      const order = await OrderModel.findOne({ paypalOrderId });
      console.log("order",order)
    if (order?.courseId) {
      return await this._discussionModel.find({
        courseId: order.courseId,
      }).populate("studentId", "firstName lastName profileImage");
    }
    return [];
  }

  async findByIdDiscussion(id: string): Promise<IDiscussion | null> {
    return await this._discussionModel.findById(id);
  }

  async updateReaction(
    id: string,
    data: Partial<IDiscussion>
  ): Promise<IDiscussion | null> {
    return await this._discussionModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async updateReplay(
    id: string,
    data: Partial<IDiscussion>
  ): Promise<IDiscussion | null> {
    return await this._discussionModel.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("replies.userId", "firstName lastName profileImage");
  }

  async findReplayById(id: string): Promise<IReply[]> {
    const discussion = await this._discussionModel.findById(id)
      .select("replies")
      .populate("replies.userId", "firstName lastName profileImage")
      .lean();
    return discussion?.replies || [];
  }
}
