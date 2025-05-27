import IAdminRepo from "../../application/interface/IAdminRepo";
import AdminModal, { IAdmin } from "../database/models/AdminModel";
import PayoutRequestModel from "../database/models/Payout";



export  class AdminRepository implements IAdminRepo {
  //   async findInstrucotrByEmail(email: string): Promise<IInstructor | null> {
  //     const instructorData = await InstructorModal.findOne({ email });
  //     return instructorData;
  //   }
  async findAdminByEmail(email: string): Promise<IAdmin | null> {
    const admin = await AdminModal.findOne({ email });
    return admin;
  }
  async getPayouts(): Promise<any[]> {
    const pendingPayouts = await PayoutRequestModel.aggregate([
      {
        $match: {
          requestStatus: "PENDING",
        },
      },
      {
        $lookup: {
          from: "instructors", 
          localField: "instructor", 
          foreignField: "email",
          as: "instructorDetails",
        },
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          paypalEmail: 1,
          requestStatus: 1,
          payoutId: 1,
          createdAt: 1,
          updatedAt: 1,
          instructor: {
            _id: "$instructorDetails._id",
            fullName: "$instructorDetails.fullName",
          }
        }
      }
    ]);
    return pendingPayouts;
  }

}

