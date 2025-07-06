import { INotification } from "../../infrastructure/database/models/NotificationModel";

export interface INotificationRepo {
  createNotification(data: {
    title: string;
    message: string;
    type: string;
    studentId: string;
    instructorId: string;
  }): Promise<INotification>;

  getNotificationsByUserId(userId: string): Promise<INotification[]>;

  markNotificationAsRead(notificationId: string): Promise<INotification | null>;

  clearAllNotifications(studentId: string): Promise<{ deletedCount?: number }>;
  getAllNotification(instructorId:string): Promise<INotification[]>
}
