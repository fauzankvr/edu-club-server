import { OtpEntity } from "../../domain/entities/Otp";

export interface IOtpRepository {
  create(email: string, otp: string): Promise<OtpEntity>;
  deleteByEmail(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<OtpEntity | null>;
}
