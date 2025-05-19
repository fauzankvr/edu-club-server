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
   return await StudentModel.findOne({_id:id})
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
      student._id,
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

  async getAllCourses(): Promise<any[]> {
    try {
      const courses = await Course.aggregate([
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
            path: "$instructorDetails", // Unwind the array to a single object
            preserveNullAndEmptyArrays: true, // Keep courses even if no instructor is found
          },
        },
        {
          $project: {
            _id: 1,
            category: 1,
            courseImageId: 1,
            description: 1,
            discount: 1,
            instructor: {
              _id: "$instructorDetails._id",
              email: "$instructorDetails.email",
              name: "$instructorDetails.fullName",
              profileImage: "$instructorDetails.profileImage",
            },
            language: 1,
            points: 1,
            price: 1,
            students: 1,
            title: 1,
          },
        },
      ]);

      return courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw new Error("Failed to fetch courses");
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
    )
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

  async updateReplay(id: string, data: Partial<IDiscussion>): Promise<IDiscussion | null> {
    return await DiscussionModel.findByIdAndUpdate(id, data, { new: true }).populate(
      "userId",
      "firstName lastName profileImage"
    );
  }
 async findReplayById(id: string): Promise<IReply[]> {
   const discussion = await DiscussionModel.findById(id)
     .select("replies")
     .populate("replies.userId", "firstName lastName profileImage")
     .lean();
   if (!discussion || !discussion.replies) return [];
   return discussion.replies;
 }
}
