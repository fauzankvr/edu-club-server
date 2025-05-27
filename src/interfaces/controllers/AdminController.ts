import { Request, Response } from "express";
import { AdminUseCase } from "../../application/useCase/AdminUseCase";
import { approvePayoutService } from "../../infrastructure/services/approvePayoutService";


class AdminController {
  constructor(private AdminUseCase: AdminUseCase) {}

  loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("admin body", req.body);
    try {
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }

      const result = await this.AdminUseCase.loginAdmin(email, password);
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
  findAllStudent = async (req: Request, res: Response) => {
    try {
      const studentData = await this.AdminUseCase.findAllStudents();
      res.status(200).json({
        studentsData: studentData,
      });
    } catch (error) {
      res.status(401).json({ message: error });
    }
  };
  findAllTeachers = async (req: Request, res: Response) => {
    try {
      const teacherData = await this.AdminUseCase.findAllTeachers();
      res.status(200).json({
        teachersData: teacherData,
      });
    } catch (error) {
      res.status(401).json({ message: error });
    }
  };
  blockTeacher = async (req: Request, res: Response) => {
    try {
      const email = req.body.email;
      const result = await this.AdminUseCase.blockTeacher(email);
      console.log(result);
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      res.status(401).json({ message: error });
    }
  };
  blockStudent = async (req: Request, res: Response) => {
    try {
      const email = req.body.email;
      const result = await this.AdminUseCase.blockStudent(email);
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      res.status(401).json({ message: error });
    }
  };
  logOutAdmin = async (req: Request, res: Response) => {
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
  getPayouts = async (req: Request, res: Response) => {
    try {
      console.log("payout admin");
      const payouts = await this.AdminUseCase.getPayouts();
      res.status(200).json({
        payouts,
      });
    } catch (error) {
      res.status(401).json({ message: error });
    }
  };
  updatePayout = async (req: Request, res: Response) => {
    try {
      const payoutId = req.params.id;
      const action  = req.body.action;
      const result = await approvePayoutService(payoutId,action);
      res.status(200).json({
        success: true,
        message: "Payout updated successfully",
        payout: result,
      });
    } catch (error) {
      res.status(401).json({ message: error });
    }
  }
}

export default AdminController