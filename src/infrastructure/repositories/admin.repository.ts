import { Model } from "mongoose";
import IAdminRepo from "../../application/interface/IAdminRepo";
import { IAdmin } from "../database/models/AdminModel";
import PayoutRequestModel from "../database/models/Payout";
import { IOrder } from "../database/models/OrderModel";
import { IStudent } from "../database/models/StudentModel";
import { ICourse } from "../database/models/CourseModel";
import { IInstructor } from "../database/models/InstructorModel";

export class AdminRepository implements IAdminRepo {
  constructor(private AdminModal: Model<IAdmin>,
    private orderModel: Model<IOrder>,
  private userModel: Model<IStudent>,
    private courseModel: Model<ICourse>,
    private instructorModel: Model<IInstructor>
  ) {}

  async findAdminByEmail(email: string): Promise<IAdmin | null> {
    const admin = await this.AdminModal.findOne({ email });
    return admin;
  }
  async getPayouts(): Promise<any[]> {
    const pendingPayouts = await PayoutRequestModel.aggregate([
    
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
          },
        },
      },
    ]);
    return pendingPayouts;
  }

  async getTotalRevenue(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const matchStage: any = { status: "PAID" };
    if (filter) {
      if (filter.type === "custom" && filter.startDate && filter.endDate) {
        matchStage.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
      } else if (filter.type === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchStage.createdAt = { $gte: oneWeekAgo };
      } else if (filter.type === "yearly") {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        matchStage.createdAt = { $gte: oneYearAgo };
      }
    }

    const result = await this.orderModel.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$priceUSD" } } },
    ]);
    return result[0]?.total || 0;
  }

  async getRevenueByPeriod(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ name: string; revenue: number }[]> {
    const matchStage: any = { status: "PAID" };
    if (filter) {
      if (filter.type === "custom" && filter.startDate && filter.endDate) {
        matchStage.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
      } else if (filter.type === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchStage.createdAt = { $gte: oneWeekAgo };
      } else if (filter.type === "yearly") {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        matchStage.createdAt = { $gte: oneYearAgo };
      }
    }

    const groupBy =
      filter?.type === "weekly"
        ? { $dayOfWeek: "$createdAt" }
        : { $month: "$createdAt" };
    const result = await this.orderModel.aggregate([
      { $match: matchStage },
      { $group: { _id: groupBy, total: { $sum: "$priceUSD" } } },
      {
        $project: {
          name: {
            $cond: {
              if: { $eq: [filter?.type, "weekly"] },
              then: {
                $arrayElemAt: [
                  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                  { $subtract: ["$_id", 1] },
                ],
              },
              else: {
                $arrayElemAt: [
                  [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  { $subtract: ["$_id", 1] },
                ],
              },
            },
          },
          revenue: "$total",
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const allPeriods =
      filter?.type === "weekly"
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
    const revenueMap = new Map(result.map((item) => [item.name, item.revenue]));
    return allPeriods.map((period) => ({
      name: period,
      revenue: revenueMap.get(period) || 0,
    }));
  }

  async getTotalStudents(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async getTotalTeachers(): Promise<number> {
    return this.instructorModel.countDocuments();
  }

  async getTotalCourses(): Promise<number> {
    return this.courseModel.countDocuments();
  }

  async getReportData(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ totalRevenue: string; orders: any[] }> {
    const matchStage: any = { status: "PAID" };
    if (filter) {
      if (filter.type === "custom" && filter.startDate && filter.endDate) {
        matchStage.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
      } else if (filter.type === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchStage.createdAt = { $gte: oneWeekAgo };
      } else if (filter.type === "yearly") {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        matchStage.createdAt = { $gte: oneYearAgo };
      }
    }

    const orders = await this.orderModel.aggregate([
      { $match: matchStage },

      // Group to calculate total revenue
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$priceUSD" },
          orders: { $push: "$$ROOT" },
        },
      },

      // Unwind the orders array to resume processing
      { $unwind: "$orders" },
      { $replaceRoot: { newRoot: "$orders" } },

      // Continue your lookups
      {
        $lookup: {
          from: "courses",
          let: { courseIdString: "$courseId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$courseIdString", { $toString: "$_id" }] },
              },
            },
            { $project: { title: 1 } },
          ],
          as: "courseDetails",
        },
      },
      {
        $unwind: { path: "$courseDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "students",
          let: { userIdString: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$userIdString", { $toString: "$_id" }] },
              },
            },
            { $project: { firstName: 1, lastName: 1 } },
          ],
          as: "userDetails",
        },
      },
      {
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          courseName: "$courseDetails.title",
          studentName: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
          priceUSD: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.priceUSD || 0),
      0
    );

    return { totalRevenue, orders };
  }
}

