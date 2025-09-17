import { Model } from "mongoose";
import IAdminRepo from "../../application/interface/IAdminRepository";
import { IAdmin } from "../database/models/AdminModel";

export class AdminRepository implements IAdminRepo {
  constructor(private readonly adminModel: Model<IAdmin>) {}

  async findByEmail(email: string): Promise<IAdmin | null> {
    return this.adminModel.findOne({ email });
  }
}
