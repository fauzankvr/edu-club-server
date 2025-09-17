import mongoose, { Model } from "mongoose";
import { ICourse } from "../database/models/CourseModel";
import ICourseRepository, {
  FilteredCoursesResult,
} from "../../application/interface/ICourseRepository";
import { CreateCourseDTO } from "../../application/interface/Dto/courseDto";
import { LanguageModel } from "../database/models/LanguageModel";
import { CategoryModel } from "../database/models/CategoryModel";
import { CourseEntity } from "../../domain/entities/Course";
import { InstructorEntity } from "../../domain/entities/Instructor";

export class CourseRepository implements ICourseRepository {
  constructor(private readonly _courseModel: Model<ICourse>) {}

  /** Map DB model → Entity */
  private toEntity(course: ICourse): CourseEntity {
    return new CourseEntity(
      course.title,
      course.description,
      course.language,
      course.category,
      course.courseImageId,
      course.points,
      course.price,
      course.discount,
      course.students?.map((item) => item?.toString()) ?? [],
      course.instructor,
      course._id.toString(),
      course.isBlocked
    );
  }

  private toPopulatedEntity(course: any): CourseEntity {
    return new CourseEntity(
      course.title,
      course.description,
      course.language,
      course.category,
      course.courseImageId,
      course.points,
      course.price,
      course.discount,
      course.students,
      course.instructor,
      course._id?.toString(),
      course.isBlocked,
      course.averageRating
    );
  }

  async create(data: CreateCourseDTO): Promise<CourseEntity> {
    const course = await this._courseModel.create(data);
    return this.toEntity(course);
  }

  async count(): Promise<number> {
    return this._courseModel.countDocuments();
  }

  async findById(id: string): Promise<CourseEntity | null> {
    const course = await this._courseModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isBlocked: false,
        },
      },
      {
        $lookup: {
          from: "instructors",
          localField: "instructor",
          foreignField: "email",
          as: "instructor",
        },
      },
      { $unwind: "$instructor" },
    ]);

    return course ? this.toPopulatedEntity(course[0]) : null;
  }

  async findBlockedById(id: string): Promise<CourseEntity | null> {
    const course = await this._courseModel.findById(id);
    return course ? this.toEntity(course) : null;
  }

  async findByInstructor(email: string): Promise<CourseEntity[]> {
    const courses = await this._courseModel.find({ instructor: email });
    return courses.map((c) => this.toEntity(c));
  }

  async filter(
    search: string,
    skip: number,
    limit: number,
    sort?: string,
    category?: string,
    language?: string,
    rating?: string,
    priceMin?: string,
    priceMax?: string
  ): Promise<FilteredCoursesResult> {
    const pipeline: any[] = [];

    // ----- Text / exact filters -----
    if (search?.trim()) {
      const sanitizedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      pipeline.push({
        $match: { title: { $regex: sanitizedSearch, $options: "i" } },
      });
    }
    if (category)
      pipeline.push({
        $match: { category: { $regex: `^${category}$`, $options: "i" } },
      });
    if (language)
      pipeline.push({
        $match: { language: { $regex: `^${language}$`, $options: "i" } },
      });

    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    if (min != null && max != null)
      pipeline.push({ $match: { price: { $gte: min, $lte: max } } });
    else if (min != null) pipeline.push({ $match: { price: { $gte: min } } });
    else if (max != null) pipeline.push({ $match: { price: { $lte: max } } });

    // Always exclude blocked as early as possible
    pipeline.push({ $match: { isBlocked: false } });

    // ----- Reviews -> averageRating (hide raw reviews) -----
    pipeline.push(
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "course",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
        },
      },
      { $unset: "reviews" } // don't include full reviews in result
    );

    // Rating filter (after computing averageRating)
    if (rating) {
      pipeline.push({
        $match: { averageRating: { $gte: parseFloat(rating) } },
      });
    }

    // ----- Instructor lookup (by EMAIL, because Course.instructor is a string email) -----
    pipeline.push(
      {
        $lookup: {
          from: "instructors",
          let: { instEmail: "$instructor" }, // courses.instructor = email string
          pipeline: [
            { $match: { $expr: { $eq: ["$email", "$$instEmail"] } } },
            { $project: { _id: 1, email: 1, fullName: 1, profileImage: 1 } },
          ],
          as: "instructor",
        },
      },
      { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } }
    );

    // ----- Sorting -----
    if (sort) {
      const [field, order] = sort.split("-");
      const mongoField =
        field === "title"
          ? "title"
          : field === "price"
          ? "price"
          : field === "rating"
          ? "averageRating"
          : null;
      if (mongoField) {
        pipeline.push({ $sort: { [mongoField]: order === "asc" ? 1 : -1 } });
      }
    } else {
      // Optional: stable default sort
      pipeline.push({ $sort: { _id: -1 } });
    }

    // ----- Pagination + total in a single pass -----
    const facetPipeline = [
      ...pipeline,
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "total" }],
        },
      },
      {
        $project: {
          courses: "$data",
          total: { $ifNull: [{ $arrayElemAt: ["$total.total", 0] }, 0] },
        },
      },
    ];

    const [agg] = await this._courseModel.aggregate(facetPipeline);
    let courses = agg?.courses ?? [];
    const total = agg?.total ?? 0;
    // Fetch filters (languages & categories)
    const languages = (
      await LanguageModel.find({ isBlocked: false }).select("name")
    ).map((l) => l.name);
    const categories = (
      await CategoryModel.find({ isBlocked: false }).select("name")
    ).map((c) => c.name);

    // IMPORTANT: do NOT map through toEntity here (it will drop nested instructor/averageRating)
    courses = courses.map((item: any) => this.toEntity(item));
    return {
      courses, // already has _id, instructor { _id, email, name, profileImage }, averageRating
      total,
      languages,
      categories,
    };
  }

  async update(
    id: string,
    data: Partial<CourseEntity>
  ): Promise<CourseEntity | null> {
    console.log(data)
    const updated = await this._courseModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    return updated ? this.toEntity(updated) : null;
  }

  async findAllByEmail(email: string): Promise<CourseEntity[]> {
    const courses = await this._courseModel.find({ instructor: email });
    return courses.map((c) => this.toEntity(c));
  }

  async findAllAdmin(limit: number, skip: number): Promise<CourseEntity[]> {
    const courses = await this._courseModel.find().limit(limit).skip(skip);
    return courses.map((c) => this.toEntity(c));
  }

  async findByTitle(
    title: string,
    instructor: string
  ): Promise<CourseEntity | null> {
    const course = await this._courseModel.findOne({ instructor, title });
    return course ? this.toEntity(course) : null;
  }
}
