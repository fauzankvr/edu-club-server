
export interface IReviewRepository {
  addReview(
    userEmail: string,
    userName: string,
    courseId: string,
    rating: number,
    comment: string
  ): Promise<any>;
  getReviewsByCourseId(courseId: string): Promise<any>;
  getMyReviewsByCourseId(courseId: string, email: string): Promise<any>;
  findReviewById(reviewId: string): Promise<any>;
  saveReview(review: any): Promise<any>;
}