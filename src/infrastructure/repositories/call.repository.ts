import { ICallRepository } from "../../application/interface/ICallRepository";
import { CallHistoryEntity } from "../../domain/entities/CallHistory";
import {
  CallHistoryModel,
  ICallHistory,
} from "../database/models/CallHistoryModel";

const toEntity = (call: ICallHistory): CallHistoryEntity => {
  return new CallHistoryEntity(
    call._id.toString(),
    call.roomId,
    call.callerId,
    call.callerName,
    call.receiverId,
    call.receiverName,
    call.startedAt,
    call.endedAt
  );
};

export class CallRepository implements ICallRepository {
  constructor() {}

  async findByInstructorId(instructorId: string): Promise<CallHistoryEntity[]> {
    const calls = await CallHistoryModel.find({
      receiverId: instructorId,
    }).lean();
    return calls.map((call) => toEntity(call as ICallHistory));
  }
}
