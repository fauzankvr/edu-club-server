export class ReactionEntity {
  constructor(public readonly userId: string, public reaction: string) {}
}

export class MessageEntity {
  constructor(
    public readonly id: string,
    public text: string,
    public sender: string,
    public chatId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public seenBy: string[],
    public deleted: boolean,
    public reactions: ReactionEntity[]
  ) {}
}
