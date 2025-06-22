import { Model } from "mongoose";
import { IOtpRepo } from "../../application/interface/IotpRepo";
import { IOtp } from "../database/models/OtpModel";


class OtpRepository implements IOtpRepo{
    constructor(private OtpModel:Model<IOtp>) { }
    async createOtp(email: string, otp: string): Promise<IOtp> {
       return await this.OtpModel.create({ email, otp });
    }
    async findOtp(email: string): Promise<IOtp|null> {
        return await this.OtpModel.findOne({ email }).sort({ createdAt: -1 });
    }
    async deleteOtp(email: string): Promise<any> {
        return await this.OtpModel.deleteMany({ email})
    }


}

export default OtpRepository