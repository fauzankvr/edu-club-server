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


const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PayPal environment variables");
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

  // In your service file, modify the existingPendingCheckout part:
  if (existingPendingCheckout) {
    try {
      const orderId = existingPendingCheckout.get("orderId"); 
      const { result } = await ordersController.getOrder(orderId);
      const orderDetails = result;

      if (
        orderDetails.status === "CREATED" ||
        orderDetails.status === "APPROVED"
      ) {
        return {
          orderId: orderId,
          status: "PENDING_OK_EXISTS",
        };
      } else {
        await existingPendingCheckout.deleteOne();
      }
    } catch (error) {
      await existingPendingCheckout.deleteOne();
    }
  }

  const priceUSD = plan.price.toFixed(2); // Use USD to match frontend
  const CURRENCY = "USD"; // Consistent currency

  // Sanitize plan name and description
  const sanitizedName = plan.name.replace(/[^a-zA-Z0-9 .-]/g, "").slice(0, 127);
  const sanitizedDescription = `Subscription to ${plan.name}`
    .replace(/[^a-zA-Z0-9 .-]/g, "")
        .slice(0, 127);
    
    const orderBody = {
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          // Must use camelCase here for SDK validation
          {
            amount: {
              currencyCode: "USD", // camelCase
              value: priceUSD,
              breakdown: {
                itemTotal: {
                  // camelCase
                  currencyCode: "USD", // camelCase
                  value: priceUSD,
                },
              },
            },
            items: [
              {
                name: sanitizedName,
                unitAmount: {
                  // camelCase
                  currencyCode: "USD", // camelCase
                  value: priceUSD,
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
      // Force TypeScript to accept the structure
      const { result } = await ordersController.createOrder(
        orderBody 
      );
      if (!result.id) {
        throw new Error("No PayPal order ID received");
      }

      const orderId = result.id;

      await PlanCheckoutModel.create({
        userId,
        planId,
        paymentStatus: "pending",
        amount: parseFloat(priceUSD),
        currency: CURRENCY,
        paymentMethod: "paypal",
        paypalOrderId: orderId,
        startDate: new Date(),
        endDate: calculateEndDate(plan.billingPeriod),
      });

      return {
        orderId,
        status: "PENDING",
      };
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
      console.log("ooooooooooorder",orderId)
        const { body } = await ordersController.captureOrder({ id: orderId });
        if (typeof body === "string") {
            const jsonResponse = JSON.parse(body);

            // Extract captureId
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

            return {
                message: "Payment captured successfully",
                captureId,
                orderId: orderId,
            };
        }
  } catch (error) {
    await PlanCheckoutModel.findOneAndUpdate(
      { orderId: orderId },
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
