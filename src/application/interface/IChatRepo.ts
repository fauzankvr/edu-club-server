import { Chat } from "../../domain/entities/Chat";
import { Message } from "../../domain/entities/Message";

export interface IChatRepo {
  // Chat-related methods
  createChat(data: { userId: string; instructorId: string }): Promise<Chat>;
  findChatById(id: string): Promise<Chat | null>;
  findChatsByUserId(userId: string): Promise<Chat[]>;
  findChatsByInstructorId(instructorId: string): Promise<Chat[]>;
  updateChat(id: string, data: Partial<Chat>): Promise<Chat>;
}
