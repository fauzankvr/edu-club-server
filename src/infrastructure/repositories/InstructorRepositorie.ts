import IInstructorRepo from "../../application/interface/IInstructorRepo";
import { Instructor } from "../../domain/entities/Instructor";
import InstructorModal, { IInstructor } from "../database/models/InstructorModel";
import InstructorOtpModal, { IinstructorOtp } from "../database/models/InstructorOtp";
import CourseModal, {ICourse} from "../database/models/CourseModel";
import { CreateCourseDTO } from "../../application/useCase/InstructorUseCase";
import { ISection } from "../database/models/CarriculamModel";
import CurriculumModel from "../database/models/CarriculamModel";


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

    student.isBlocked = !student.isBlocked;
    await student.save();

    return student.isBlocked;
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
}