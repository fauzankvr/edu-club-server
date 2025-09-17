import { ReviewDto } from "./Dto/ReviewDto";

export interface IReviewUseCase {
  addReview(
    userEmail: string,
    userName: string,
    courseId: string,
    rating: number,
    comment: string
  ): Promise<ReviewDto>;

  getMyReview(courseId: string, studentEmail: string): Promise<ReviewDto>;

  getReview(courseId: string): Promise<ReviewDto[]>;

  handleReviewReaction(
    reviewId: string,
    userEmail: string,
    type: "like" | "dislike"
  ): Promise<ReviewDto>;
}
