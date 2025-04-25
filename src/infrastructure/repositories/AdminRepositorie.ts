import IAdminRepo from "../../application/interface/IAdminRepo";
import AdminModal, { IAdmin } from "../database/models/AdminModel";



export  class AdminRepository implements IAdminRepo {
  //   async findInstrucotrByEmail(email: string): Promise<IInstructor | null> {
  //     const instructorData = await InstructorModal.findOne({ email });
  //     return instructorData;
  //   }
  async findAdminByEmail(email: string): Promise<IAdmin | null> {
    const admin = await AdminModal.findOne({ email });
    return admin;
  }
}

