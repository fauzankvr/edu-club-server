import { ReviewEntity } from "../../domain/entities/Riview";


export interface IReviewRepository {
  addReview(review: ReviewEntity): Promise<ReviewEntity>;
  getReviewsByCourseId(courseId: string): Promise<ReviewEntity[]>;
  getMyReviewsByCourseId(
    courseId: string,
    userEmail: string
  ): Promise<ReviewEntity | null>;
  findReviewById(reviewId: string): Promise<ReviewEntity | null>;
  saveReview(review: ReviewEntity): Promise<ReviewEntity>;
}
