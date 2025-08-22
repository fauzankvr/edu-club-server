import { Chat } from "../../domain/entities/Chat";
import { Message } from "../../domain/entities/Message";
import { CreateChatDTO } from "../../interfaces/types/ChatDto";
import { SendMessageDTO } from "../../interfaces/types/MessageDto";

export interface IChatUseCase {
  // Chat management
  createChat(chatData: CreateChatDTO): Promise<Chat>;
  getUserChats(userId: string): Promise<Chat[]>;
  getInstructorChats(instructorId: string): Promise<Chat[]>;
  getAllChats(id: string): Promise<Chat[]>;
  getChatById(id: string): Promise<any>;

  // Message management
  sendMessage(messageData: SendMessageDTO): Promise<Message>;
  getChatMessages(chatId: string): Promise<Message[]>;
  postMessage(chatId: string, text: string, id: string): Promise<Message>;
  getAllMessages(id: string): Promise<Message[]>;
  getCallHistory(id: string): Promise<Message[]>;

  // AI Chat functionality
  runChat(
    message: string,
    studentId: string,
    courseId: string
  ): Promise<string>;
}
