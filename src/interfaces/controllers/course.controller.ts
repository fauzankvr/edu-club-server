import { Request, Response } from "express";
import { CourseUseCase } from "../../application/useCase/course.usecase";
import { StatusCodes } from "../constants/statusCodes";
import { FAILED_COURSE_BLOCKED, FAILED_COURSE_CREATED, FAILED_COURSE_FETCH, FAILED_COURSES_FETCH, FAILED_CURRICULUM_FETCH, FAILED_ENROLLED_COURSES_FETCH, INVALID_TOKEN, MISSING_COURSE_ID, SUCCESS_COURSE_BLOCKED, SUCCESS_COURSE_FETCH, SUCCESS_COURSES_CREATE, SUCCESS_COURSES_FETCH, SUCCESS_CURRICULUM_FETCH, SUCCESS_ENROLLED_COURSES_FETCH } from "../constants/responseMessage";
import { errorResponse, successResponse } from "../../infrastructure/utility/ResponseCreator";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { IAuthenticatedRequest } from "../middlewares/ExtractInstructor";
import { JwtPayload } from "jsonwebtoken";

export class CourseController {
  constructor(private courseUseCase: CourseUseCase) {}

  createCourse = async (req: IAuthenticatedRequest, res: Response) => {
    const instructor = (req.instructor as JwtPayload)?.email;
    try {
      const {
        title,
        description,
        language,
        category,
        price,
        discount,
        points,
      } = req.body;

      const courseImageId = req.file?.path || "";

      const students: [] = [];
      const course = await this.courseUseCase.createNewCourse({
        title,
        description,
        language,
        category,
        courseImageId,
        price: Number(price),
        discount: discount || null,
        points,
        students,
        instructor: instructor || null,
      });

      return res
        .status(StatusCodes.CREATED)
        .json(successResponse(SUCCESS_COURSES_CREATE, course));
    } catch (err: any) {
      console.error(err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_COURSE_CREATED));
    }
  };

  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const search = (req.query.search as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const sort = req.query.sort as string;
      const {
        Topics: category,
        Language: language,
        Rating: rating,
        priceMin,
        priceMax,
      } = req.query as any;

      const { courses, total, languages, categories } =
        await this.courseUseCase.getFilterdCourses(
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

      res.status(StatusCodes.OK).json(
        successResponse(SUCCESS_COURSES_FETCH, {
          courses,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          languages,
          categories,
        })
      );
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_COURSES_FETCH));
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const course = await this.courseUseCase.getCourseById(courseId);
      if (!course) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json(errorResponse(FAILED_COURSE_FETCH));
        return;
      }
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_COURSE_FETCH, { course }));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_COURSE_FETCH));
    }
  }

  async getCourseByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const course = await this.courseUseCase.getCourseByOrderId(orderId);
      if (!course) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json(errorResponse(FAILED_COURSE_FETCH));
        return;
      }
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_COURSE_FETCH, { course }));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_COURSE_FETCH));
    }
  }

  async getAllCoursesAdmin(req: Request, res: Response): Promise<void> {
    try {
      const courses = await this.courseUseCase.getAdminAllCourses();
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_COURSES_FETCH, { courses }));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_COURSES_FETCH));
    }
  }

  async getInstructorAllCourses(
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const instructor = (req.instructor as JwtPayload)?.email;
      if (!instructor) {
        res.status(StatusCodes.UNAUTHORIZED).json(errorResponse(INVALID_TOKEN));
        return;
      }
      const courses = await this.courseUseCase.getInstructorAllCourses(
        instructor
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_COURSES_FETCH, { courses }));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_COURSES_FETCH));
    }
  }

  async getFullCourse(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const course = await this.courseUseCase.getCourseByOrderId(orderId);
      if (!course) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json(errorResponse(FAILED_COURSE_FETCH));
        return;
      }
      const id = course._id.toString();
      const curriculum = await this.courseUseCase.getCurriculam(id);
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_COURSE_FETCH, { course, curriculum }));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_COURSE_FETCH));
    }
  }
  updateCourse = async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const updateData = req.body;
      if (req.file) {
        updateData.courseImageId = req.file.path;
      }
      const updatedCourse = await this.courseUseCase.updateCourse(
        courseId,
        updateData
      );
      return res.status(200).json({
        message: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error: any) {
      console.error("Error in updateCourse:", error);
      return res.status(500).json({
        message: "Failed to update course",
        error: error.message,
      });
    }
  };

  async blockCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.courseId;
      if (!courseId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(MISSING_COURSE_ID));
        return;
      }
      await this.courseUseCase.toggleCourseBlock(courseId);
      res.status(StatusCodes.OK).json(successResponse(SUCCESS_COURSE_BLOCKED));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_COURSE_BLOCKED));
    }
  }

  async getCurriculum(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.courseId;
      if (!courseId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(MISSING_COURSE_ID));
        return;
      }
      const curriculum = await this.courseUseCase.getCurriculum(courseId);
      if (!curriculum) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json(errorResponse(FAILED_CURRICULUM_FETCH));
        return;
      }
      res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_CURRICULUM_FETCH, { curriculum }));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_CURRICULUM_FETCH));
    }
  }

  async getAllProgress(
    req: IAuthanticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const studentId = (req.student as JwtPayload)?.id;

      if ( !studentId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Missing parameters"));
        return;
      }

      const progress = await this.courseUseCase.getAllProgress(
        studentId
      );
      console.log(progress);
      res
        .status(StatusCodes.OK)
        .json(successResponse("Progress fetched", { progress }));
    } catch (error) {
      console.log(error)
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to fetch progress"));
    }
  }

  async getLessonProgress(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, studentId } = req.params;

      if (!courseId || !studentId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Missing parameters"));
        return;
      }

      const progress = await this.courseUseCase.getLessonProgress(
        courseId,
        studentId
      );
      res
        .status(StatusCodes.OK)
        .json(successResponse("Progress fetched", { progress }));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to fetch progress"));
    }
  }

  async updateLessonProgress(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, studentId, sectionId, lectureId, progress } = req.body;

      if (!courseId || !studentId || !progress) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Missing parameters"));
        return;
      }

      const updated = await this.courseUseCase.updateLessonProgress(
        courseId,
        studentId,
        sectionId,
        lectureId,
        progress
      );

      res
        .status(StatusCodes.OK)
        .json(successResponse("Progress updated", { updated }));
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update progress"));
    }
  }

  uploadCurriculum = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = (req.instructor as JwtPayload)?.email;
      const courseId = req.params.courseId;

      const sections = JSON.parse(req.body.sections || "[]");

      const files = req.files as {
        videos?: Express.Multer.File[];
        pdfs?: Express.Multer.File[];
      };

      const videoFiles = files.videos || [];
      const pdfFiles = files.pdfs || [];

      // Now you can pass them to your use case or save in DB
      const curriculum = await this.courseUseCase.saveCurriculum(
        courseId,
        instructor,
        sections,
        videoFiles,
        pdfFiles
      );

      return res
        .status(200)
        .json({ message: "Curriculum uploaded successfully", curriculum });
    } catch (error: any) {
      console.error("Upload Curriculum Error:", error);
      return res
        .status(500)
        .json({ message: "Failed to upload curriculum", error: error.message });
    }
  };

  updateCurriculum = async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const instructor = (req.instructor as JwtPayload)?.email;
      const courseId = req.params.id;
      const sections = JSON.parse(req.body.sections || "[]");
      const files = req.files as {
        videos?: Express.Multer.File[];
        pdfs?: Express.Multer.File[];
      };

      const videoFiles = files?.videos || [];
      const pdfFiles = files?.pdfs || [];

      const result = await this.courseUseCase.saveCurriculum(
        courseId,
        instructor,
        sections,
        videoFiles,
        pdfFiles
      );

      if (!result) {
        return res.status(400).json({ message: "Failed to update curriculum" });
      }

      return res.status(200).json({
        message: "Curriculum updated successfully",
      });
    } catch (error: any) {
      console.error("Error in updateCurriculum:", error);
      return res.status(500).json({
        message: "Failed to update curriculum",
        error: error.message,
      });
    }
  };

  async getEnrolledCourses(
    req: IAuthanticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error(INVALID_TOKEN);
      }
      const enrolledCourses = await this.courseUseCase.getEnrolledCourses(
        student.email
      );
      res.status(StatusCodes.OK).json(
        successResponse(SUCCESS_ENROLLED_COURSES_FETCH, {
          enrolledCourses,
        })
      );
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(FAILED_ENROLLED_COURSES_FETCH));
    }
  }
}                                                                               

