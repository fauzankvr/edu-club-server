import mongoose, { Types } from "mongoose";
import IStudentRepo from "../../application/interface/IStudentRepo";
import { Student } from "../../domain/entities/Student";
import CarriculamModel from "../database/models/CarriculamModel";
import Course from "../database/models/CourseModel";
import OrderModel from "../database/models/OrderModel";
import ReviewModel from "../database/models/ReviewModel";
import StudentModel, { IStudents } from "../database/models/StudentModel";
import { WishlistModel } from "../database/models/WishlistModel";
import { IDiscussion, IReply } from "../../application/interface/IDiscussion";
import DiscussionModel from "../database/models/Discussion";
import { LanguageModel } from "../database/models/LanguageModel";
import { CategoryModel } from "../database/models/CategoryModel";
import Notes from "../database/models/NotesModel";

export interface LoginData{
  email: string,
  password:string
}

export class StudentRepository implements IStudentRepo {
  async createStudent(student: Student): Promise<Student> {
    const created = await StudentModel.create({
      email: student.email,
      password: student.password,
      isBlocked: false,
      firstName: student.firstName || "Anonymous",
      lastName: student.lastName,
      phone: student.phone,
      linkedInId: student.linkedInId,
      githubId: student.githubId,
      googleId: student.googleId,
      profileImage: student.profileImage,
    });

    return new Student(
      created.email,
      created.password,
      created.isBlocked,
      created.firstName,
      created.lastName,
      created.phone,
      created.linkedInId,
      created.githubId,
      created.googleId,
      created.profileImage,
      created.createdAt,
      created.updatedAt
    );
  }

  async findStudentById(id: string): Promise<any> {
    return await StudentModel.findOne({ _id: id });
  }

  async findStudentByEmail(email: string): Promise<Student | null> {
    const student = await StudentModel.findOne({ email }).select(
      "email isBlocked firstName lastName phone linkedInId githubId googleId profileImage createdAt updatedAt"
    );
    if (!student) return null;

    return new Student(
      student.email,
      "", // password not selected
      student.isBlocked,
      student.firstName,
      student.lastName,
      student.phone,
      student.linkedInId,
      student.githubId,
      student.googleId,
      student.profileImage,
      student.createdAt,
      student.updatedAt,
      student._id
    );
  }

  async findSafeStudentByEmail(email: string): Promise<IStudents | null> {
    const student = await StudentModel.findOne({ email }).select(
      "email password isBlocked"
    );
    return student;
  }

