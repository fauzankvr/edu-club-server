import { ReviewEntity } from "../../../domain/entities/Riview";
import { IReview } from "../../../infrastructure/database/models/ReviewModel";

export class ReviewDto {
  constructor(
    public readonly id: string,
    public readonly course: string,
    public readonly user: string,
    public readonly name: string,
    public readonly rating: number,
    public readonly comment: string,
    public readonly likes: number,
    public readonly dislikes: number,
    public readonly likedBy: string[],
    public readonly dislikedBy: string[],
    public readonly createdAt?: Date
  ) {}

  // ---------- Entity → DTO ----------
  static fromEntity(entity: ReviewEntity): ReviewDto {
    return new ReviewDto(
      entity.id,
      entity.course,
      entity.user,
      entity.name,
      entity.rating,
      entity.comment,
      entity.likes,
      entity.dislikes,
      entity.likedBy,
      entity.dislikedBy,
      entity.createdAt
    );
  }

  // ---------- Persistence (Mongoose) → DTO ----------
  static fromPersistence(doc: IReview): ReviewDto {
    return new ReviewDto(
      doc._id.toString(),
      doc.course.toString(),
      doc.user.toString(),
      doc.name,
      doc.rating,
      doc.comment,
      doc.likes,
      doc.dislikes,
      doc.likedBy,
      doc.dislikedBy,
      doc.createdAt
    );
  }

  // ---------- DTO → Entity ----------
  toEntity(): ReviewEntity {
    return new ReviewEntity(
      this.id,
      this.course,
      this.user,
      this.name,
      this.rating,
      this.comment,
      this.likes,
      this.dislikes,
      this.likedBy,
      this.dislikedBy,
      this.createdAt
    );
  }
}
