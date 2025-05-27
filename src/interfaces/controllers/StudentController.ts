import {StudentUseCase} from "../../application/useCase/StudentUseCase";
import { Request, Response } from "express";
import { IAuthanticatedRequest } from "../middlewares/ExtractUser";
import { generateAccessToken, verifyRefreshToken } from "../../infrastructure/utility/GenarateToken";
import { captureOrderService, createOrderService } from "../../infrastructure/services/PaypalIntigrataion";
import { IStudents } from "../../infrastructure/database/models/StudentModel";
import { IReply } from "../../application/interface/IDiscussion";
import { GoogleAuthServiceImpl } from "../../infrastructure/services/googleAuthServiceImpl";
import { StudentRepository } from "../../infrastructure/repositories/StudentRepositorie";
import { IAuthenticatedRequest } from "../middlewares/ExtractInstructor";

class StudentController {
  constructor(private StudentUseCase: StudentUseCase) {}

  generateRefreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(403).json({ message: "Invalid token" });
      }
      const accessToken = generateAccessToken({ email: payload.email });

      res.status(200).json({ success: true, accessToken });
    } catch (err: any) {
      res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  };

  getStudent = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const studentEmail = req.student;
      if (
        !studentEmail ||
        typeof studentEmail === "string" ||
        !("email" in studentEmail)
      ) {
        throw new Error("Invalid token payload: Email not found");
      }

      if (!studentEmail) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const student = await this.StudentUseCase.getProfile(studentEmail.email);
      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

  loginStudent = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }

      const result = await this.StudentUseCase.loginStudent(email, password);
      console.log("res", result);
      res.cookie("refreshToken", result.refreshToken, {
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        message: result.message,
      });
    } catch (error: any) {
      console.log("Login error:", error);
      res
        .status(401)
        .json({ success: false, message: error.message || "Login failed" });
    }
  };

  googleLoginController = async (req: Request, res: Response) => {
    const { token } = req.body;

    const authService = new GoogleAuthServiceImpl();
    const studentRepo = new StudentRepository();

    try {
      // const { jwt, success } = await googleLoginUseCase(
      //   token,
      //   authService,
      //   studentRepo
      // );
      // res.json({ success, accessToken: jwt });
    } catch (err) {
      res
        .status(401)
        .json({ success: false, message: "Google login failed", error: err });
    }
  };

  signupStudent = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log(req.body);
      const result = await this.StudentUseCase.signupAndSendOtp(email);
      res.status(200).json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  logOutStudent = async (req: Request, res: Response) => {
    console.log("in log out");
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(400).json({ message: "Logout failed", error });
    }
  };
  resendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log(req.body);
      const result = await this.StudentUseCase.signupAndSendOtp(email);
      res.status(200).json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
  verifyOtp = async (req: Request, res: Response) => {
    try {
      const { email, otp, password } = req.body;
      const result = await this.StudentUseCase.verifyOtpAndSignup(
        email,
        otp,
        password
      );
      console.log(result);
      res.cookie("refreshToken", result.refreshToken, {
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        message: "Signup successful",
      });
    } catch (err: any) {
      console.log("error in verify otp", err.message);
      res.status(401).json({ message: err.message, token: "" });
    }
  };
  getProfile = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      console.log("iam in profile");
      const student = req.student;

      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      console.log("My email:", student.email);
      const result = await this.StudentUseCase.getProfile(student.email);
      res.status(200).json({ profile: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  getAllCoureses = async (req: Request, res: Response) => {
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

      console.log("sort", sort);
      console.log("category", category);
      console.log("language", language);
      console.log("rating", rating);
      console.log("price", priceMin, priceMax);

      const { courses, total, languages, categories } =
        await this.StudentUseCase.getAllCourses(
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

      return res.status(200).json({
        courses,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        languages,
        categories,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  };

  getCourseById = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const course = await this.StudentUseCase.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      return res.status(200).json({ course });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  };

  getCourseByOrderId = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const course = await this.StudentUseCase.getCourseByOrderId(orderId);
      if (!course) {
        return res
          .status(404)
          .json({ message: "Course not found for this order" });
      }
      return res.status(200).json({ course });
    } catch (error) {
      console.error("Error fetching course by order ID:", error);
      res.status(500).json({ message: "Failed to fetch course by order ID" });
    }
  };

  getFullCourse = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const course = await this.StudentUseCase.getCourseByOrderId(orderId);
      if (!course) {
        return res
          .status(404)
          .json({ message: "Course not found for this order" });
      }
      const carriculam = await this.StudentUseCase.getCarriculam(course._id);
      return res.status(200).json({ course, carriculam });
    } catch (error) {
      console.error("Error fetching course by order ID:", error);
      res.status(500).json({ message: "Failed to fetch course by order ID" });
    }
  };

  updateProfile = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      console.log("iam in update profile");
      const student = req.student;
      const updateData = req.body;
      const imageUrl = req.file?.path;
      if (req.file) {
        // updateData.profileImage = req.file.filename;
        updateData.profileImage = imageUrl;
      }
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      console.log("My email:", student.email);
      const result = this.StudentUseCase.updateProfile(
        student.email,
        updateData
      );
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong updating" });
    }
  };

  createOrderController = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      console.log("I am in create order...");
      const { cart } = req.body;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const userEmail = student.email;

      const { orderId, status } = await createOrderService(cart, userEmail);

      res.status(200).json({ orderId, status });
    } catch (error: any) {
      console.error("Failed to create order:", error.message);
      res.status(500).json(error.message);
    }
  };

  captureOrderController = async (req: Request, res: Response) => {
    try {
      console.log("I am in capture...");
      const { orderId } = req.params;
      const { message, captureId, orderID1 } = await captureOrderService(
        orderId
      );

      res.status(200).json({ message, captureId, orderID1 });
    } catch (error: any) {
      console.error("Failed to capture order:", error.message);
      res.status(500).json({ error: "Failed to capture order." });
    }
  };

  addReview = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const { rating, comment } = req.body;
      const { courseId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      const studentData = await this.StudentUseCase.getProfile(student.email);

      if (!studentData.email || !studentData.firstName) {
        throw new Error("Student data not found");
      }

      const newReview = await this.StudentUseCase.addReview(
        studentData.email,
        studentData.firstName,
        courseId,
        rating,
        comment
      );

      return res
        .status(201)
        .json({ message: "Review added successfully", review: newReview });
    } catch (error: any) {
      console.error("Error adding review:", error.message);
      return res.status(500).json({ message: "Failed to add review" });
    }
  };

  getReview = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      const reviews = await this.StudentUseCase.getReview(courseId);

      return res.status(200).json({ reviews });
    } catch (error: any) {
      console.error("Error fetching reviews:", error.message);
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
  };

  addReaction = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const { reviewId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const type = req.body.type;
      console.log("type likeor dis", type);
      const reviews = await this.StudentUseCase.handleReviewReaction(
        reviewId,
        student.email,
        type
      );

      return res.status(200).json({ reviews });
    } catch (error: any) {
      console.error("Error fetching reviews:", error.message);
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
  };

  getMyReview = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      const myReview = await this.StudentUseCase.getMyReview(
        courseId,
        student.email
      );

      return res.status(200).json({ myReview });
    } catch (error: any) {
      console.error("Error fetching review:", error.message);
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
  };

  addWishlist = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const isAdded = await this.StudentUseCase.findWishlist(
        student.email,
        courseId
      );
      if (isAdded) {
        throw new Error("You alredy added this course");
      }
      const result = await this.StudentUseCase.addWishlist(
        student.email,
        courseId
      );

      return res
        .status(200)
        .json({ success: true, message: "Added to wishlist", data: result });
    } catch (error: any) {
      console.error("Error adding to wishlist:", error.message);
      return res.status(500).json({ message: "Failed to add to wishlist" });
    }
  };
  removeWishlist = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      const result = await this.StudentUseCase.removeWishlist(
        student.email,
        courseId
      );

      return res.status(200).json({
        success: true,
        message: "Removed from wishlist",
        data: result,
      });
    } catch (error: any) {
      console.error("Error removing from wishlist:", error.message);
      return res
        .status(500)
        .json({ message: "Failed to remove from wishlist" });
    }
  };

  getWishlist = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      const wishlist = await this.StudentUseCase.getWishlist(student.email);

      return res.status(200).json({ success: true, wishlist });
    } catch (error: any) {
      console.error("Error fetching wishlist:", error.message);
      return res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  };

  getEnrolledCourses = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }

      // Call use case to get enrolled courses
      const enrolledCourses = await this.StudentUseCase.getEnrolledCourses(
        student.email
      );

      return res.status(200).json({ success: true, enrolledCourses });
    } catch (error: any) {
      console.error("Error fetching enrolled courses:", error.message);
      return res
        .status(500)
        .json({ message: "Failed to fetch enrolled courses" });
    }
  };

  getCarriculam = async (req: Request, res: Response) => {
    try {
      const courseId = req.params.courseId;
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      // Call use case to get curriculum
      const curriculum = await this.StudentUseCase.getCarriculamTopics(
        courseId
      );

      if (!curriculum) {
        return res
          .status(404)
          .json({ message: "Curriculum not found for this course" });
      }

      return res.status(200).json({ success: true, curriculum });
    } catch (error: any) {
      console.error("Error fetching curriculum:", error.message);
      return res.status(500).json({ message: "Failed to fetch curriculum" });
    }
  };

  geminiChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message } = req.body;
      console.log(message, "message");

      if (!message) {
        res
          .status(400)
          .json({ success: false, message: "Message is required" });
        return;
      }

      const response = await this.StudentUseCase.runChat(message);
      res.status(200).json({ success: true, response });
    } catch (error: any) {
      console.error("Error in geminiChat:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  // Disscussion

  createDiscussion = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const data = await this.StudentUseCase.createDiscussion(
        orderId,
        req.body.text
      );
      res.status(201).json({
        success: true,
        data,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error in createDiscussion:", errorMessage);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };

  getAllDiscussion = async (req: Request, res: Response): Promise<void> => {
    try {
      let orderId = req.params.id;
      const discussions = await this.StudentUseCase.getAllDiscussions(orderId);
      res.status(200).json({
        success: true,
        data: discussions,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error in getAllDiscussion:", errorMessage);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
  createReact = async (req: Request, res: Response) => {
    const { type } = req.body;

    if (!["like", "dislike"].includes(type)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }
    const data = await this.StudentUseCase.createReact(req.params.id, type);
    res.json(data);
  };
  createReplay = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const studentData = await this.StudentUseCase.getProfile(student.email);
      const userId = studentData._id;
      if (!studentData || !userId) {
        throw new Error("not get student Data");
      }
      const discussionId = req.params.id;
      const { text } = req.body;

      if (!text)
        return res.status(400).json({ message: "Reply text is required" });

      const reply: IReply = {
        discussionId,
        userId,
        text,
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        createdAt: new Date(),
      };

      const updatedDiscussion = await this.StudentUseCase.addReply(
        discussionId,
        reply
      );
      return res
        .status(200)
        .json({ message: "Reply added", data: updatedDiscussion });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  };

  getReplay = async (req: Request, res: Response) => {
    try {
      const discussionId = req.params.id;
      const replies = await this.StudentUseCase.getReplay(discussionId);
      return res.status(200).json(replies);
    } catch (error: any) {
      console.error("Error fetching replies:", error);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };
  getNotes = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const notes = await this.StudentUseCase.getNotes(student.email, req.params.id);
      return res.status(200).json(notes);
    } catch (error: any) {
      console.error("Error fetching notes:", error);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };

  createNotes = async (req: IAuthanticatedRequest , res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const notes = await this.StudentUseCase.createNotes(
        student.email,
        req.body
      );
      return res.status(201).json(notes);
    } catch (error: any) {
      console.error("Error creating notes:", error);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };
  updateNotes = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const notes = await this.StudentUseCase.updateNotes(
        student.email,
        req.params.id,
        req.body.note
      );
      return res.status(200).json(notes);
    } catch (error: any) {
      console.error("Error updating notes:", error);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };
  deleteNotes = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const notes = await this.StudentUseCase.deleteNotes(
        student.email,
        req.params.id
      );
      return res.status(200).json(notes);
    } catch (error: any) {
      console.error("Error deleting notes:", error);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };
  updateNote = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const notes = await this.StudentUseCase.updateNote(
        student.email,
        req.params.id,
        req.body.newText,
        req.body.noteIndex
      );
      return res.status(200).json(notes);
    } catch (error: any) {
      console.error("Error updating note:", error);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };
  deleteNote = async (req: IAuthanticatedRequest, res: Response) => {
    try {
      const student = req.student;
      if (!student || typeof student === "string" || !("email" in student)) {
        throw new Error("Invalid token payload: Email not found");
      }
      const notes = await this.StudentUseCase.deleteNote(
        student.email,
        req.params.id,
        req.body.noteIndex
      );
      return res.status(200).json(notes);
    } catch (error: any) {
      console.error("Error deleting note:", error);
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };
}

export default StudentController