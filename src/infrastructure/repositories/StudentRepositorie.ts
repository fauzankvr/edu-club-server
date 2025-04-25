import IStudentRepo from "../../application/interface/IStudentRepo";
import { Student } from "../../domain/entities/Student";
import Course from "../database/models/CourseModel";
import StudentModel, { IStudents } from "../database/models/StudentModel";

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
      student.updatedAt
    );
  }

  async findSafeStudentByEmail(email: string): Promise<IStudents | null> {
    const student = await StudentModel.findOne({ email }).select(
      "email password isBlocked"
    );
    console.log(student);
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
    const courses = await Course.find({});
    return courses;
  }
}
