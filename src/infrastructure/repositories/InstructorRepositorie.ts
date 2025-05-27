import IInstructorRepo from "../../application/interface/IInstructorRepo";
import { Instructor } from "../../domain/entities/Instructor";
import InstructorModal, { IInstructor } from "../database/models/InstructorModel";
import InstructorOtpModal, { IinstructorOtp } from "../database/models/InstructorOtp";
import CourseModal, {ICourse} from "../database/models/CourseModel";
import { CreateCourseDTO } from "../../application/useCase/InstructorUseCase";
import { ISection } from "../database/models/CarriculamModel";
import CurriculumModel from "../database/models/CarriculamModel";
import { ChatModel } from "../database/models/ChatModel";
import { MessageModel } from "../database/models/MessageModel";
import TransactionModel from "../database/models/Transaction";


export class InstructorRepository implements IInstructorRepo {
  async crateInstructor(instructor: Instructor): Promise<object> {
    const created = await InstructorModal.create({
      email: instructor.email,
      password: instructor.password,
      isBlocked: false,
      fullName: instructor.fullName || "Anonymous",
      phone: instructor.phone,
      nationality: instructor.nationality,
      dateOfBirth: instructor.dateOfBirth,
      eduQulification: instructor.eduQulification,
      profileImage: instructor.profileImage,
    });
    return created;
  }
  async saveOtp(email: string, otp: string): Promise<object> {
    const otpData = await InstructorOtpModal.create({ email, otp });
    return otpData;
  }
  async findById(id: string): Promise<IInstructor | null> {
    const instructor = await InstructorModal.findById(id);
    return instructor;
  }
  async findInstrucotrByEmail(email: string): Promise<IInstructor | null> {
    const instructorData = await InstructorModal.findOne({ email });
    return instructorData;
  }
  async findAllInstructors(): Promise<any[]> {
    const instructor = await InstructorModal.find({});
    return instructor;
  }
  async blockInstructor(email: string): Promise<boolean> {
    const student = await InstructorModal.findOne({ email });
    if (!student) {
      throw new Error("Student not found");
    }

    student.IsBlocked = !student.IsBlocked;
    await student.save();
    return student.IsBlocked;
  }
  async findOtp(email: string): Promise<IinstructorOtp | null> {
    const OtpData = await InstructorOtpModal.findOne({ email });
    console.log(OtpData);
    return OtpData;
  }
  async findSafeInstructorByEmail(email: string): Promise<IInstructor> {
    const InstructorData = await InstructorModal.findOne({ email });
    if (!InstructorData) {
      throw new Error("Instructor Not Exitst");
    }
    return InstructorData;
  }
  async deleteOtp(email: string): Promise<boolean> {
    const deletedOtp = await InstructorOtpModal.deleteMany({ email });
    if (!deletedOtp) {
      throw new Error("otp not Exist in Db");
    }
    return true;
  }

  async createCourse(courseData: CreateCourseDTO): Promise<object> {
    console.log("in db a;a;", courseData);
    const result = await CourseModal.create(courseData);
    if (!result) {
      throw new Error("create course db error");
    }
    return result;
  }
  async getCoureById(id: string): Promise<any> {
    const result = await CourseModal.findById(id);
    if (!result) {
      throw new Error("not get data matched");
    }
    return result;
  }

  async updateProfileByEmail(
    email: string,
    updateData: object
  ): Promise<boolean> {
    console.log("my db update");
    const updated = await InstructorModal.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, projection: "-password" }
    );

    return !!updated;
  }
  async getAllStudents(): Promise<any[]> {
    const students = await InstructorModal.find({});
    return students;
  }
  async getAllCourses(email: string): Promise<any[]> {
    return await CourseModal.find({ instructor: email });
  }

  async saveCurriculum(
    courseId: string,
    instructor: string,
    sections: ISection[]
  ): Promise<boolean> {
    try {
      const existing = await CurriculumModel.findOne({ courseId });

      if (existing) {
        existing.sections = sections;
        existing.instructor = instructor;
        await existing.save();
      } else {
        const newCurriculum = new CurriculumModel({
          courseId,
          instructor,
          sections,
        });
        await newCurriculum.save();
      }

      return true;
    } catch (error) {
      console.error("Error saving curriculum:", error);
      return false;
    }
  }
  async updateCourseById(id: string, updateData: object): Promise<any> {
    try {
      const updatedCourse = await CourseModal.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!updatedCourse) {
        throw new Error("Course not found or update failed");
      }

      return updatedCourse;
    } catch (error) {
      console.error("Error in updateCourseById:", error);
      throw new Error("Error updating course");
    }
  }
  async getCurriculamByCourseId(id: string): Promise<any> {
    try {
      const curriculum = await CurriculumModel.findOne({ courseId: id });

      if (!curriculum) {
        throw new Error("Curriculum not found");
      }

      return curriculum;
    } catch (error) {
      console.error("Error retrieving curriculum:", error);
      throw new Error("Failed to retrieve curriculum");
    }
  }
  async getAllChats(id: string): Promise<any[]> {
    try {
      const chats = await ChatModel.aggregate([
        { $match: { instructorId: id } },

        // Convert userId (string) to ObjectId
        {
          $addFields: {
            userIdObj: {
              $convert: {
                input: "$userId",
                to: "objectId",
                onError: null,
                onNull: null,
              },
            },
          },
        },
        // Lookup to get student details
        {
          $lookup: {
            from: "students",
            localField: "userIdObj",
            foreignField: "_id",
            as: "studentDetails",
          },
        },
        // Unwind the studentDetails array
        {
          $unwind: {
            path: "$studentDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      return chats;
    } catch (error) {
      console.error("Error retrieving chats:", error);
      throw new Error("Failed to retrieve chats");
    }
  }
  getAllMessages(id: string): Promise<any[]> {
    const messages = MessageModel.find({ chatId: id });
    if (!messages) {
      throw new Error("Failed to retrieve messages");
    }
    return messages;
  }
  postMessage(data: object): Promise<any> {
    const message = MessageModel.create(data);
    if (!message) {
      throw new Error("Failed to post message");
    }
    return message;
  }
  async getPendingPayment(email: string): Promise<any[]> {
    const result = await TransactionModel.aggregate([
      {
        $match: {
          instructor: email,
          payoutStatus: "PENDING",
        },
      },
      // Lookup Course details (assuming `courseId` matches `_id` in CourseModel)
      {
        $lookup: {
          from: "courses", // MongoDB collection name (check your DB)
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      // Lookup Student details (assuming `studentId` matches `_id` in UserModel)
      {
        $lookup: {
          from: "students", // MongoDB collection name (e.g., "users" or "students")
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      // Convert lookup arrays to single objects (since $lookup returns an array)
      {
        $addFields: {
          course: { $arrayElemAt: ["$course", 0] }, // Take first element
          student: { $arrayElemAt: ["$student", 0] },
        },
      },
    ]);

    return result;
  }

  async updatePaypalEmail(email: string, paypalEmail: string): Promise<boolean> {
    try {
      await InstructorModal.updateOne({ email }, { paypalEmail });
      return true;
    } catch (error) {
      console.error("Error updating PayPal email:", error);
      return false;
    }
  }
}
