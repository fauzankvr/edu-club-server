import { ReviewEntity } from "../../domain/entities/Riview";
import { ReviewDto } from "../interface/Dto/ReviewDto";
import { IReviewUseCase } from "../interface/IRevewUseCase";
import { IReviewRepository } from "../interface/IReviewRepository";

export class ReviewUseCase implements IReviewUseCase {
  constructor(private _reviewRepository: IReviewRepository) {}

  async addReview(
    userEmail: string,
    userName: string,
    courseId: string,
    rating: number,
    comment: string
  ): Promise<ReviewDto> {
    const reviewEntity = new ReviewEntity(
      "",
      courseId,
      userEmail,
      userName,
      rating,
      comment,
      0,
      0,
      [],
      [],
      new Date()
    );

    const savedReview = await this._reviewRepository.addReview(reviewEntity);
    if (!savedReview) throw new Error("Failed to add review");

    return ReviewDto.fromEntity(savedReview);
  }

  async getMyReview(
    courseId: string,
    studentEmail: string
  ): Promise<ReviewDto> {
    const review = await this._reviewRepository.getMyReviewsByCourseId(
      courseId,
      studentEmail
    );

    if (!review) throw new Error("No review found for this course");

    return ReviewDto.fromEntity(review);
  }

  async getReview(courseId: string): Promise<ReviewDto[]> {
    const reviews = await this._reviewRepository.getReviewsByCourseId(courseId);
    if (!reviews || reviews.length === 0) {
      throw new Error("No reviews found for this course");
    }
    return reviews.map((r) => ReviewDto.fromEntity(r));
  }

  async handleReviewReaction(
    reviewId: string,
    userEmail: string,
    type: "like" | "dislike"
  ): Promise<ReviewDto> {
    const review = await this._reviewRepository.findReviewById(reviewId);
    if (!review) throw new Error("Review not found");

    const liked = review.likedBy.includes(userEmail);
    const disliked = review.dislikedBy.includes(userEmail);

    if (type === "like") {
      if (liked) {
        review.likedBy = review.likedBy.filter((u) => u !== userEmail);
      } else {
        review.likedBy.push(userEmail);
        if (disliked) {
          review.dislikedBy = review.dislikedBy.filter((u) => u !== userEmail);
        }
      }
    } else if (type === "dislike") {
      if (disliked) {
        review.dislikedBy = review.dislikedBy.filter((u) => u !== userEmail);
      } else {
        review.dislikedBy.push(userEmail);
        if (liked) {
          review.likedBy = review.likedBy.filter((u) => u !== userEmail);
        }
      }
    }

    review.likes = review.likedBy.length;
    review.dislikes = review.dislikedBy.length;

    const updatedReview = await this._reviewRepository.saveReview(review);
    return ReviewDto.fromEntity(updatedReview);
  }
}
