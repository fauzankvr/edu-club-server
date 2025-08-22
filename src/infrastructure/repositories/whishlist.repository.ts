import { Model } from "mongoose";
import { IWishlist } from "../database/models/WishlistModel";
import { IWishlistRepository } from "../../application/interface/IWishlistRepository";

export class WishlistRepository implements IWishlistRepository {
  constructor(private _wishlistModel: Model<IWishlist>) {}

  async findWishlist(
    studentId: string,
    courseId: string
  ): Promise<IWishlist | null> {
    return await this._wishlistModel.findOne({
      student: studentId,
      course: courseId,
    });
  }

  async addCourseToWishlist(
    studentId: string,
    courseId: string
  ): Promise<IWishlist> {
    return await this._wishlistModel.create({
      student: studentId,
      course: courseId,
    });
  }

  async removeCourseFromWishlist(
    studentId: string,
    courseId: string
  ): Promise<IWishlist | null> {
    return await this._wishlistModel.findOneAndDelete({
      student: studentId,
      course: courseId,
    });
  }

  async getWishlist(studentEmail: string): Promise<IWishlist[]> {
    return await this._wishlistModel.find({ student: studentEmail }).populate(
      "course"
    );
  }
}
