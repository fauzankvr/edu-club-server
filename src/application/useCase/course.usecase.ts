import { CourseEntity } from "../../domain/entities/Course";
import { ICurriculum, ISection } from "../../infrastructure/database/models/CarriculamModel";
import { ICourse } from "../../infrastructure/database/models/CourseModel";
import { COURSE_NOT_FOUND, CURRICULUM_NOT_FOUND, ORDER_NOT_FOUND, STUDENT_NOT_FOUND } from "../../interfaces/constants/responseMessage";
import { IOrderRepository } from "../interface/IOrderRepository";
import { CourseDto, CreateCourseDTO } from "../interface/Dto/courseDto"; 
import { IProgressRepository } from "../interface/IProgressRepository";
import { IProgress } from "../../infrastructure/database/models/ProgressModel";
import { ICourseUseCase } from "../interface/ICourseUseCase";
import { IOrder } from "../../infrastructure/database/models/OrderModel";
import IStudentRepository from "../interface/IStudentRepository";
import ICourseRepository from "../interface/ICourseRepository";
import ICurriculumRepository from "../interface/ICurriculamRepository";
import { ProgressEntity } from "../../domain/entities/Progress";
import { CurriculumDto } from "../interface/Dto/CurriculamDto";
import { CurriculumTopicsDto } from "../interface/Dto/CurriculamTopic";
import IInstructorRepository from "../interface/IInstructorRepository";


export class CourseUseCase implements ICourseUseCase {
  constructor(
    private _courseRepository: ICourseRepository,
    private _curriculumRepository: ICurriculumRepository,
    private _orderRepository: IOrderRepository,
    private _studentRepository: IStudentRepository,
    private _progressRepository: IProgressRepository,
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
    courses: CourseDto[];
    total: number;
    languages: string[];
    categories: string[];
  }> {
    const { courses, total, languages, categories } =
      await this._courseRepository.filter(
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
    const coursesDto = courses.map((c) => CourseDto.fromEntity(c));
    return { courses: coursesDto, total, languages, categories };
  }

  async createNewCourse(data: CreateCourseDTO): Promise<CourseDto> {
    const course = new CourseEntity(
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
    if (!course.instructor) {
      throw new Error("Instructor is required");
    }
    const samecoure = await this._courseRepository.findByTitle(
      course.title,
      course.instructor
    );
    if (samecoure) {
      throw new Error(
        "Course with this title already exists for this instructor"
      );
    }
    const res = await this._courseRepository.create(course);
    const courseDto = CourseDto.fromEntity(res);
    return courseDto;
  }

  async getAllCourses(email: string): Promise<CourseDto[]> {
    const courses = await this._courseRepository.findAllByEmail(email);

    if (!courses) {
      throw new Error("Failed to retrieve courses");
    }
    const courseDto = courses.map((c) => CourseDto.fromEntity(c));
    return courseDto;
  }
  async getAdminAllCourses(limit: number, skip: number): Promise<CourseDto[]> {
    const courses = await this._courseRepository.findAllAdmin(limit, skip);
    if (!courses) {
      throw new Error("Failed to retrieve courses");
    }
    const courseDto = courses.map((c) => CourseDto.fromEntity(c));
    return courseDto;
  }
  getAdminCourseCount(): Promise<number> {
    return this._courseRepository.count();
  }

  async getCourseById(id: string): Promise<CourseDto> {
    const res = await this._courseRepository.findById(id);
    if (!res) {
      throw new Error("Faild to retrive course");
    }
    const courseDto = CourseDto.fromEntity(res);
    return courseDto;
  }

  async updateCourse(
    id: string,
    updateData: Partial<CourseDto>
  ): Promise<CourseDto> {
    // ── 1. Make sure the course exists
    const course = await this._courseRepository.findById(id);
    if (!course) throw new Error("Course not found");

    // ── 2. If the title is changing, check for duplicates **for the same instructor**
    if (updateData.title && updateData.title !== course.title) {
      const duplicate = await this._courseRepository.findByTitle(
        updateData.title,
        course.instructor ?? ""
      );

      if (duplicate) {
        throw new Error(
          "Course with this title already exists for this instructor"
        );
      }
    }
    if(!course.instructor||!course.instructor.email) throw new Error("Instructor is required");
    const data = new CourseEntity(
      updateData.title ?? course.title,
      updateData.description ?? course.description,
      updateData.language ?? course.language,
      updateData.category ?? course.category,
      updateData.courseImageId ?? course.courseImageId,
      updateData.points ?? course.points,
      updateData.price ?? course.price,
      updateData.discount ?? course.discount,
      updateData.students ?? course.students,
      updateData.instructor ?? course.instructor?.email,
      updateData.id ?? course.id
    );

    // ── 3. Perform the update
    const updated = await this._courseRepository.update(id, data);
    
    if (!updated) throw new Error("Failed to update course");
    const courseDto = CourseDto.fromEntity(updated);
   
    return courseDto;
  }

  async getCurriculam(id: string): Promise<CurriculumDto> {
    const curriculum = await this._curriculumRepository.findByCourseId(id);

    if (!curriculum) {
      throw new Error("Failed to retrieve curriculum");
    }

    const curriculumDto = CurriculumDto.fromEntity(curriculum);

    return curriculumDto;
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
      await this._curriculumRepository.save(courseId, instructor, sections);

      return true;
    } catch (error) {
      console.error("Error saving curriculum:", error);
      throw new Error("Failed to save curriculum");
    }
  }

  async toggleCourseBlock(id: string): Promise<CourseDto | null> {
    try {
      const course = await this._courseRepository.findBlockedById(id);
      if (!course) {
        throw new Error("Course not found");
      }

      const updated = await this._courseRepository.update(id, {
        isBlocked: !course.isBlocked,
      });

      if (!updated) {
        throw new Error("Failed to toggle course block status");
      }

      const courseDto = CourseDto.fromEntity(updated);

      return courseDto;
    } catch (error) {
      console.error("Error toggling course block:", error);
      throw new Error("Failed to toggle course block status");
    }
  }

  async getInstructorAllCourses(email: string): Promise<CourseDto[]> {
    const courses = await this._courseRepository.findByInstructor(email);
    return courses.map((course) => CourseDto.fromEntity(course));
  }

  async getCourseByOrderId(orderId: string): Promise<CourseDto> {
    const order = await this._orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error(ORDER_NOT_FOUND);
    }
   
    const course = await this._courseRepository.findById(
      order.courseId.toString()
    );

    if (!course) {
      throw new Error(COURSE_NOT_FOUND);
    }
    const courseDto = CourseDto.fromEntity(course);
    return courseDto;
  }

