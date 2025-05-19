import { Types } from "mongoose";
import { SafeStudent } from "./SafeStudent";

export class Student {
  constructor(
    public email: string,
    public password: string,
    public isBlocked: boolean = false,
    public firstName?: string,
    public lastName?: string,
    public phone?: number | null,
    public linkedInId?: string | null,
    public githubId?: string | null,
    public googleId?: string | null,
    public profileImage?: string | null,
    public createdAt: Date = new Date(),
    public updatedAt?: Date,
    public _id?:Types.ObjectId,
  ) {}

  getFullName(): string {
    return `${this.firstName ?? ""} ${this.lastName ?? ""}`.trim();
  }

  block() {
    this.isBlocked = true;
  }

  unblock() {
    this.isBlocked = false;
  }

  // 🔐 Safe version for returning to client
  toSafe(): SafeStudent {
    return new SafeStudent(
      this.email,
      this.isBlocked,
      this.firstName,
      this.lastName,
      this.phone,
      this.linkedInId,
      this.githubId,
      this.googleId,
      this.profileImage,
      this.createdAt,
      this.updatedAt
    );
  }
}