  async updateProfileByEmail(
    email: string,
    updateData: object
  ): Promise<boolean> {
    console.log("my db update");
    const updated = await StudentModel.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, projection: "-password" }
    );

    return !!updated;
  }
  async getAllStudents(): Promise<any[]> {
    const students = await StudentModel.find({});
    return students;
  }
  async blockStudent(email: string): Promise<boolean> {
    const student = await StudentModel.findOne({ email });

    if (!student) {
      throw new Error("Student not found");
    }

    student.isBlocked = !student.isBlocked;
    await student.save();

    return student.isBlocked;
  }

  async getAllCourses(
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
    try {
      console.log("Input parameters:", {
        search,
        skip,
        limit,
        sort,
        category,
        language,
        rating,
        priceMin,
        priceMax,
      });
      const pipeline: any[] = [];

      // Search
      if (search?.trim()) {
        // Sanitize search input to prevent regex injection
        const sanitizedSearch = search
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        pipeline.push({
          $match: {
            title: { $regex: sanitizedSearch, $options: "i" }, // Match anywhere in the title
          },
        });
      }

      // Category filter
      if (category) {
        pipeline.push({
          $match: { category: { $regex: `^${category}$`, $options: "i" } },
        });
      }

      // Language filter
      if (language) {
        pipeline.push({
          $match: { language: { $regex: `^${language}$`, $options: "i" } },
        });
      }

      // Price range filter
      const min = priceMin && priceMin !== "" ? Number(priceMin) : null;
      const max = priceMax && priceMax !== "" ? Number(priceMax) : null;
      if (min != null && max != null) {
        pipeline.push({ $match: { price: { $gte: min, $lte: max } } });
      } else if (min != null && max == null) {
        pipeline.push({ $match: { price: { $gte: min } } });
      } else if (max != null && min == null) {
        pipeline.push({ $match: { price: { $lte: max } } });
      }

      // Lookup and average rating from Review collection
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
            averageRating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] }, // Default to 0 if no reviews
          },
        }
      );

      // Log courses with reviews
      const coursesWithReviews = await Course.aggregate([...pipeline]);

      // Filter by minimum rating if provided
      const parsedRating = rating ? parseFloat(rating) : null;
      if (parsedRating != null) {
        pipeline.push({
          $match: {
            averageRating: { $gte: parsedRating }, // Use $gte for rating range
          },
        });
      }

      // Log courses after rating filter
      const coursesAfterFilters = await Course.aggregate([...pipeline]);

      // Count total after filters
      const totalPipeline = [...pipeline, { $count: "total" }];
      const totalResult = await Course.aggregate(totalPipeline);
      
      const total = totalResult[0]?.total || 0;

      // Join instructor data
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

      // Sorting
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

      // Pagination
      pipeline.push({ $skip: skip }, { $limit: limit });

      const courses = await Course.aggregate(pipeline);

      const languages = (
        await LanguageModel.find({ isBlocked: false }).select("name")
      ).map((lang) => lang.name) || [" "];

      const categories = (
        await CategoryModel.find({ isBlocked: false }).select("name")
      ).map((cat) => cat.name) || [" "];

      return { courses, total, languages, categories };
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw new Error("No courses available");
    }
  }

  async getCourseById(id: string): Promise<any> {
    const course = await Course.aggregate([
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

    if (!course || course.length === 0) {
      throw new Error("Course not found");
    }

    return course[0]; // return the first (and only) matched course
  }

  async getOrderById(paypalOrderId: string): Promise<any> {
    const order = await OrderModel.findOne({ paypalOrderId });
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }
  async getCurriculumByCourseId(courseId: string): Promise<any> {
    const carriculam = await CarriculamModel.find({ courseId });
    if (!carriculam) {
      throw new Error("Carriculam not found");
    }
    return carriculam;
  }

  async addReview(
    userEmail: string,
    userName: string,
    courseId: string,
    rating: number,
    comment: string
  ): Promise<any> {
    try {
      const newReview = await ReviewModel.create({
        course: courseId,
        user: userEmail,
        name: userName,
        rating,
        comment,
      });

      return newReview;
    } catch (error) {
      throw new Error("Failed to add review: " + error);
    }
  }

  async getReviewsByCourseId(courseId: string): Promise<any> {
    try {
      const reviews = await ReviewModel.aggregate([
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

      return reviews;
    } catch (error: any) {
      throw new Error("Failed to fetch reviews: " + error.message);
    }
  }

  async getMyReviewsByCourseId(courseId: string, email: string): Promise<any> {
    try {
      const review = await ReviewModel.aggregate([
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
    } catch (error: any) {
      throw new Error("Failed to fetch user's review: " + error.message);
    }
  }

  async findReviewById(reviewId: string): Promise<any> {
    return await ReviewModel.findById(reviewId);
  }
  async saveReview(review: any): Promise<any> {
    return await review.save();
  }
  async findWishlist(studentId: string, courseId: string): Promise<any> {
    const exists = await WishlistModel.findOne({
      student: studentId,
      course: courseId,
    });
    return exists;
  }
  async addCourseToWishlist(studentId: string, courseId: string): Promise<any> {
    const exists = await WishlistModel.findOne({
      student: studentId,
      course: courseId,
    });

    if (exists) {
      throw new Error("Course already in wishlist");
    }

    const wishlistEntry = await WishlistModel.create({
      student: studentId,
      course: courseId,
    });
    return wishlistEntry;
  }
  async removeCourseFromWishlist(
    studentId: string,
    courseId: string
  ): Promise<any> {
    const wishlistEntry = await WishlistModel.findOneAndDelete({
      student: studentId,
      course: courseId,
    });
    if (!wishlistEntry) {
      throw new Error("Wishlist entry not found");
    }
    return wishlistEntry;
  }
  async getWishlist(studentEmail: string): Promise<any> {
    const student = await StudentModel.findOne({ email: studentEmail });
    if (!student) {
      throw new Error("Student not found");
    }

    const wishlist = await WishlistModel.find({
      student: studentEmail,
    }).populate("course");
    return wishlist;
  }

  async findPaidCourses(id: string): Promise<any> {
    try {
      const userId = id.trim();
      if (!userId) {
        throw new Error("Invalid user ID");
      }

      // Perform the aggregation to get the paid courses along with order details
      const courses = await OrderModel.aggregate([
        {
          $match: {
            userId: userId,
            status: "PAID",
          },
        },
        {
          $lookup: {
            from: "courses",
            let: { courseIdString: "$courseId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$courseIdString", { $toString: "$_id" }],
                  },
                },
              },
            ],
            as: "courseDetails",
          },
        },
        {
          $unwind: {
            path: "$courseDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            orderDetails: "$$ROOT",
            courseDetails: 1,
          },
        },
      ]);

      if (!courses || courses.length === 0) {
        console.log("No paid courses found for this user.");
      } else {
        console.log("Courses and Order details found:", courses);
      }

      return courses;
    } catch (error) {
      console.error("Error fetching paid courses:");
      throw new Error("Failed to fetch paid courses");
    }
  }

  async getCarriculamTopics(id: string): Promise<any> {
    const courseObjectId = new Types.ObjectId(id);

    const curriculum = await CarriculamModel.findOne(
      {
        courseId: courseObjectId,
      },
      {
        "sections.title": 1,
        "sections.lectures.title": 1,
        _id: 0,
      }
    ).lean();
    return curriculum;
  }

  async createDiscussion(paypalOrderId: string, data: Partial<IDiscussion>) {
    const order = await OrderModel.findOne({ paypalOrderId });
    if (!order || !order.courseId || !order.userId) {
      throw new Error("Order not found or courseId/userId missing");
    }

    const student = await StudentModel.findOne({ _id: order.userId });
    if (!student) {
      throw new Error("Student not found");
    }

    const discussionData = {
      text: data,
      courseId: order.courseId,
      studentId: student._id,
    };

    const discussion = await DiscussionModel.create(discussionData);

    return await discussion.populate(
      "studentId",
      "firstName lastName profileImage"
    );
  }

  async getAllDiscussions(paypalOrderId: string): Promise<IDiscussion[]> {
    const order = await OrderModel.findOne({ paypalOrderId });
    if (!order || !order.courseId) {
      throw new Error("Order not found or courseId missing");
    }

    return await DiscussionModel.find({ courseId: order.courseId }).populate(
      "studentId",
      "firstName lastName profileImage"
    );
  }

  async findByIdDicussion(id: string): Promise<IDiscussion> {
    const discussion = await DiscussionModel.findById(id);
    if (!discussion) throw new Error("Discussion not found");
    return discussion;
  }

  async updateReaction(
    id: string,
    data: Partial<IDiscussion>
  ): Promise<IDiscussion> {
    try {
      if (!id) throw new Error("Discussion ID is required");
      if (!data) throw new Error("Update data is required");

      const existingDiscussion = await DiscussionModel.findById(id);
      if (!existingDiscussion) throw new Error("Discussion not found");

      const updatedDiscussion = await DiscussionModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!updatedDiscussion) throw new Error("Failed to update discussion");

      return updatedDiscussion;
    } catch (error) {
      console.error(`Error updating reactions for discussion ${id}:`, error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update discussion"
      );
    }
  }

  async updateReplay(
    id: string,
    data: Partial<IDiscussion>
  ): Promise<IDiscussion | null> {
    return await DiscussionModel.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("userId", "firstName lastName profileImage");
  }
  async findReplayById(id: string): Promise<IReply[]> {
    const discussion = await DiscussionModel.findById(id)
      .select("replies")
      .populate("replies.userId", "firstName lastName profileImage")
      .lean();
    if (!discussion || !discussion.replies) return [];
    return discussion.replies;
  }

  async getNote(id: string, courseId: string): Promise<any> {
    const notes = await Notes.find({ student_id: id, course_id: courseId });
    if (!notes) {
      return [];
    }
    console.log("Notes found:", notes);
    return notes;
  }
  createNote(id: string, data: any): Promise<any> {
    const notes = new Notes({
      title: data.title,
      notes: data.notes,
      student_id: id,
      course_id: data.course_id,
    });
    return notes.save();
  }
  updateNotes(id: string, studentId: string, newNote: string): Promise<any> {
    return Notes.findOneAndUpdate(
      { _id: id, student_id: studentId },
      { $push: { notes: newNote } },
      { new: true }
    );
  }
  deleteNotes(id: string, studentId: string): Promise<any> {
    return Notes.findOneAndDelete({ _id: id, student_id: studentId });
  }
  // DELETE a specific note from notes[] array by index
  async deleteNote(id: string, studentId: string, index: number): Promise<any> {
    const noteDoc = await Notes.findOne({ _id: id, student_id: studentId });
    if (!noteDoc) throw new Error("Note not found");

    // Remove note at index
    if (noteDoc.notes && index >= 0 && index < noteDoc.notes.length) {
      noteDoc.notes.splice(index, 1);
      return await noteDoc.save(); // Save updated document
    } else {
      throw new Error("Invalid note index");
    }
  }

  // UPDATE a specific note from notes[] array by index
  async updateNote(
    id: string,
    studentId: string,
    newNote: string,
    index: number
  ): Promise<any> {
    const noteDoc = await Notes.findOne({ _id: id, student_id: studentId });
    if (!noteDoc) throw new Error("Note not found");

    if (noteDoc.notes && index >= 0 && index < noteDoc.notes.length) {
      noteDoc.notes[index] = newNote;
      return await noteDoc.save(); // Save updated document
    } else {
      throw new Error("Invalid note index");
    }
  }
}
