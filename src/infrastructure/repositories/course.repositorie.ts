import mongoose, { Model } from "mongoose";
import { ICourse } from "../database/models/CourseModel";
import ICourseRepo from "../../application/interface/ICourseRepo";
import { CreateCourseDTO } from "../../application/interface/Dto/courseDto"; 
import { LanguageModel } from "../database/models/LanguageModel";
import { CategoryModel } from "../database/models/CategoryModel";

export class CourseRepository implements ICourseRepo {
  constructor(public CourseModal: Model<ICourse>) {}

  async createCourse(courseData: CreateCourseDTO): Promise<ICourse> {
    return await this.CourseModal.create(courseData);
  }

  async getCourseById(id: string): Promise<any> {
    const course = await this.CourseModal.aggregate([
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
          as: "instructorDetails",
        },
      },
      {
        $unwind: {
          path: "$instructorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return course[0] || null;
  }

  async getBlockedCourseById(id: string): Promise<any> {
    const course = await this.CourseModal.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "instructors",
          localField: "instructor",
          foreignField: "email",
          as: "instructorDetails",
        },
      },
      {
        $unwind: {
          path: "$instructorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return course[0] || null;
  }

  async getAllInstructorCourses(email: string): Promise<ICourse[]> {
    return await this.CourseModal.find({ instructor: email });
  }
  async getFilterdCourses(
    search: string,
    skip: number,
    limit: number,
    sort?: string,
    category?: string,
    language?: string,
    rating?: string,
    priceMin?: string,
    priceMax?: string
  ): Promise<{
    courses: any[];
    total: number;
    languages: string[];
    categories: string[];
  }> {
    const pipeline: any[] = [];

    if (search?.trim()) {
      const sanitizedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      pipeline.push({
        $match: {
          title: { $regex: sanitizedSearch, $options: "i" },
        },
      });
    }

    if (category) {
      pipeline.push({
        $match: { category: { $regex: `^${category}$`, $options: "i" } },
      });
    }

    if (language) {
      pipeline.push({
        $match: { language: { $regex: `^${language}$`, $options: "i" } },
      });
    }

    const min = priceMin && priceMin !== "" ? Number(priceMin) : null;
    const max = priceMax && priceMax !== "" ? Number(priceMax) : null;
    if (min != null && max != null) {
      pipeline.push({ $match: { price: { $gte: min, $lte: max } } });
    } else if (min != null && max == null) {
      pipeline.push({ $match: { price: { $gte: min } } });
    } else if (max != null && min == null) {
      pipeline.push({ $match: { price: { $lte: max } } });
    }

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
      }
    );

    const parsedRating = rating ? parseFloat(rating) : null;
    if (parsedRating != null) {
      pipeline.push({
        $match: {
          averageRating: { $gte: parsedRating },
        },
      });
    }
    pipeline.push({
      $match: {
        isBlocked: false,
      },
    });

    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await this.CourseModal.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    pipeline.push(
      {
        $lookup: {
          from: "instructors",
          localField: "instructor",
          foreignField: "email",
          as: "instructorDetails",
        },
      },
      {
        $unwind: {
          path: "$instructorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          category: 1,
          language: 1,
          price: 1,
          discount: 1,
          courseImageId: 1,
          students: 1,
          points: 1,
          averageRating: 1,
          instructor: {
            _id: "$instructorDetails._id",
            email: "$instructorDetails.email",
            name: "$instructorDetails.fullName",
            profileImage: "$instructorDetails.profileImage",
          },
        },
      }
    );

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
        pipeline.push({
          $sort: { [mongoField]: order === "asc" ? 1 : -1 },
        });
      }
    }

    pipeline.push({ $skip: skip }, { $limit: limit });

    const courses = await this.CourseModal.aggregate(pipeline);
    const languages = (
      await LanguageModel.find({ isBlocked: false }).select("name")
    ).map((lang) => lang.name) || [" "];
    const categories = (
      await CategoryModel.find({ isBlocked: false }).select("name")
    ).map((cat) => cat.name) || [" "];

    return { courses, total, languages, categories };
  }

  async updateCourseById(
    id: string,
    updateData: Partial<ICourse>
  ): Promise<ICourse | null> {
    return await this.CourseModal.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }
  async getAllCourses(email: string): Promise<ICourse[]> {
    return await this.CourseModal.find({ instructor: email });
  }
  async getAdminAllCourses(): Promise<ICourse[]> {
    return await this.CourseModal.find();
  }
  async findCourseByTitle(
    title: string,
    instructor: string
  ): Promise<ICourse | null> {
    return await this.CourseModal.findOne({
      instructor: instructor,
      title: title,
    });
  }
}
