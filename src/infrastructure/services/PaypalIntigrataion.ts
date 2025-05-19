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
import StudentModel, { IStudents } from "../database/models/StudentModel";
import { ObjectId } from "mongoose";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
let orderId = "";

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PayPal environment variables");
}

// Create PayPal client
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

const ordersController = new OrdersController(client);

// Create a new PayPal Order and save in DB
export const createOrderService = async (cart: any, userEmail:string) => {
  if (!cart || !Array.isArray(cart) || !cart.length) {
    throw new Error("Invalid cart data");
  }

  const course = (await Course.findById(cart[0].id)) as ICourse;
  if (!course) throw new Error("Course not found");
  const myCourse = await OrderModel.findOne({
    courseId: cart[0].id
  })
  if (myCourse) {
    throw new Error("you alredy purchased")
  }

  const user = (await StudentModel.findOne({ email: userEmail })) as
    | (Document & IStudents & { _id: ObjectId })
    | null;
  if (!user) throw new Error("User not found");

  const userId = user._id.toString();
  const quantity = cart[0].quantity || 1;
  const priceUSD = course.price.toFixed(2);

  const orderBody = {
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
  };

  try {
    const { body } = await ordersController.createOrder(orderBody);

    if (typeof body === "string") {
      const jsonResponse = JSON.parse(body);

      if (!jsonResponse.id) throw new Error("No PayPal order ID received");
      orderId = jsonResponse.id;
      // Save the order in the database
      await OrderModel.create({
        userId,
        courseId: course.id,
        quantity,
        paypalOrderId: orderId,
        status: "PENDING",
        priceUSD: parseFloat(priceUSD),
      });
      console.log("oder id in ceate order ", jsonResponse.id);
      return {
        orderId: jsonResponse.id,
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

// Capture PayPal Order and update status
export const captureOrderService = async (orderID: string) => {
  if (!orderID || typeof orderID !== "string") {
    throw new Error("Invalid PayPal Order ID");
  }

  try {
    const { body } = await ordersController.captureOrder({
      id: orderID,
      prefer: "return=minimal",
    });

    if (typeof body === "string") {
      const jsonResponse = JSON.parse(body);

      // Extract captureId if needed
      const captureId =
        jsonResponse.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

      // Update the order status to PAID
      await OrderModel.findOneAndUpdate(
        { paypalOrderId: orderId },
        {
          status: "PAID",
        },
        { new: true }
      );

      return {
        message: "Payment captured successfully",
        captureId,
        orderID1: orderId,
      };
    } else {
      throw new Error("Unexpected PayPal response type");
    }
  } catch (error) {
    // If capture fails, update order status to FAILED
    await OrderModel.findOneAndUpdate(
      { paypalOrderId: orderId },
      { status: "FAILED" }
    );

    if (error instanceof ApiError) throw new Error(error.message);
    throw error;
  }
};
