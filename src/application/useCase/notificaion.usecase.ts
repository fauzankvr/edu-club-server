import { INotificationRepo } from "../interface/INotificationRepo"; 

export class NotificationUseCase {
  constructor(private notificationRepo: INotificationRepo) {}

  async getAllNotification(
    instructorId: string
  ) {
    const notifications = await this.notificationRepo.getAllNotification(
      instructorId
    );
    if (!notifications) {
      throw new Error("Failed to Featch notification");
    }
    return notifications;
  }

  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    studentId: string;
    instructorId: string;
  }) {
    const newNotification = await this.notificationRepo.createNotification(
      data
    );
    if (!newNotification) {
      throw new Error("Failed to create notification");
    }
    return newNotification;
  }

  async getNotifications(studentId: string) {
    const notifications = await this.notificationRepo.getNotificationsByUserId(
      studentId
    );
    if (!notifications) {
      throw new Error("Failed to fetch notifications");
    }
    return notifications;
  }

  async markAsRead(notificationId: string, studentEmail: string) {
    const updated = await this.notificationRepo.markNotificationAsRead(
      notificationId
    );
    if (!updated) {
      throw new Error("Failed to mark notification as read");
    }
    return updated;
  }

  async clearNotifications(studentId: string) {
    const cleared = await this.notificationRepo.clearAllNotifications(
      studentId
    );
    if (!cleared) {
      throw new Error("Failed to clear notifications");
    }
    return cleared;
  }
}
