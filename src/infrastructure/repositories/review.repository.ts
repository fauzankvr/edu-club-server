import mongoose, { Model } from "mongoose";
import { IReview } from "../database/models/ReviewModel";
import { IReviewRepository } from "../../application/interface/IReviewRepository";
import { ReviewEntity } from "../../domain/entities/Riview";


// Helper to map IReview document to ReviewEntity
const toEntity = (reviewDoc: IReview): ReviewEntity => {
  return new ReviewEntity(
    reviewDoc._id.toString(),
    reviewDoc.course.toString(),
    reviewDoc.user,
    reviewDoc.name,
    reviewDoc.rating,
    reviewDoc.comment,
    reviewDoc.likes,
    reviewDoc.dislikes,
    reviewDoc.likedBy,
    reviewDoc.dislikedBy,
    reviewDoc.createdAt
  );
};

export class ReviewRepository implements IReviewRepository {
  constructor(private _reviewModel: Model<IReview>) {}

  async addReview(review: ReviewEntity): Promise<ReviewEntity> {
    const created = await this._reviewModel.create({
      course: review.course,
      user: review.user,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      likes: review.likes,
      dislikes: review.dislikes,
      likedBy: review.likedBy,
      dislikedBy: review.dislikedBy,
    });
    return toEntity(created);
  }

  async getReviewsByCourseId(courseId: string): Promise<ReviewEntity[]> {
    const docs = await this._reviewModel
      .find({ course: new mongoose.Types.ObjectId(courseId) })
      .sort({ createdAt: -1 });
    return docs.map(toEntity);
  }

  async getMyReviewsByCourseId(
    courseId: string,
    userEmail: string
  ): Promise<ReviewEntity | null> {
    const doc = await this._reviewModel.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
          user: userEmail,
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "user",
          foreignField: "email",
          as:"user"
        },
      },
      {$unwind:"$user"}
    ]);
    return doc ? toEntity(doc[0]) : null;
  }

  async findReviewById(reviewId: string): Promise<ReviewEntity | null> {
    const doc = await this._reviewModel.findById(reviewId);
    return doc ? toEntity(doc) : null;
  }

  async saveReview(review: ReviewEntity): Promise<ReviewEntity> {
    const doc = await this._reviewModel.findById(review.id);
    if (!doc) throw new Error("Review not found");

    // Update fields from entity
    doc.rating = review.rating;
    doc.comment = review.comment;
    doc.likes = review.likes;
    doc.dislikes = review.dislikes;
    doc.likedBy = review.likedBy;
    doc.dislikedBy = review.dislikedBy;

    await doc.save();
    return toEntity(doc);
  }
}
