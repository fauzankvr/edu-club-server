import { Model, Types } from "mongoose";
import { INotification } from "../database/models/NotificationModel";
import { INotificationRepository } from "../../application/interface/INotificationRepository";

export class NotificationRepository implements INotificationRepository {
  constructor(private _notificationModel: Model<INotification>) {}

  async createNotification(data: {
    title: string;
    message: string;
    type: "course_update" | "quiz_reminder" | "message" | "achievement";
    studentId: string;
    instructorId: string;
  }): Promise<INotification> {
    return await this._notificationModel.create({
      title: data.title,
      message: data.message,
      type: data.type,
        studentId: new Types.ObjectId(data.studentId),
        instructorId: new Types.ObjectId(data.instructorId),
      read: false,
      createdAt: new Date(),
    });
  }

  async getNotificationsByUserId(userId: string): Promise<INotification[]> {
    return await this._notificationModel.find({
      studentId: new Types.ObjectId(userId),
    }).sort({ createdAt: -1 });
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<INotification | null> {
    return await this._notificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  async clearAllNotifications(
    studentId: string
  ): Promise<{ deletedCount?: number }> {
    return await this._notificationModel.deleteMany({
      studentId: new Types.ObjectId(studentId),
    });
  }

  async getAllNotification(instructorId:string): Promise<INotification[]> {
    return await this._notificationModel
      .find({
      instructorId: new Types.ObjectId(instructorId),
    }).sort({ createdAt: -1 });
  }
}