  async getCurriculum(id: string) {
    const curriculum = await this._curriculumRepository.findByCourseId(id);
    if (!curriculum) {
      throw new Error(CURRICULUM_NOT_FOUND);
    }
    return curriculum;
  }

  async getCurriculumTopics(courseId: string): Promise<CurriculumTopicsDto> {
    const curriculum = await this._curriculumRepository.findTopics(courseId);
    if (!curriculum) {
      throw new Error(CURRICULUM_NOT_FOUND);
    }
    const curriculumDto = CurriculumTopicsDto.fromEntity(curriculum);
    return curriculumDto;
  }

  async getAllProgress(studentId: string): Promise<ProgressEntity[] | null> {
    return await this._progressRepository.findByStudentId(studentId);
  }

  async getLessonProgress(
    studentId: string,
    courseId: string
  ): Promise<ProgressEntity> {
    let progress = await this._progressRepository.findByStudentAndCourse(
      studentId,
      courseId
    );
    if (!progress) {
      // Initialize from curriculum
      const curriculum = await this._curriculumRepository.findByCourseId(
        courseId
      );
      if (!curriculum) {
        throw new Error(`Curriculum not found for course ID: ${courseId}`);
      }

      progress = new ProgressEntity(
        "",
        studentId,
        courseId,
        curriculum.sections.map((section) => ({
          sectionId: section.id,
          lectures: section.lectures.map((lecture) => ({
            lectureId: lecture.id,
            progress: "0",
          })),
          completed: false,
        })),
        false
      );

      progress = await this._progressRepository.saveProgress(progress);
    }

    return progress;
  }

  async updateLessonProgress(
    studentId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    progress: number
  ): Promise<ProgressEntity> {
    let progressEntity = await this.getLessonProgress(studentId, courseId);

    // Business rule: update lecture
    const section = progressEntity.sections.find(
      (s) => s.sectionId === sectionId
    );
    if (!section) throw new Error(`Section not found: ${sectionId}`);

    const lecture = section.lectures.find((l) => l.lectureId === lectureId);
    if (!lecture) throw new Error(`Lecture not found: ${lectureId}`);

    lecture.progress = progress.toString();

    // Business rule: section completed if all lectures >= 95%
    section.completed = section.lectures.every(
      (lec) => parseInt(lec.progress) >= 95
    );

    // Business rule: course completed if all sections are complete
    progressEntity.completed = progressEntity.sections.every(
      (sec) => sec.completed
    );

    return await this._progressRepository.saveProgress(progressEntity);
  }

  async getEnrolledCourses(email: string): Promise<any> {
    const student = await this._studentRepository.findByEmail(email);
    if (!student) {
      throw new Error(STUDENT_NOT_FOUND);
    }
    const studentId = student.id;
    if (!studentId) {
      throw new Error(STUDENT_NOT_FOUND);
    }
    const courses = await this._orderRepository.findPaidCourses(studentId);
    return courses;
  }
}
