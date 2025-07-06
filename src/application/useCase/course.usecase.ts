import { Course } from "../../domain/entities/Course";
import { ISection } from "../../infrastructure/database/models/CarriculamModel";
import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { COURSE_NOT_FOUND, CURRICULUM_NOT_FOUND, ORDER_NOT_FOUND, STUDENT_NOT_FOUND } from "../../interfaces/constants/responseMessage";
import ICourseRepo from "../interface/ICourseRepo";
import ICurriculumRepo from "../interface/ICurriculamRepo";
import { IOrderRepo } from "../interface/IOrderRepo";
import IStudentRepo from "../interface/IStudentRepo";
import { CreateCourseDTO } from "../interface/Dto/courseDto"; 
import { IProgressRepo } from "../interface/IProgressRepo";
import { IProgress } from "../../infrastructure/database/models/ProgressModel";


export class CourseUseCase {
  constructor(
    private courseRepo: ICourseRepo,
    private curriculamRepo: ICurriculumRepo,
    private orderRepo: IOrderRepo,
    private studentRepo: IStudentRepo,
    private progressRepo: IProgressRepo
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
  ) {
    const { courses, total, languages, categories } =
      await this.courseRepo.getFilterdCourses(
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
    console.log(course);
    const samecoure = await this.courseRepo.findCourseByTitle(
      course.title,
      course.instructor
    );
    console.log(samecoure);
    if (samecoure) {
      throw new Error(
        "Course with this title already exists for this instructor"
      );
    }
    const res = await this.courseRepo.createCourse(course);
    return res;
  }

  async getAllCourses(email: string) {
    const courses = await this.courseRepo.getAllCourses(email);

    if (!courses) {
      throw new Error("Failed to retrieve courses");
    }

    return courses;
  }
  async getAdminAllCourses() {
    const courses = await this.courseRepo.getAdminAllCourses();

    if (!courses) {
      throw new Error("Failed to retrieve courses");
    }

    return courses;
  }
  async getCourseById(id: string) {
    const res = await this.courseRepo.getCourseById(id);
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
    const course = await this.courseRepo.getCourseById(id);
    if (!course) throw new Error("Course not found");

    // ── 2. If the title is changing, check for duplicates **for the same instructor**
    if (updateData.title && updateData.title !== course.title) {
      const duplicate = await this.courseRepo.findCourseByTitle(
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
    const updated = await this.courseRepo.updateCourseById(id, updateData);
    if (!updated) throw new Error("Failed to update course");

    return updated;
  }

  async getCurriculam(id: string) {
    const curriculum = await this.curriculamRepo.getCurriculumByCourseId(id);

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
      await this.curriculamRepo.saveCurriculum(courseId, instructor, sections);

      return true;
    } catch (error) {
      console.error("Error saving curriculum:", error);
      throw new Error("Failed to save curriculum");
    }
  }

  async toggleCourseBlock(id: string) {
    try {
      const course = await this.courseRepo.getBlockedCourseById(id);
      if (!course) {
        throw new Error("Course not found");
      }

      const updated = await this.courseRepo.updateCourseById(id, {
        isBlocked: !course.isBlocked,
      });

      return updated;
    } catch (error) {
      console.error("Error toggling course block:", error);
      throw new Error("Failed to toggle course block status");
    }
  }

  async getInstructorAllCourses(email: string) {
    return this.courseRepo.getAllInstructorCourses(email);
  }

  async getCourseByOrderId(orderId: string) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new Error(ORDER_NOT_FOUND);
    }
    const course = await this.courseRepo.getCourseById(
      order.courseId.toString()
    );
    if (!course) {
      throw new Error(COURSE_NOT_FOUND);
    }
    return course;
  }

  async getCurriculum(id: string) {
    const curriculum = await this.curriculamRepo.getCurriculumByCourseId(id);
    if (!curriculum) {
      throw new Error(CURRICULUM_NOT_FOUND);
    }
    return curriculum;
  }

  async getCurriculumTopics(courseId: string) {
    const curriculum = await this.curriculamRepo.getCarriculamTopics(courseId);
    if (!curriculum) {
      throw new Error(CURRICULUM_NOT_FOUND);
    }
    return curriculum;
  }

  async getAllProgress(
    studentId: string
  ): Promise<IProgress[] | null> {
    try {
      const progress = await this.progressRepo.findByStudentId(
        studentId
      );
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
      const progress = await this.progressRepo.findByStudentAndCourse(
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
      const progressDoc = await this.progressRepo.createOrUpdateProgress(
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

  async getEnrolledCourses(email: string) {
    const student = await this.studentRepo.findSafeStudentByEmail(email);
    if (!student) {
      throw new Error(STUDENT_NOT_FOUND);
    }
    const studentId = student._id.toString();
    const courses = await this.orderRepo.findPaidCourses(studentId);
    return courses;
  }
}
