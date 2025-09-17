import mongoose, { Model } from "mongoose";
import { IOrderRepository } from "../../application/interface/IOrderRepository";
import { IOrder } from "../database/models/OrderModel";
import { OrderEntity } from "../../domain/entities/Order";
import CourseModel, { ICourse } from "../database/models/CourseModel";
import { OrderDetailsEntity } from "../../domain/entities/OrderDetails";

export class OrderRepository implements IOrderRepository {
  constructor(private _orderModel: Model<IOrder>) {}

  private toEntity(order: IOrder): OrderEntity {
    return new OrderEntity(
      order._id.toString(),
      order.userId,
      order.courseId,
      order.quantity,
      order.paypalOrderId,
      order.status,
      order.priceUSD,
      order.createdAt
    );
  }

  async getOrderById(paypalOrderId: string): Promise<OrderEntity | null> {
    const order = await this._orderModel.aggregate([
      { $match: { paypalOrderId } },
    ]);
    return order ? this.toEntity(order[0]) : null;
  }

  async getOrdersByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await this._orderModel.aggregate([
      { $match: { userId } },
      {
        $addFields: {
          courseIdObj: { $toObjectId: "$courseId" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseIdObj",
          foreignField: "_id",
          as: "courseId",
        },
      },
      { $unwind: "$courseId" },
    ]);

    return orders.map((o) => this.toEntity(o));
  }

  async findPaidCourses(id: string): Promise<
    Array<{
      orderDetails: OrderEntity & { courseDetails?: never };
      courseDetails: ICourse | null;
    }>
  > {
    const courses = await this._orderModel.aggregate([
      { $match: { userId: id.trim(), status: "PAID" } },
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
          ],
          as: "courseDetails",
        },
      },
      { $unwind: { path: "$courseDetails", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, orderDetails: "$$ROOT", courseDetails: 1 } },
    ]);

    return courses.map((c: any) => ({
      orderDetails: this.toEntity(c.orderDetails),
      courseDetails: c.courseDetails || null,
    }));
  }

  async getTotalRevenue(matchStage: Record<string, any>): Promise<number> {
    if(matchStage.startDate){
      matchStage = {
        status: "PAID",
        createdAt: {
          $gte: new Date(matchStage.startDate),
        },
      }
    }
    if (matchStage.startDate&&matchStage.endDate) {
        matchStage = {
          status: "PAID",
          createdAt: {
            $gte: new Date(matchStage.startDate),
            $lte: new Date(matchStage.endDate),
          },
        };
    }
    const result = await this._orderModel.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$priceUSD" } } },
    ]);

    return result[0]?.total || 0;
  }

  async getTotalEnrollments(instructorId: string): Promise<number> {
    const courseIds = await this.getInstructorCourseIds(instructorId);
    return this._orderModel.countDocuments({
      status: "PAID",
      courseId: { $in: courseIds },
    });
  }

  async getMonthlyRevenue(
    instructorId: string,
    filter?: {
      type: "weekly" | "monthly" | "yearly" | "custom";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ name: string; uv: number }[]> {
    const courseIds = await this.getInstructorCourseIds(instructorId);
    const matchStage: any = { status: "PAID", courseId: { $in: courseIds } };

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
      {
        $group: {
          _id:
            filter?.type === "weekly"
              ? { $dayOfWeek: "$createdAt" }
              : { $month: "$createdAt" },
          total: { $sum: "$priceUSD" },
        },
      },
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
          uv: "$total",
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
    const revenueMap = new Map(result.map((item) => [item.name, item.uv]));
    return allPeriods.map((period) => ({
      name: period,
      uv: revenueMap.get(period) || 0,
    }));
  }

  async getPaidOrderDetails(
    instructorId: string,
    filter?: any
  ): Promise<any[]> {
    const courseIds = await this.getInstructorCourseIds(instructorId);
    const matchStage: any = { status: "PAID", courseId: { $in: courseIds } };

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
          ],
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          courseName: "$courseDetails.title",
          courseImage: "$courseDetails.courseImageId",
          studentName: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
          price: "$priceUSD",
          date: "$createdAt",
        },
      },
    ]);

    return orders;
  }

  private async getInstructorCourseIds(
    instructorId: string
  ): Promise<string[]> {
    const courses = await CourseModel.find({ instructor: instructorId }).select(
      "_id"
    );
    return courses.map((course) => course._id.toString());
  }

  async getRevenueByPeriod(
    matchStage: any,
    groupBy: "weekly" | "monthly" | "yearly"
  ): Promise<{ name: string; revenue: number }[]> {
    let mongoGroup;
    if (groupBy === "weekly") mongoGroup = { $dayOfWeek: "$createdAt" };
    else if (groupBy === "monthly") mongoGroup = { $month: "$createdAt" };
    else mongoGroup = { $year: "$createdAt" };
    if (groupBy == "yearly") {
     matchStage = {
       status: "PAID",
       createdAt: {
         $gte: new Date(matchStage.startDate),
         $lte: new Date(matchStage.endDate),
       },
     };
    }

    const result = await this._orderModel.aggregate([
      { $match: matchStage },
      { $group: { _id: mongoGroup, total: { $sum: "$priceUSD" } } },
      { $sort: { _id: 1 } },
    ]);
    console.log('result',result)
    console.log("matchstage",matchStage);

    // Map for quick lookup
    const revenueMap = new Map(result.map((r) => [r._id, r.total]));
    console.log("Aggregation result:", result);

    if (groupBy === "yearly") {
      const currentYear = new Date().getFullYear();
      const last5Years = Array.from(
        { length: 5 },
        (_, i) => currentYear - i
      ).reverse();

      return last5Years.map((year) => ({
        name: year.toString(),
        revenue: revenueMap.get(year) || 0,
      }));
    }

    if (groupBy === "monthly") {
      const labels = [
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
      return labels.map((label, i) => ({
        name: label,
        revenue: revenueMap.get(i + 1) || 0, // Mongo months = 1–12
      }));
    }

    if (groupBy === "weekly") {
      const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return labels.map((label, i) => ({
        name: label,
        revenue: revenueMap.get(i + 1) || 0, // Mongo days = 1–7
      }));
    }

    return [];
  }

  async getOrderDetails(matchStage: any): Promise<OrderDetailsEntity[]> {
    const result = await this._orderModel.aggregate([
      { $match: matchStage },
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
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      { $sort: { date: -1 } },
    ]);

    // Convert DB output to entities
    return result.map(
      (r) =>
        new OrderDetailsEntity(
          r.courseName || "",
          r.courseImage || "",
          r.studentName || "",
          r.price || 0,
          r.date || ""
        )
    );
  }
  async getReportData(matchStage: any): Promise<any[]> {
    return this._orderModel.aggregate([
      { $match: matchStage },

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
          studentName: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
          priceUSD: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }
}
