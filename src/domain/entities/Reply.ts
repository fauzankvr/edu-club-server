export class ReplyEntity {
  constructor(
    public readonly id: string,
    public discussionId: string,
    public userId: string,
    public text: string,
    public likes: number = 0,
    public dislikes: number = 0,
    public likedBy: string[] = [],
    public dislikedBy: string[] = [],
    public createdAt: Date = new Date()
  ) {}
}