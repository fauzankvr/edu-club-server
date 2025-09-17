import { NotificationEntity } from "../../domain/entities/Nofitication";

export interface INotificationRepository {
  createNotification(data: {
    title: string;
    message: string;
    type: "course_update" | "quiz_reminder" | "message" | "achievement";
    studentId: string;
    instructorId: string;
  }): Promise<NotificationEntity>;

  getNotificationsByUserId(userId: string): Promise<NotificationEntity[]>;

  markNotificationAsRead(
    notificationId: string
  ): Promise<NotificationEntity | null>;

  clearAllNotifications(studentId: string): Promise<{ deletedCount?: number }>;

  getAllNotification(instructorId: string): Promise<NotificationEntity[]>;
}
