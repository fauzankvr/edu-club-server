import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import InstructorModel from "../../infrastructure/database/models/InstructorModel";
import { StatusCodes } from "../constants/statusCodes";
import { INVALID_TOKEN_PAYLOAD, TOKEN_EXPIRED, USER_BLOCKED, USER_NOT_FOUND } from "../constants/responseMessage";

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
    res.status(StatusCodes.UNAUTHORIZED).json({ message: INVALID_TOKEN_PAYLOAD });
    return;
  }

    try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.instructor = decoded;
      const instructor = await InstructorModel.findOne({ email: decoded.email });

    if (!instructor) {
      res.status(StatusCodes.NOT_FOUND).json({ message: USER_NOT_FOUND });
      return;
    }

    if (instructor.isBlocked) {
      res.status(StatusCodes.FORBIDDEN).json({ message: USER_BLOCKED});
      return;
    }

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: TOKEN_EXPIRED });
    } else if (err.name === "JsonWebTokenError") {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: INVALID_TOKEN_PAYLOAD });
    } else {
      next(err);
    }
  }
};
