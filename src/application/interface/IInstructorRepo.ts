import { Instructor } from "../../domain/entities/Instructor"
import { ISection } from "../../infrastructure/database/models/CarriculamModel";
import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { IInstructor } from "../../infrastructure/database/models/InstructorModel";
import { IinstructorOtp } from "../../infrastructure/database/models/InstructorOtp";
import { CreateCourseDTO } from "../useCase/InstructorUseCase";


interface IInstructorRepo {
  crateInstructor(instructor: Instructor): Promise<object>;
  findInstrucotrByEmail(email: string): Promise<IInstructor | null>;
  findById(id: string): Promise<IInstructor | null>;
  findSafeInstructorByEmail(email: string): Promise<IInstructor>;
  updateProfileByEmail(email: string, updateData: object): Promise<boolean>;
  getAllCourses(email: any): Promise<any[]>;
  getCoureById(id: string): Promise<any>;
  updateCourseById(id: string, updateData: object): Promise<any>;
  getCurriculamByCourseId(id: string): Promise<any>;

  saveCurriculum(
    courseId: string,
    instructor: string,
    sections: ISection[]
  ): Promise<boolean>;

  findOtp(email: string): Promise<IinstructorOtp | null>;
  deleteOtp(email: string): Promise<boolean>;
  findAllInstructors(): Promise<any[]>;
  blockInstructor(email: string): Promise<boolean>;
  saveOtp(email: string, otp: string): Promise<object>;

  createCourse(courseData: CreateCourseDTO): Promise<object>;

  getAllChats(id: string): Promise<any[]>;
  getAllMessages(id: string): Promise<any[]>;
  postMessage(data:object): Promise<any>;
}

export default IInstructorRepo