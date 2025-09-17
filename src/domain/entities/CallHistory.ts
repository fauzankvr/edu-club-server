export class CallHistoryEntity {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly callerId: string,
    public readonly callerName: string,
    public readonly receiverId: string,
    public readonly receiverName: string,
    public readonly startedAt: Date,
    public readonly endedAt?: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
