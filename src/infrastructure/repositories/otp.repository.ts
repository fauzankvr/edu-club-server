import { Model } from "mongoose";
import { IOtp } from "../database/models/OtpModel";
import { OtpEntity } from "../../domain/entities/Otp";
import { IOtpRepository } from "../../application/interface/IotpRepository";

export class OtpRepository implements IOtpRepository {
  constructor(private _otpModel: Model<IOtp>) {}

  private toEntity(otp: IOtp): OtpEntity {
    return new OtpEntity(otp._id.toString(), otp.email, otp.otp, otp.createdAt);
  }

  async create(email: string, otp: string): Promise<OtpEntity> {
    const createdOtp = await this._otpModel.create({ email, otp });
    return this.toEntity(createdOtp);
  }

  async findByEmail(email: string): Promise<OtpEntity | null> {
    const otpDoc = await this._otpModel
      .findOne({ email })
      .sort({ createdAt: -1 });
    return otpDoc ? this.toEntity(otpDoc) : null;
  }

  async deleteByEmail(email: string): Promise<boolean> {
    const result = await this._otpModel.deleteMany({ email });
    return result.deletedCount !== undefined && result.deletedCount > 0;
  }
}
