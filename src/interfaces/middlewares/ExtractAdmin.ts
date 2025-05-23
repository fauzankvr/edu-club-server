import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import StudentModel from "../../infrastructure/database/models/StudentModel";

export interface IAuthanticatedRequest extends Request {
  admin?: string | JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || "abcabl#lsh";

export const verifyAdmin = async (
  req: IAuthanticatedRequest,
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
    req.admin = decoded;

    const admin = await StudentModel.findOne({ email: decoded.email });

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
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
