import { Request, Response } from "express";
import { AdminUseCase } from "../../application/useCase/AdminUseCase";
import { approvePayoutService } from "../../infrastructure/services/approvePayoutService";
import {
  FAILED_BOLOKED_INSTUCTOR,
  FAILED_BOLOKED_STUDENT,
  FAILED_PAYOUT_FETCH,
  FAILED_PAYOUT_UPDATE,
  INSTRUCTORS_FETCH_FAILE,
  INSTRUCTORS_FETCH_SUCCESS,
  LOGIN_FAILED,
  lOGOUT_FAILED,
  LOGOUT_SUCCESS,
  NO_EMAIL_PASSWORD_ERROR,
  PAYOUT_FETCH_SUCCESS,
  PAYOUT_UPDATE_SUCCESS,
  STUDENTS_FETCH_FAILE,
  STUDENTS_FETCH_SUCCESS,
  SUCCESS_BLOCKD_INSTUCTOR,
  SUCCESS_BLOCKD_STUDENT,
} from "../constants/responseMessage";
import { StatusCodes } from "../constants/statusCodes";
import {
  errorResponse,
  successResponse,
} from "../../infrastructure/utility/ResponseCreator";

class AdminController {
  constructor(private AdminUseCase: AdminUseCase) {}

  loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(NO_EMAIL_PASSWORD_ERROR));
      }

      const result = await this.AdminUseCase.loginAdmin(email, password);

      res.cookie("refreshToken", result.refreshToken, {
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res
        .status(StatusCodes.OK)
        .json(
          successResponse(result.message, { accessToken: result.accessToken })
        );
    } catch (error: unknown) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(
          errorResponse(error instanceof Error ? error.message : LOGIN_FAILED)
        );
    }
  };

  findAllStudent = async (req: Request, res: Response) => {
    try {
      const studentData = await this.AdminUseCase.findAllStudents();
      return res
        .status(StatusCodes.OK)
        .json(
          successResponse(STUDENTS_FETCH_SUCCESS, { studentsData: studentData })
        );
    } catch (error: unknown) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          errorResponse(
          error instanceof Error ? error.message : STUDENTS_FETCH_FAILE
          )
        );
    }
  };

  findAllTeachers = async (req: Request, res: Response) => {
    try {
      const teacherData = await this.AdminUseCase.findAllTeachers();
      return res
        .status(StatusCodes.OK)
        .json(successResponse(INSTRUCTORS_FETCH_SUCCESS, teacherData));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          errorResponse(
            error instanceof Error ? error.message : INSTRUCTORS_FETCH_FAILE
          )
        );
    }
  };

  blockInstructor = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await this.AdminUseCase.blockTeacher(email);
      return res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_BLOCKD_INSTUCTOR));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          errorResponse(
            error instanceof Error ? error.message : FAILED_BOLOKED_INSTUCTOR
          )
        );
    }
  };

  blockStudent = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await this.AdminUseCase.blockStudent(email);
      return res
        .status(StatusCodes.OK)
        .json(successResponse(SUCCESS_BLOCKD_STUDENT));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          errorResponse(
            error instanceof Error ? error.message : FAILED_BOLOKED_STUDENT
          )
        );
    }
  };

  logOutAdmin = async (req: Request, res: Response) => {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res.status(StatusCodes.OK).json(successResponse(LOGOUT_SUCCESS));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          errorResponse(error instanceof Error ? error.message : lOGOUT_FAILED)
        );
    }
  };

  getPayouts = async (req: Request, res: Response) => {
    try {
      const payouts = await this.AdminUseCase.getPayouts();
      return res
        .status(StatusCodes.OK)
        .json(successResponse(PAYOUT_FETCH_SUCCESS, payouts));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          errorResponse(
            error instanceof Error ? error.message : FAILED_PAYOUT_FETCH
          )
        );
    }
  };

  updatePayout = async (req: Request, res: Response) => {
    try {
      const { id: payoutId } = req.params;
      const { action } = req.body;

      const result = await approvePayoutService(payoutId, action);

      return res
        .status(StatusCodes.OK)
        .json(successResponse(PAYOUT_UPDATE_SUCCESS, result));
    } catch (error: unknown) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          errorResponse(
            error instanceof Error ? error.message : FAILED_PAYOUT_UPDATE
          )
        );
    }
  };
  async getDashboardData(req: Request, res: Response) {
    try {
      const { filterType, startDate, endDate } = req.query;
      let filter;
      if (filterType) {
        filter = {
          type: filterType as "weekly" | "monthly" | "yearly" | "custom",
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        };
      }
      const data = await this.AdminUseCase.getDashboardData(filter);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async downloadReport(req: Request, res: Response) {
    try {
      const { format, filterType, startDate, endDate } = req.query;
      if (!["pdf", "excel"].includes(format as string)) {
        return res.status(400).json({ error: "Invalid format" });
      }
      let filter;
      if (filterType) {
        filter = {
          type: filterType as "weekly" | "monthly" | "yearly" | "custom",
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        };
      }
      const { data, contentType, filename } =
        await this.AdminUseCase.getReportData(
          format as "pdf" | "excel",
          filter
        );
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default AdminController;
