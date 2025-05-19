
import { Chat } from "../../domain/entities/Chat";
import { Message } from "../../domain/entities/Message";
import { MongoChatRepository } from "../../infrastructure/repositories/ChatRepository";
import { InstructorRepository } from "../../infrastructure/repositories/InstructorRepositorie";
import { StudentRepository } from "../../infrastructure/repositories/StudentRepositorie";
import { CreateChatDTO } from "../../interfaces/types/ChatDto";
import { SendMessageDTO } from "../../interfaces/types/MessageDto";

export class ChatUseCase {
  constructor(
    private chatMessageRepository: MongoChatRepository,
    private userRepository: StudentRepository,
    private instrucorRepository:InstructorRepository
  ) {}

  /**
   * Creates a new chat between a user and an instructor
   */
  async createChat(chatData: CreateChatDTO): Promise<Chat> {
    // Verify user exists
    const user = await this.userRepository.findStudentById(chatData.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify instructor exists
    const instructor = await this.instrucorRepository.findById(
      chatData.instructorId
    );
    if (!instructor) {
      throw new Error("Instructor not found");
    }

    const chat = await this.chatMessageRepository.createChat({
      userId: chatData.userId,
      instructorId: chatData.instructorId,
    });

    return chat;
  }

  /**
   * Retrieves all chats for a specific user
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    // Verify user exists
    const user = await this.userRepository.findStudentById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.chatMessageRepository.findChatsByUserId(userId);
  }

  /**
   * Retrieves all chats for a specific instructor
   */
  async getInstructorChats(instructorId: string): Promise<Chat[]> {
    // Verify instructor exists
    const instructor = await this.instrucorRepository.findById(instructorId);
    if (!instructor) {
      throw new Error("Instructor not found");
    }

    return this.chatMessageRepository.findChatsByInstructorId(instructorId);
  }

  /**
   * Sends a message in a specific chat
   */
  async sendMessage(messageData: SendMessageDTO): Promise<Message> {
    // Verify chat exists
    const chat = await this.chatMessageRepository.findChatById(
      messageData.chatId
    );
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Create message
    const message = await this.chatMessageRepository.createMessage({
      text: messageData.text,
      sender: messageData.sender,
      chatId: messageData.chatId,
    });

    // Update chat's lastMessageAt
    // await this.chatMessageRepository.updateChat(chat.id!, {
    //   lastMessageAt: new Date(),
    // });

    return message;
  }

  /**
   * Retrieves all messages for a specific chat
   */
  async getChatMessages(chatId: string): Promise<Message[]> {
    // Verify chat exists
    const chat = await this.chatMessageRepository.findChatById(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Get messages
    return this.chatMessageRepository.findMessagesByChatId(chatId);
  }
}
