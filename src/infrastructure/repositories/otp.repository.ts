import { Model } from "mongoose";
import { IOtpRepository } from "../../application/interface/IotpRepository";
import { IOtp } from "../database/models/OtpModel";


class OtpRepository implements IOtpRepository {
    constructor(private _otpModel: Model<IOtp>) { }
    async createOtp(email: string, otp: string): Promise<IOtp> {
       return await this._otpModel.create({ email, otp });
    }
    async findOtp(email: string): Promise<IOtp|null> {
        return await this._otpModel.findOne({ email }).sort({ createdAt: -1 });
    }
    async deleteOtp(email: string): Promise<any> {
        return await this._otpModel.deleteMany({ email})
    }

}

export default OtpRepository