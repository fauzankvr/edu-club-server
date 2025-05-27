import TransactionModel from "../database/models/Transaction";
import PayoutRequestModel from "../database/models/Payout";


export const requestPayoutService = async (
  instructorId: string,
  paypalEmail: string
): Promise<{ message: string; requestId: string }> => {

  if (!paypalEmail.match(/^\S+@\S+\.\S+$/)) {
    throw new Error("Invalid PayPal email");
  }

  // Calculate redeemable earnings
  const earnings = await TransactionModel.aggregate([
    {
      $match: {
        instructor: instructorId,
        payoutStatus: "PENDING",
      },
    },
    { $group: { _id: null, total: { $sum: "$instructorShare" } } },
  ]);

  const availableEarnings = earnings.length > 0 ? earnings[0].total : 0;

  if (availableEarnings <= 0) {
    throw new Error("No redeemable earnings available");
  }

  // Create payout request
  const payoutRequest = await PayoutRequestModel.create({
    instructor: instructorId,
    amount: availableEarnings,
    paypalEmail,
    requestStatus: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Update transactions to REQUESTED
  await TransactionModel.updateMany(
    { instructor: instructorId, payoutStatus: "PENDING" },
    { $set: { payoutStatus: "REQUESTED" } }
  );

  return {
    message: "Payout request submitted",
    requestId: payoutRequest._id.toString(),
  };
};


