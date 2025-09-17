export class AiChatEntity {
  constructor(
      public studentId: string,
      public courseId: string,
      public text: string,
      public reply: string,
      public createdAt: Date,
      public readonly id?: string,
  ) {}
}
