import { ChatEntity } from "../../domain/entities/Chat";
import { MessageEntity } from "../../domain/entities/Message";
import { CreateChatDTO } from "../../interfaces/types/ChatDto";
import { SendMessageDTO } from "../../interfaces/types/MessageDto";

export interface IChatUseCase {
  // Chat management
  createChat(chatData: CreateChatDTO): Promise<ChatEntity>;
  getUserChats(userId: string): Promise<ChatEntity[]>;
  getInstructorChats(instructorId: string): Promise<ChatEntity[]>;
  getAllChats(id: string): Promise<ChatEntity>;
  getChatById(id: string): Promise<ChatEntity>;

  // Message management
  sendMessage(messageData: SendMessageDTO): Promise<MessageEntity>;
  getChatMessages(chatId: string): Promise<MessageEntity[]>;
  postMessage(chatId: string, text: string, id: string): Promise<MessageEntity>;
  getAllMessages(id: string): Promise<MessageEntity[]>;
  getCallHistory(id: string): Promise<MessageEntity[]>;

  // AI Chat functionality
  runChat(
    message: string,
    studentId: string,
    courseId: string
  ): Promise<string>;
}
