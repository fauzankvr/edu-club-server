import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { IWishlist } from "../database/models/WishlistModel";
import { ICourse } from "../database/models/CourseModel";
import { IWishlistRepository } from "../../application/interface/IWishlistRepository";
import { WishlistEntity } from "../../domain/entities/Wishlist";
import { CourseEntity } from "../../domain/entities/Course";

interface IWishlistPopulated extends Omit<IWishlist, "course"> {
  course: ICourse;
}

export class WishlistRepository
  extends BaseRepository<IWishlist, WishlistEntity>
  implements IWishlistRepository
{
  constructor(private _wishlistModel: Model<IWishlist>) {
    super(_wishlistModel, WishlistRepository.toEntity);
  }

  // DB doc -> Entity mapper (handles non-populated course)
  private static toEntity(data: IWishlist): WishlistEntity {
    return new WishlistEntity(
      data.student?.toString() ?? "",
      data.course.toString(),
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date()
    );
  }

  // DB doc -> Entity mapper (handles populated course)
  private static toEntityWithPopulatedCourse(
    data: IWishlistPopulated
  ): WishlistEntity {
    const course = data.course;

    const courseEntity = new CourseEntity(
      course.title || "Unknown Title",
      course.description || "No description available",
      course.language || "",
      course.category || "",
      course.courseImageId || "",
      course.points || [],
      course.price || 0,
      course.discount || null,
      course.students ? course.students.map((id) => id.toString()) : null,
      course.instructor || null,
      course._id.toString(),
      course.isBlocked ?? false
    );

    return new WishlistEntity(
      data.student?.toString() ?? "",
      courseEntity,
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date()
    );
  }

  // Array mapper for non-populated courses
  private static toEntities(data: IWishlist[]): WishlistEntity[] {
    return data.map(WishlistRepository.toEntity);
  }

  // Array mapper for populated courses
  private static toEntitiesWithPopulatedCourse(
    data: IWishlistPopulated[]
  ): WishlistEntity[] {
    return data.map(WishlistRepository.toEntityWithPopulatedCourse);
  }

  async find(
    studentId: string,
    courseId: string
  ): Promise<WishlistEntity | null> {
    const result = await this._wishlistModel.findOne({
      student: studentId,
      course: courseId,
    });
    return result ? WishlistRepository.toEntity(result) : null;
  }

  async add(studentId: string, courseId: string): Promise<WishlistEntity> {
    const result = await this._wishlistModel.create({
      student: studentId,
      course: courseId,
    });
    return WishlistRepository.toEntity(result);
  }

  async remove(
    studentId: string,
    courseId: string
  ): Promise<WishlistEntity | null> {
    const result = await this._wishlistModel.findOneAndDelete({
      student: studentId,
      course: courseId,
    });
    return result ? WishlistRepository.toEntity(result) : null;
  }

  async getByStudentId(studentId: string): Promise<WishlistEntity[]> {
    const results = (await this._wishlistModel
      .find({ student: studentId })
      .populate("course")
      .exec()) as unknown as IWishlistPopulated[];
    console.log(results)
    return WishlistRepository.toEntitiesWithPopulatedCourse(results);
  }
}
