export class ChatEntity {
  constructor(
    public userId: string,
    public instructorId: string,
    public userLastSeen?: Date,
    public instructorLastSeen?: Date,
    public lastMessage?: string,
    public lastMessageTime?: Date,
    public id?: string,
    public instructor?:object
  ) {}
}
