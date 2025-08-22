export interface INotificationUseCase {
  getAllNotification(instructorId: string): Promise<any>;
  createNotification(data: {
    type: string;
    title: string;
    message: string;
    studentId: string;
    instructorId: string;
  }): Promise<any>;
  getNotifications(studentId: string): Promise<any>;
  markAsRead(notificationId: string, studentEmail: string): Promise<any>;
  clearNotifications(studentId: string): Promise<any>;
}
