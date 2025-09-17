import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import StudentModel from "../../infrastructure/database/models/StudentModel";
import { StatusCodes } from "../constants/statusCodes";
import { STUDENT_NOT_FOUND, UNAUTHORIZED } from "../constants/responseMessage";

export interface IAuthanticatedRequest extends Request {
  student?: string | JwtPayload;
  // student: string | JwtPayload;
  // student:string
}

const JWT_SECRET = process.env.JWT_SECRET || "abcabl#lsh";

export const verifyStudent = async (
  req: IAuthanticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    console.log("Token not found");
    res.status(StatusCodes.UNAUTHORIZED).json({ message: UNAUTHORIZED });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.student = decoded;
    if(decoded.role!=="student") {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: UNAUTHORIZED });
      return;
    }

    const student = await StudentModel.findOne({ email: decoded.email });

    if (!student) {
      res.status(404).json({ message: STUDENT_NOT_FOUND });
      return;
    }

    if (student.isBlocked) {
      res.status(403).json({ message: "User is blocked" });
      return;
    }

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ message: "Unauthorized: Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    } else {
      next(err);
    }
  }
};
