import { CallHistoryEntity } from "../../domain/entities/CallHistory";

export interface ICallRepository {
    findByInstructorId(instructorId: string): Promise<CallHistoryEntity[]>, 
}