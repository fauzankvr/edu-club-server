export class NotificationEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly instructorId: string,
    public readonly type:
      | "course_update"
      | "quiz_reminder"
      | "message"
      | "achievement",
    public readonly title: string,
    public readonly message: string,
    public readonly read: boolean,
    public readonly createdAt: Date
  ) {}
}
