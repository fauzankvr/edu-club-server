import { Model, Types } from "mongoose";
import { INotification } from "../database/models/NotificationModel";
import { INotificationRepository } from "../../application/interface/INotificationRepository";
import { NotificationEntity } from "../../domain/entities/Nofitication";

export class NotificationRepository implements INotificationRepository {
  constructor(private _notificationModel: Model<INotification>) {}

  private toEntity(notification: INotification): NotificationEntity {
    return new NotificationEntity(
      notification._id.toString(),
      notification.studentId.toString(),
      notification.instructorId.toString(),
      notification.type,
      notification.title,
      notification.message,
      notification.read,
      notification.createdAt
    );
  }

  async createNotification(data: {
    title: string;
    message: string;
    type: "course_update" | "quiz_reminder" | "message" | "achievement";
    studentId: string;
    instructorId: string;
  }): Promise<NotificationEntity> {
    const notif = await this._notificationModel.create({
      title: data.title,
      message: data.message,
      type: data.type,
      studentId: new Types.ObjectId(data.studentId),
      instructorId: new Types.ObjectId(data.instructorId),
      read: false,
      createdAt: new Date(),
    });

    return this.toEntity(notif);
  }

  async getNotificationsByUserId(
    userId: string
  ): Promise<NotificationEntity[]> {
    const notifications = await this._notificationModel
      .find({ studentId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    return notifications.map((n) => this.toEntity(n));
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<NotificationEntity | null> {
    const notif = await this._notificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    return notif ? this.toEntity(notif) : null;
  }

  async clearAllNotifications(
    studentId: string
  ): Promise<{ deletedCount?: number }> {
    return this._notificationModel.deleteMany({
      studentId: new Types.ObjectId(studentId),
    });
  }

  async getAllNotification(
    instructorId: string
  ): Promise<NotificationEntity[]> {
    const notifications = await this._notificationModel
      .find({ instructorId: new Types.ObjectId(instructorId) })
      .sort({ createdAt: -1 });

    return notifications.map((n) => this.toEntity(n));
  }
}
