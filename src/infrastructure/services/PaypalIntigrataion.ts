import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  ApiError,
  CheckoutPaymentIntent,
} from "@paypal/paypal-server-sdk";
import Course, { ICourse } from "../database/models/CourseModel";
import OrderModel from "../database/models/OrderModel";
import StudentModel, { IStudent } from "../database/models/StudentModel";
import TransactionModel from "../database/models/Transaction";
import { ObjectId, Types } from "mongoose"; // Added Types import for ObjectId validation
import { WishlistModel } from "../database/models/WishlistModel";

// Load PayPal environment variables
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PayPal environment variables");
}

// Initialize PayPal client
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const accessKey = process.env.EXCHANGE_KEY as string;
const newdate = new Date()
const date = newdate.toISOString().split("T")[0]

const convertINRtoUSD = async (inr: number): Promise<number> => {
  try {
    const res = await fetch(
      `https://api.exchangerate.host/convert?access_key=${accessKey}&from=INR&to=USD&amount=${inr}&date=${date}`
    );
    const data = await res.json();
    return parseFloat(data.result.toFixed(2));
  } catch (error) {
    console.error("Currency conversion failed, fallback to static rate.");
    const fallbackRate = 0.012; 
    return parseFloat((inr * fallbackRate).toFixed(2));
  }
};


const ordersController = new OrdersController(client);

// // Create a new PayPal Order and save in DB
export const createOrderService = async (cart: any, userEmail: string) => {
  // Validate cart input
  if (!cart || !Array.isArray(cart) || !cart.length) {
    throw new Error("Invalid cart data");
  }

  // Fetch course
  const course = (await Course.findById(cart[0].id)) as ICourse;
  if (!course) throw new Error("Course not found");

  // Fetch user
  const user = (await StudentModel.findOne({ email: userEmail })) as
    | (Document & IStudent & { _id: ObjectId })
    | null;
  if (!user) throw new Error("User not found");

  const userId = user._id.toString();
  const quantity = cart[0].quantity || 1;
  const priceINR = course.price;

  // Convert INR to USD (to show in PayPal)
  const priceUSD = (await convertINRtoUSD(priceINR)).toFixed(2);

  // Check if course is already purchased
  const paidOrder = await OrderModel.findOne({
    courseId: course.id,
    userId,
    status: "PAID",
  });
  if (paidOrder) {
    throw new Error("You already purchased this course");
  }

  // Check for existing pending order
  const existingPendingOrder = await OrderModel.findOne({
    courseId: course.id,
    userId,
    status: "PENDING",
  });

  if (existingPendingOrder) {
    try {
      // Verify the order with PayPal
      const { body } = await ordersController.getOrder({
        id: existingPendingOrder.paypalOrderId,
      });
      const orderDetails = typeof body === "string" ? JSON.parse(body) : body;

      // Check if order is still valid
      if (
        orderDetails.status === "CREATED" ||
        orderDetails.status === "APPROVED"
      ) {
        return {
          orderId: existingPendingOrder.paypalOrderId,
          status: "PENDING (Already Exists)",
        };
      } else {
        // Delete invalid or expired order
        await OrderModel.deleteOne({
          paypalOrderId: existingPendingOrder.paypalOrderId,
        });
      }
    } catch (error) {
      await OrderModel.deleteOne({
        paypalOrderId: existingPendingOrder.paypalOrderId,
      });
    }
  }

  // Create new PayPal order
  try {
    const { body } = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: priceUSD,
              breakdown: {
                itemTotal: {
                  currencyCode: "USD",
                  value: priceUSD,
                },
              },
            },
            items: [
              {
                name: course.title,
                unitAmount: {
                  currencyCode: "USD",
                  value: priceUSD,
                },
                quantity: quantity.toString(),
                description: course.description || "No description",
                sku: course.id.toString(),
              },
            ],
          },
        ],
      },
      prefer: "return=minimal",
    });

    if (typeof body === "string") {
      const jsonResponse = JSON.parse(body);
      if (!jsonResponse.id) throw new Error("No PayPal order ID received");

      const orderId = jsonResponse.id;

      // Save the order in the database (price stored in INR)
      await OrderModel.create({
        userId,
        courseId: course.id,
        quantity,
        paypalOrderId: orderId,
        status: "PENDING",
        priceUSD: priceINR, // Save actual INR value in DB
      });

      return {
        orderId,
        status: "PENDING",
      };
    } else {
      throw new Error("Unexpected PayPal response type");
    }
  } catch (error) {
    if (error instanceof ApiError) throw new Error(error.message);
    throw error;
  }
};

// Capture PayPal Order, create transaction, and update status
export const captureOrderService = async (orderID: string) => {
  if (!orderID || typeof orderID !== "string") {
    throw new Error("Invalid PayPal Order ID");
  }

  try {
    // Capture the order
    const { body } = await ordersController.captureOrder({
      id: orderID,
      prefer: "return=minimal",
    });

    if (typeof body === "string") {
      const jsonResponse = JSON.parse(body);

      // Extract captureId
      const captureId =
        jsonResponse.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

      if (!captureId) {
        throw new Error("No capture ID received from PayPal");
      }

      // Update the order status to PAID
      const updatedOrder = await OrderModel.findOneAndUpdate(
        { paypalOrderId: orderID },
        { status: "PAID" },
        { new: true }
      );

      if (!updatedOrder) {
        throw new Error("Order not found in database");
      }

      // Fetch course to get instructor
      const course = await Course.findById(updatedOrder.courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      if (!course.instructor) {
        throw new Error("Course does not have an associated instructor");
      }

      // Calculate payment split (PayPal fee: 2.9% + $0.30, admin: 15%, instructor: 85%)
      const totalAmount = updatedOrder.priceUSD;
      const paypalFee = parseFloat((totalAmount * 0.029 + 0.3).toFixed(2)); // PayPal fee
      const netAmount = parseFloat((totalAmount - paypalFee).toFixed(2));
      const adminShare = parseFloat((netAmount * 0.15).toFixed(2)); // 15%
      const instructorShare = parseFloat((netAmount * 0.85).toFixed(2)); // 85%

      // Create transaction record
      await TransactionModel.create({
        studentId: updatedOrder.userId,
        instructor: course.instructor, // Changed from instructorId to instructor
        courseId: updatedOrder.courseId,
        totalAmount,
        paypalFee,
        adminShare,
        instructorShare,
        paymentStatus: "COMPLETED",
        paypalTransactionId: captureId,
        payoutStatus: "PENDING",
        createdAt: new Date(),
      });

      // Remove course from wishlist
      const student = await StudentModel.findOne({ _id: updatedOrder.userId });
      if (student) {
        await WishlistModel.deleteOne({
          student: student.email,
          course: updatedOrder.courseId,
        });
      }

      return {
        message: "Payment captured successfully",
        captureId,
        orderID1: orderID,
      };
    } else {
      throw new Error("Unexpected PayPal response type");
    }
  } catch (error) {
    // Update order status to FAILED if capture fails
    await OrderModel.findOneAndUpdate(
      { paypalOrderId: orderID },
      { status: "FAILED" },
      { new: true }
    );

    if (error instanceof ApiError) throw new Error(error.message);
    throw error;
  }
};
