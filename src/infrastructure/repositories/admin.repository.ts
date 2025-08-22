import { Model } from "mongoose";
import IAdminRepo from "../../application/interface/IAdminRepository";
import { IAdmin } from "../database/models/AdminModel";
import PayoutRequestModel from "../database/models/Payout";
import { IOrder } from "../database/models/OrderModel";
import { IStudent } from "../database/models/StudentModel";
import { ICourse } from "../database/models/CourseModel";
import { IInstructor } from "../database/models/InstructorModel";

export class AdminRepository implements IAdminRepo {
  constructor(
    private _adminModal: Model<IAdmin>,
    private _orderModel: Model<IOrder>,
    private _userModel: Model<IStudent>,
    private _courseModel: Model<ICourse>,
    private _instructorModel: Model<IInstructor>
  ) {}

  async findAdminByEmail(email: string): Promise<IAdmin | null> {
    const admin = await this._adminModal.findOne({ email });
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

    const result = await this._orderModel.aggregate([
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

    const now = new Date();
    if (filter) {
      if (filter.type === "custom" && filter.startDate && filter.endDate) {
        matchStage.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
      } else if (filter.type === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        matchStage.createdAt = { $gte: oneWeekAgo };
      } else if (filter.type === "yearly") {
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 4); // last 5 years including current
        fiveYearsAgo.setMonth(0, 1); // Jan 1st
        fiveYearsAgo.setHours(0, 0, 0, 0);
        matchStage.createdAt = { $gte: fiveYearsAgo };
      }
    }

    // Group key based on filter
    const groupBy =
      filter?.type === "weekly"
        ? { $dayOfWeek: "$createdAt" }
        : filter?.type === "yearly"
        ? { $year: "$createdAt" }
        : { $month: "$createdAt" };

    const result = await this._orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          total: { $sum: "$priceUSD" },
        },
      },
      {
        $project: {
          name:
            filter?.type === "weekly"
              ? {
                  $arrayElemAt: [
                    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    { $subtract: ["$_id", 1] },
                  ],
                }
              : filter?.type === "yearly"
              ? { $toString: "$_id" }
              : {
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
          revenue: "$total",
        },
      },
      { $sort: { name: 1 } },
    ]);

    // Fill in missing periods for frontend display
    let allPeriods: string[];

    if (filter?.type === "weekly") {
      allPeriods = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    } else if (filter?.type === "yearly") {
      const currentYear = now.getFullYear();
      allPeriods = Array.from({ length: 5 }, (_, i) =>
        (currentYear - 4 + i).toString()
      );
    } else {
      allPeriods = [
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
    }

    const revenueMap = new Map(result.map((item) => [item.name, item.revenue]));

    return allPeriods.map((period) => ({
      name: period,
      revenue: revenueMap.get(period) || 0,
    }));
  }

  async getTotalStudents(): Promise<number> {
    return this._userModel.countDocuments();
  }

  async getTotalTeachers(): Promise<number> {
    return this._instructorModel.countDocuments();
  }

  async getTotalCourses(): Promise<number> {
    return this._courseModel.countDocuments();
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

    const orders = await this._orderModel.aggregate([
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

  async getOrderDetails(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<
    {
      courseName: string;
      studentName: string;
      price: number;
      date: string;
      courseImage: string;
    }[]
  > {
    const match: any = {
      status: "PAID",
    };

    if (filter?.type === "custom" && filter.startDate && filter.endDate) {
      match.createdAt = {
        $gte: new Date(filter.startDate),
        $lte: new Date(filter.endDate),
      };
    } else if (filter?.type) {
      const now = new Date();
      let from: Date;

      switch (filter.type) {
        case "weekly":
          from = new Date();
          from.setDate(now.getDate() - 7);
          break;
        case "monthly":
          from = new Date();
          from.setMonth(now.getMonth() - 1);
          break;
        case "yearly":
          from = new Date();
          from.setFullYear(now.getFullYear() - 1);
          break;
        default:
          from = new Date(0);
      }

      match.createdAt = {
        $gte: from,
        $lte: now,
      };
    }

    const result = await this._orderModel.aggregate([
      { $match: match },
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
            { $project: { title: 1, courseImageId: 1 } },
          ],
          as: "courseDetails",
        },
      },
      { $unwind: { path: "$courseDetails", preserveNullAndEmptyArrays: true } },
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
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          courseName: "$courseDetails.title",
          courseImage: "$courseDetails.courseImageId",
          studentName: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
          price: "$priceUSD",
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      { $sort: { date: -1 } },
    ]);

    return result;
  }
}

