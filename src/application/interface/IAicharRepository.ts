import { AiChatEntity } from "../../domain/entities/Aichat";

export interface IAichatRepository {
  create(aiChatMessage: AiChatEntity): Promise<AiChatEntity>;
  findByCourseId(courseId: string): Promise<AiChatEntity[]>;
//deleteByCourseId(courseId: string): Promise<void>;
}