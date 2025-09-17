import { DiscussionEntity } from "../../../domain/entities/Discussion";
import { ReplyEntity } from "../../../domain/entities/Reply";


export class ReplyDto {
  constructor(
    public readonly id: string,
    public readonly discussionId: string,
    public readonly userId: string,
    public readonly text: string,
    public readonly likes: number,
    public readonly dislikes: number,
    public readonly createdAt: Date
  ) {}

  static fromEntity(entity: ReplyEntity): ReplyDto {
    return new ReplyDto(
      entity.id,
      entity.discussionId,
      entity.userId,
      entity.text,
      entity.likes,
      entity.dislikes,
      entity.createdAt
    );
  }
}


export class DiscussionDto {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly courseId: string,
    public readonly text: string,
    public readonly likes: number,
    public readonly dislikes: number,
    public readonly likedBy: string[],   // could also expose just counts if you want
    public readonly dislikedBy: string[],
    public readonly replies: ReplyDto[],
    public readonly createdAt: Date
  ) {}

  static fromEntity(entity: DiscussionEntity): DiscussionDto {
    return new DiscussionDto(
      entity.id,
      entity.studentId,
      entity.courseId,
      entity.text,
      entity.likes,
      entity.dislikes,
      entity.likedBy,
      entity.dislikedBy,
      entity.replies ? entity?.replies?.map(r => ReplyDto.fromEntity(r)): [],
      entity?.createdAt ?? new Date()
    );
  }
}
