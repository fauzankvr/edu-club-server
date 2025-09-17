import { ReplyEntity } from "../../../domain/entities/Reply";
import { IReply } from "../IDiscussion";

export class ReplyDto {
  constructor(
    public readonly id: string,
    public readonly discussionId: string,
    public readonly userId: string,
    public readonly text: string,
    public readonly likes: number,
    public readonly dislikes: number,
    public readonly likedBy: string[],
    public readonly dislikedBy: string[],
    public readonly createdAt: Date
  ) {}

  // map from Entity → DTO
  static fromEntity(entity: ReplyEntity): ReplyDto {
    return new ReplyDto(
      entity.id,
      entity.discussionId,
      entity.userId,
      entity.text,
      entity.likes,
      entity.dislikes,
      entity.likedBy,
      entity.dislikedBy,
      entity.createdAt
    );
  }

  // map from Schema (IReply) → DTO
  static fromPersistence(doc: IReply): ReplyDto {
    return new ReplyDto(
      doc._id.toString(),
      doc.discussionId,
      doc.userId.toString(),
      doc.text,
      doc.likes,
      doc.dislikes,
      doc.likedBy,
      doc.dislikedBy,
      doc.createdAt
    );
  }
}
