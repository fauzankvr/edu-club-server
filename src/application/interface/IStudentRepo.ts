import { SafeStudent } from "../../domain/entities/SafeStudent";
import { Student } from "../../domain/entities/Student";
import { IStudents } from "../../infrastructure/database/models/StudentModel";
import { LoginData } from "../../infrastructure/repositories/StudentRepositorie";
import { IDiscussion, IReply } from "./IDiscussion";

interface IStudentRepo {
  createStudent(student: Student): Promise<Student>;
  findStudentByEmail(email: string): Promise<Student | null>;
  updateProfileByEmail(email: string, updateData: object): Promise<boolean>;
  findStudentById(id: string): Promise<any>;
  getAllStudents(): Promise<any[]>;
  getCourseById(id: string): Promise<any>;
  getOrderById(id: string): Promise<any>;
  getCurriculumByCourseId(id: string): Promise<any>;
  getCarriculamTopics(id: string): Promise<any>;
  addReview(
    userEmail: string,
    userName: string,
    courseId: string,
    rating: number,
    comment: string
  ): Promise<any>;
  getReviewsByCourseId(courseId: string): Promise<any>;
  getMyReviewsByCourseId(courseId: string, email: string): Promise<any>;
  findReviewById(reviewId: string): Promise<any>;
  saveReview(review: any): Promise<any>;

  blockStudent(email: string): Promise<boolean>;
  findSafeStudentByEmail(email: string): Promise<IStudents | null>;

  getAllCourses(): Promise<any>;

  addCourseToWishlist(studentId: string, courseId: string): Promise<any>;
  removeCourseFromWishlist(
    studentId: string,
    courseId: string
  ): Promise<any>;
  getWishlist(studentEmail: string): Promise<any>;
  findWishlist(studentId: string, courseId: string): Promise<any>;

  findPaidCourses(email: string): Promise<any>;

  createDiscussion(
    id: string,
    data: Partial<IDiscussion>
  ): Promise<IDiscussion>;
  getAllDiscussions(orderId: string): Promise<IDiscussion[]>;
  findByIdDicussion(id: string): Promise<IDiscussion>;
  updateReaction(id: string, data: IDiscussion): Promise<IDiscussion | null>;
  updateReplay(
    id: string,
    data: Partial<IDiscussion>
  ): Promise<IDiscussion | null>;

  findReplayById(id: string): Promise<IReply[]>;
}

export default IStudentRepo;
