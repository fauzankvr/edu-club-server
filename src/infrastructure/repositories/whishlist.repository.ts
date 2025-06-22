import { Model } from "mongoose";
import { IWishlist } from "../database/models/WishlistModel";
import { IWishlistRepo } from "../../application/interface/IWishlistRepo";

export class WishlistRepository implements IWishlistRepo {
  constructor(private WishlistModel: Model<IWishlist>) {}

  async findWishlist(
    studentId: string,
    courseId: string
  ): Promise<IWishlist | null> {
    return await this.WishlistModel.findOne({
      student: studentId,
      course: courseId,
    });
  }

  async addCourseToWishlist(
    studentId: string,
    courseId: string
  ): Promise<IWishlist> {
    return await this.WishlistModel.create({
      student: studentId,
      course: courseId,
    });
  }

  async removeCourseFromWishlist(
    studentId: string,
    courseId: string
  ): Promise<IWishlist | null> {
    return await this.WishlistModel.findOneAndDelete({
      student: studentId,
      course: courseId,
    });
  }

  async getWishlist(studentEmail: string): Promise<IWishlist[]> {
    return await this.WishlistModel.find({ student: studentEmail }).populate(
      "course"
    );
  }
}
