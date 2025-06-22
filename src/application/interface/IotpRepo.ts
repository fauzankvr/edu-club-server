import { IOtp } from "../../infrastructure/database/models/OtpModel";

export interface IOtpRepo {
    createOtp(email: string, otp: string): Promise<IOtp>;
    deleteOtp(email: string): Promise<any>;
    findOtp(email: string): Promise<IOtp|null>;
}