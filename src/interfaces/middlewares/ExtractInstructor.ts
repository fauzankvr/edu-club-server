import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import InstructorModel from "../../infrastructure/database/models/InstructorModel";

export interface IAuthenticatedRequest extends Request {
  instructor?: string | JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || "abcabl#lsh";

export const verifyInstructor = async (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

    try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.instructor = decoded;
      const instructor = await InstructorModel.findOne({ email: decoded.email });

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found" });
      return;
    }

    if (instructor.isBlocked) {
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
