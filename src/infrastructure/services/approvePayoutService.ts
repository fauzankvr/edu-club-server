import { Types } from "mongoose";
import * as paypal from "@paypal/payouts-sdk";
import PayoutRequestModel from "../database/models/Payout";
import TransactionModel from "../database/models/Transaction";

// Setup sandbox or live environment
const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
const isLive = process.env.PAYPAL_ENV === "live";
const isTestMode = process.env.PAYPAL_TEST_MODE === "true"; // ✅ Read test mode from env

const environment = isLive
  ? new paypal.core.LiveEnvironment(clientId, clientSecret)
  : new paypal.core.SandboxEnvironment(clientId, clientSecret);

const paypalClient = new paypal.core.PayPalHttpClient(environment);

export const approvePayoutService = async (
  payoutRequestId: string,
  action: "APPROVE" | "REJECT"
): Promise<{ message: string; payoutId?: string }> => {
  if (!Types.ObjectId.isValid(payoutRequestId)) {
    throw new Error("Invalid payout request ID");
  }

  const payoutRequest = await PayoutRequestModel.findById(payoutRequestId);
  if (!payoutRequest) {
    throw new Error("Payout request not found");
  }

  if (payoutRequest.requestStatus !== "PENDING") {
    throw new Error("Payout request is not in PENDING status");
  }

  if (action === "REJECT") {
    await PayoutRequestModel.findByIdAndUpdate(payoutRequestId, {
      requestStatus: "REJECTED",
      updatedAt: new Date(),
    });

    await TransactionModel.updateMany(
      { instructor: payoutRequest.instructor, payoutStatus: "REQUESTED" },
      { $set: { payoutStatus: "PENDING" } }
    );

    return { message: "Payout request rejected" };
  }

  // ✅ APPROVE: real or mock payout
  try {
    let payoutBatchId: string;

    if (isTestMode) {
      // ✅ MOCK PAYOUT (for testing only)
      payoutBatchId = `MOCK_BATCH_${Date.now()}`;
      console.log("Mocking PayPal payout with batch ID:", payoutBatchId);
    } else {
      // ✅ REAL PAYPAL CALL
      const request = new paypal.payouts.PayoutsPostRequest();
      request.requestBody({
        sender_batch_header: {
          sender_batch_id: `Payout_${payoutRequestId}_${Date.now()}`,
          email_subject: "Your payout from Edu-Club",
          email_message: "Thank you for your work! This is your payout.",
        },
        items: [
          {
            recipient_type: "EMAIL",
            amount: {
              value: payoutRequest.amount.toFixed(2),
              currency: "USD",
            },
            receiver: payoutRequest.paypalEmail,
            note: `Payout for request ${payoutRequestId}`,
            sender_item_id: payoutRequestId,
          },
        ],
      });

      const response = await paypalClient.execute(request);
      payoutBatchId = response?.result?.batch_header?.payout_batch_id;
    }

    await PayoutRequestModel.findByIdAndUpdate(payoutRequestId, {
      requestStatus: "APPROVED",
      payoutId: payoutBatchId,
      updatedAt: new Date(),
    });

    await TransactionModel.updateMany(
      { instructor: payoutRequest.instructor, payoutStatus: "REQUESTED" },
      { $set: { payoutStatus: "COMPLETED" } }
    );

    return {
      message: isTestMode
        ? "Payout mocked successfully (test mode)"
        : "Payout processed successfully (PayPal)",
      payoutId: payoutBatchId,
    };
  } catch (error: any) {
    await PayoutRequestModel.findByIdAndUpdate(payoutRequestId, {
      requestStatus: "FAILED",
      updatedAt: new Date(),
    });

    await TransactionModel.updateMany(
      { instructor: payoutRequest.instructor, payoutStatus: "REQUESTED" },
      { $set: { payoutStatus: "PENDING" } }
    );

    console.error("PayPal Payout Error:", {
      status: error.statusCode,
      message: error.message,
      headers: error.headers,
      response: error.response,
    });

    throw new Error("Payout failed: " + error.message);
  }
};
