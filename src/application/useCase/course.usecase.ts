import { Course } from "../../domain/entities/Course";
import { ICurriculum, ISection } from "../../infrastructure/database/models/CarriculamModel";
import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { COURSE_NOT_FOUND, CURRICULUM_NOT_FOUND, ORDER_NOT_FOUND, STUDENT_NOT_FOUND } from "../../interfaces/constants/responseMessage";
import { IOrderRepository } from "../interface/IOrderRepository";
import { CreateCourseDTO } from "../interface/Dto/courseDto"; 
import { IProgressRepository } from "../interface/IProgressRepository";
import { IProgress } from "../../infrastructure/database/models/ProgressModel";
import { ICourseUseCase } from "../interface/ICourseUseCase";
import { IOrder } from "../../infrastructure/database/models/OrderModel";
import IStudentRepository from "../interface/IStudentRepository";
import ICourseRepository from "../interface/ICourseRepository";
import ICurriculumRepository from "../interface/ICurriculamRepository";


export class CourseUseCase implements ICourseUseCase {
  constructor(
    private _courseRepository: ICourseRepository,
    private _curriculumRepository: ICurriculumRepository,
    private _orderRepository: IOrderRepository,
    private _studentRepository: IStudentRepository,
    private _progressRepository: IProgressRepository
  ) {}

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
    courses: ICourse[];
    total: number;
    languages: string[];
    categories: string[];
  }> {
    const { courses, total, languages, categories } =
      await this._courseRepository.getFilterdCourses(
        search,
        skip,
        limit,
        sort,
        category,
        language,
        rating,
        priceMin,
        priceMax
      );
    return { courses, total, languages, categories };
  }

  async createNewCourse(data: CreateCourseDTO): Promise<ICourse> {
    const course = new Course(
      data.title,
      data.description,
      data.language,
      data.category,
      data.courseImageId,
      data.points,
      data.price,
      data.discount,
      data.students,
      data.instructor
    );

    if (!course.isValid()) throw new Error("Invalid course data");
    const samecoure = await this._courseRepository.findCourseByTitle(
      course.title,
      course.instructor
    );
    console.log(samecoure);
    if (samecoure) {
      throw new Error(
        "Course with this title already exists for this instructor"
      );
    }
    const res = await this._courseRepository.createCourse(course);
    return res;
  }

  async getAllCourses(email: string) {
    const courses = await this._courseRepository.getAllCourses(email);

    if (!courses) {
      throw new Error("Failed to retrieve courses");
    }

    return courses;
  }
  async getAdminAllCourses(limit: number, skip: number) {
    const courses = await this._courseRepository.getAdminAllCourses(limit, skip);
    if (!courses) {
      throw new Error("Failed to retrieve courses");
    }

    return courses;
  }
  getAdminCourseCount(): Promise<number> {
    return this._courseRepository.getAdminCourseCount();
  }

  async getCourseById(id: string) {
    const res = await this._courseRepository.getCourseById(id);
    if (!res) {
      throw new Error("Faild to retrive course");
    }
    return res;
  }

  async updateCourse(
    id: string,
    updateData: Partial<ICourse>
  ): Promise<ICourse> {
    // ── 1. Make sure the course exists
    const course = await this._courseRepository.getCourseById(id);
    if (!course) throw new Error("Course not found");

    // ── 2. If the title is changing, check for duplicates **for the same instructor**
    if (updateData.title && updateData.title !== course.title) {
      const duplicate = await this._courseRepository.findCourseByTitle(
        updateData.title,
        course.instructor ?? ""
      );

      if (duplicate) {
        throw new Error(
          "Course with this title already exists for this instructor"
        );
      }
    }

    // ── 3. Perform the update
    const updated = await this._courseRepository.updateCourseById(id, updateData);
    if (!updated) throw new Error("Failed to update course");

    return updated;
  }

  async getCurriculam(id: string): Promise<ICurriculum> {
    const curriculum = await this._curriculumRepository.getCurriculumByCourseId(id);

    if (!curriculum) {
      throw new Error("Failed to retrieve curriculum");
    }

    return curriculum;
  }

  async saveCurriculum(
    courseId: string,
    instructor: string,
    sections: ISection[],
    videoFiles: Express.Multer.File[],
    pdfFiles: Express.Multer.File[]
  ): Promise<boolean> {
    try {
      // Assign video and pdf file paths to their corresponding lectures
      sections.forEach((section, sIndex) => {
        section.lectures.forEach((lecture, lIndex) => {
          // Match video files
          const videoFile = videoFiles.find(
            (file) => file.originalname === `video_s${sIndex}_l${lIndex}.mp4`
          );
          const pdfFile = pdfFiles.find(
            (file) => file.originalname === `pdf_s${sIndex}_l${lIndex}.pdf`
          );

          if (videoFile) {
            lecture.videoPath = videoFile.path;
          } else if (pdfFile) {
            lecture.pdfPath = pdfFile.path;
          }
        });
      });

      // Now call the CurriculumRepo to save it
      await this._curriculumRepository.saveCurriculum(courseId, instructor, sections);

      return true;
    } catch (error) {
      console.error("Error saving curriculum:", error);
      throw new Error("Failed to save curriculum");
    }
  }

  async toggleCourseBlock(id: string): Promise<ICourse | null> {
    try {
      const course = await this._courseRepository.getBlockedCourseById(id);
      if (!course) {
        throw new Error("Course not found");
      }

      const updated = await this._courseRepository.updateCourseById(id, {
        isBlocked: !course.isBlocked,
      });

      return updated;
    } catch (error) {
      console.error("Error toggling course block:", error);
      throw new Error("Failed to toggle course block status");
    }
  }

  async getInstructorAllCourses(email: string) {
    return this._courseRepository.getAllInstructorCourses(email);
  }

  async getCourseByOrderId(orderId: string) {
    const order = await this._orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error(ORDER_NOT_FOUND);
    }
    const course = await this._courseRepository.getCourseById(
      order.courseId.toString()
    );
    if (!course) {
      throw new Error(COURSE_NOT_FOUND);
    }
    return course;
  }

  async getCurriculum(id: string) {
    const curriculum = await this._curriculumRepository.getCurriculumByCourseId(id);
    if (!curriculum) {
      throw new Error(CURRICULUM_NOT_FOUND);
    }
    return curriculum;
  }

  async getCurriculumTopics(courseId: string): Promise<ICurriculum> {
    const curriculum = await this._curriculumRepository.getCarriculamTopics(
      courseId
    );
    if (!curriculum) {
      throw new Error(CURRICULUM_NOT_FOUND);
    }
    return curriculum;
  }

  async getAllProgress(studentId: string): Promise<IProgress[] | null> {
    try {
      const progress = await this._progressRepository.findByStudentId(studentId);
      if (!progress) {
        return null;
      }
      return progress;
    } catch (error) {
      throw new Error(
        `Failed to fetch progress: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getLessonProgress(
    courseId: string,
    studentId: string
  ): Promise<IProgress | null> {
    try {
      console.log(courseId, studentId);
      const progress = await this._progressRepository.findByStudentAndCourse(
        studentId,
        courseId
      );
      if (!progress) {
        return null; // No progress found for this student and course
      }
      return progress;
    } catch (error) {
      throw new Error(
        `Failed to fetch progress: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateLessonProgress(
    courseId: string,
    studentId: string,
    sectionId: string,
    lectureId: string,
    progress: number
  ): Promise<IProgress> {
    try {
      // Update progress using the repository
      const progressDoc = await this._progressRepository.createOrUpdateProgress(
        studentId,
        courseId,
        sectionId,
        lectureId,
        progress.toString()
      );

      return progressDoc;
    } catch (error) {
      throw new Error(
        `Failed to update progress: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getEnrolledCourses(email: string): Promise<any> {
    const student = await this._studentRepository.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error(STUDENT_NOT_FOUND);
    }
    const studentId = student._id.toString();
    const courses = await this._orderRepository.findPaidCourses(studentId);
    return courses;
  }
}
