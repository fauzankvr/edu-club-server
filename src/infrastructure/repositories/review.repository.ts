import mongoose, { Model } from "mongoose";
import { IReview } from "../database/models/ReviewModel";

export class ReviewRepository {
  constructor(private ReviewModel : Model<IReview>) {}

  async addReview(
    userEmail: string,
    userName: string,
    courseId: string,
    rating: number,
    comment: string
  ): Promise<any> {
    return await this.ReviewModel.create({
      course: courseId,
      user: userEmail,
      name: userName,
      rating,
      comment,
    });
  }

  async getReviewsByCourseId(courseId: string): Promise<any> {
    return await this.ReviewModel.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $lookup: {
          from: "students",
          localField: "user",
          foreignField: "email",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          rating: 1,
          comment: 1,
          likes: 1,
          dislikes: 1,
          createdAt: 1,
          updatedAt: 1,
          "userDetails.email": 1,
          "userDetails.profileImage": 1,
          "userDetails.firstName": 1,
          "userDetails.lastName": 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  }

  async getMyReviewsByCourseId(courseId: string, email: string): Promise<any> {
    const review = await this.ReviewModel.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
          user: email,
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "user",
          foreignField: "email",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          rating: 1,
          comment: 1,
          likes: 1,
          dislikes: 1,
          createdAt: 1,
          updatedAt: 1,
          "userDetails.email": 1,
          "userDetails.profileImage": 1,
          "userDetails.firstName": 1,
          "userDetails.lastName": 1,
        },
      },
    ]);
    return review[0] || null;
  }

  async findReviewById(reviewId: string): Promise<any> {
    return await this.ReviewModel.findById(reviewId);
  }

  async saveReview(review: any): Promise<any> {
    return await review.save();
  }
}
