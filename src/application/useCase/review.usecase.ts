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
  ) {
    console.log("Adding review usecase...");
    const newReview = await this._reviewRepository.addReview(
      userEmail,
      userName,
      courseId,
      rating,
      comment
    );

    if (!newReview) {
      throw new Error("Failed to add review");
    }
    return newReview;
  }

  async getMyReview(courseId: string, studentEmail: string) {
    const reviews = await this._reviewRepository.getMyReviewsByCourseId(
      courseId,
      studentEmail
    );

    if (!reviews) {
      throw new Error("No reviews found for this course");
    }
    return reviews;
  }

  async getReview(courseId: string) {
    const reviews = await this._reviewRepository.getReviewsByCourseId(courseId);

    if (!reviews) {
      throw new Error("No reviews found for this course");
    }
    return reviews;
  }

  async handleReviewReaction(
    reviewId: string,
    userEmail: string,
    type: "like" | "dislike"
  ) {
    const review = await this._reviewRepository.findReviewById(reviewId);
    if (!review) throw new Error("Review not found");

    const liked = review.likedBy.includes(userEmail);
    const disliked = review.dislikedBy.includes(userEmail);

    if (type === "like") {
      if (liked) {
        review.likedBy.pull(userEmail);
      } else {
        review.likedBy.push(userEmail);
        if (disliked) review.dislikedBy.pull(userEmail);
      }
    } else if (type === "dislike") {
      if (disliked) {
        review.dislikedBy.pull(userEmail);
      } else {
        review.dislikedBy.push(userEmail);
        if (liked) review.likedBy.pull(userEmail);
      }
    }

    review.likes = review.likedBy.length;
    review.dislikes = review.dislikedBy.length;

    return await this._reviewRepository.saveReview(review);
  }
}
