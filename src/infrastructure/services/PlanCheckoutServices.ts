import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  ApiError,
  CheckoutPaymentIntent,
} from "@paypal/paypal-server-sdk";
import { Types } from "mongoose";
import PlanModel from "../database/models/PlanModels";
import PlanCheckoutModel from "../database/models/PlanCheckoutModel";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, EXCHANGE_KEY } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !EXCHANGE_KEY) {
  throw new Error("Missing PayPal or exchange rate environment variables");
}

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

const newDate = new Date();
const date = newDate.toISOString().split("T")[0];

const convertINRtoUSD = async (inr: number): Promise<number> => {
  try {
    const res = await fetch(
      `https://api.exchangerate.host/convert?access_key=${EXCHANGE_KEY}&from=INR&to=USD&amount=${inr}&date=${date}`
    );
    const data = await res.json();
    return parseFloat(data.result.toFixed(2));
  } catch (error) {
    console.error("Currency conversion failed, fallback to static rate.");
    const fallbackRate = 0.012;
    return parseFloat((inr * fallbackRate).toFixed(2));
  }
};

export const createPlanOrderService = async (
  planId: string,
  userId: string
) => {
  if (!Types.ObjectId.isValid(planId) || !Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid plan or user ID");
  }

  const plan = await PlanModel.findById(planId);
  if (!plan || plan.isBlocked) {
    throw new Error("Plan not found or unavailable");
  }

  const existingPaidCheckout = await PlanCheckoutModel.findOne({
    planId,
    userId,
    paymentStatus: "completed",
  });
  if (existingPaidCheckout) {
    throw new Error("You already purchased this plan");
  }

  const existingPendingCheckout = await PlanCheckoutModel.findOne({
    planId,
    userId,
    paymentStatus: "pending",
  });

  if (existingPendingCheckout) {
    try {
      const orderId = existingPendingCheckout.paypalOrderId;
      if(!orderId) return
      const { body } = await ordersController.getOrder({ id: orderId });
      const orderDetails = typeof body === "string" ? JSON.parse(body) : body;

      if (
        orderDetails.status === "CREATED" ||
        orderDetails.status === "APPROVED"
      ) {
        return {
          orderId,
          status: "PENDING_OK_EXISTS",
        };
      } else {
        await PlanCheckoutModel.deleteOne({ paypalOrderId: orderId });
      }
    } catch (error) {
      await PlanCheckoutModel.deleteOne({
        paypalOrderId: existingPendingCheckout.paypalOrderId,
      });
    }
  }

  const priceINR = plan.price;
  const priceUSD = await convertINRtoUSD(priceINR);
  const formattedPriceUSD = priceUSD.toFixed(2);
  const CURRENCY = "USD";

  const sanitizedName = plan.name.replace(/[^a-zA-Z0-9 .-]/g, "").slice(0, 127);
  const sanitizedDescription = `Subscription to ${plan.name}`
    .replace(/[^a-zA-Z0-9 .-]/g, "")
    .slice(0, 127);

  const orderBody = {
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: CURRENCY,
            value: formattedPriceUSD,
            breakdown: {
              itemTotal: {
                currencyCode: CURRENCY,
                value: formattedPriceUSD,
              },
            },
          },
          items: [
            {
              name: sanitizedName,
              unitAmount: {
                currencyCode: CURRENCY,
                value: formattedPriceUSD,
              },
              quantity: "1",
              description: sanitizedDescription,
              sku: plan.id.toString(),
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
      if (!jsonResponse.id) {
        throw new Error("No PayPal order ID received");
      }

      const orderId = jsonResponse.id;

      await PlanCheckoutModel.create({
        userId,
        planId,
        paymentStatus: "pending",
        amount: priceINR, // Store INR in DB
        currency: "INR", // Store INR currency
        paymentMethod: "paypal",
        paypalOrderId: orderId,
        startDate: new Date(),
        endDate: calculateEndDate(plan.billingPeriod),
      });

      return {
        orderId,
        status: "PENDING",
      };
    } else {
      throw new Error("Unexpected PayPal response type");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("PayPal API Error:", {
        status: error.statusCode,
        message: error.message,
        details: error.result,
      });
      throw new Error(`PayPal error: ${error.message}`);
    }
    console.error("Unexpected error:", error);
    throw error;
  }
};

export const capturePlanOrderService = async (orderId: string) => {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("Invalid PayPal Order ID");
  }

  try {
    const { body } = await ordersController.captureOrder({ id: orderId });
    if (typeof body === "string") {
      const jsonResponse = JSON.parse(body);
      const captureId =
        jsonResponse.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

      if (!captureId) {
        throw new Error("No capture ID received from PayPal");
      }

      const updatedCheckout = await PlanCheckoutModel.findOneAndUpdate(
        { paypalOrderId: orderId },
        {
          paymentStatus: "completed",
          transactionId: captureId,
          paypalCaptureId: captureId,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedCheckout) {
        throw new Error("Checkout record not found");
      }

      // Optional: Add transaction logic (e.g., payment splits) if applicable
      // For plans, you may not need instructor/admin splits, but you can add similar logic if required
      const totalAmount = updatedCheckout.amount; // INR amount
      const paypalFee = parseFloat((totalAmount * 0.029 + 0.3).toFixed(2)); // Example PayPal fee in INR
      const netAmount = parseFloat((totalAmount - paypalFee).toFixed(2));
      const adminShare = parseFloat((netAmount * 0.15).toFixed(2)); // Example 15%
      const planShare = parseFloat((netAmount * 0.85).toFixed(2)); // Example 85%

      // Example: Create a transaction record (modify schema as needed)
      /*
      await TransactionModel.create({
        userId: updatedCheckout.userId,
        planId: updatedCheckout.planId,
        totalAmount,
        paypalFee,
        adminShare,
        planShare,
        paymentStatus: "COMPLETED",
        paypalTransactionId: captureId,
        payoutStatus: "PENDING",
        createdAt: new Date(),
      });
      */

      return {
        message: "Payment captured successfully",
        captureId,
        orderId,
      };
    } else {
      throw new Error("Unexpected PayPal response type");
    }
  } catch (error) {
    await PlanCheckoutModel.findOneAndUpdate(
      { paypalOrderId: orderId },
      { paymentStatus: "failed", updatedAt: new Date() },
      { new: true }
    );

    if (error instanceof ApiError) {
      console.error("PayPal API Error:", {
        status: error.statusCode,
        message: error.message,
        details: error.result,
      });
      throw new Error(`PayPal error: ${error.message}`);
    }
    console.error("Unexpected error:", error);
    throw error;
  }
};

function calculateEndDate(billingPeriod: string): Date {
  const now = new Date();
  if (billingPeriod === "month") {
    return new Date(now.setMonth(now.getMonth() + 1));
  } else if (billingPeriod === "year") {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  }
  throw new Error("Invalid billing period");
}
