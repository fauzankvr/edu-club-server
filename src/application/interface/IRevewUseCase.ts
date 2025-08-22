import { IReview } from "../../infrastructure/database/models/ReviewModel";

export interface IReviewUseCase {
  addReview(
    userEmail: string,
    userName: string,
    courseId: string,
    rating: number,
    comment: string
  ): Promise<IReview>;

  getMyReview(courseId: string, studentEmail: string): Promise<IReview>;

  getReview(courseId: string): Promise<IReview[]>;

  handleReviewReaction(
    reviewId: string,
    userEmail: string,
    type: "like" | "dislike"
  ): Promise<IReview>;
}
