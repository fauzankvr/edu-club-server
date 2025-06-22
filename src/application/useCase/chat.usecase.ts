
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chat } from "../../domain/entities/Chat";
import { Message } from "../../domain/entities/Message";
import { ChatRepository } from "../../infrastructure/repositories/chat.repository";
import { InstructorRepository } from "../../infrastructure/repositories/Instructor.repository";
import { MessageRepository } from "../../infrastructure/repositories/message.repository";
import { StudentRepository } from "../../infrastructure/repositories/student.repository";
import { CreateChatDTO } from "../../interfaces/types/ChatDto";
import { SendMessageDTO } from "../../interfaces/types/MessageDto";
import { AiChatMessageModel } from "../../infrastructure/database/models/GeminiChatModel";

export class ChatUseCase {
  constructor(
    private chatMessageRepository: ChatRepository,
    private messageRepository: MessageRepository,
    private userRepository: StudentRepository,
    private instrucorRepository: InstructorRepository
  ) {}

  async createChat(chatData: CreateChatDTO): Promise<Chat> {
    // Verify user exists
    const user = await this.userRepository.findById(chatData.userId);
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

  async getUserChats(userId: string): Promise<Chat[]> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.chatMessageRepository.findChatsByUserId(userId);
  }

  async getInstructorChats(instructorId: string): Promise<Chat[]> {
    // Verify instructor exists
    const instructor = await this.instrucorRepository.findById(instructorId);
    if (!instructor) {
      throw new Error("Instructor not found");
    }

    return this.chatMessageRepository.findChatsByInstructorId(instructorId);
  }

  async sendMessage(messageData: SendMessageDTO) {
    // Verify chat exists
    const chat = await this.chatMessageRepository.findChatById(
      messageData.chatId
    );
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Create message
    const message = await this.messageRepository.createMessage({
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

  async getChatMessages(chatId: string) {
    // Verify chat exists
    const chat = await this.chatMessageRepository.findChatById(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Get messages
    return await this.messageRepository.findMessagesByChatId(chatId);
  }

  postMessage(chatId: string, text: string, id: string) {
    const data = {
      text,
      sender: id,
      chatId,
    };
    const chat = this.messageRepository.postMessage(data);
    if (!chat) {
      throw new Error("Failed to post message");
    }
    return chat;
  }
  async getAllChats(id: string) {
    const chats = await this.chatMessageRepository.getAllChats(id);
    if (!chats) {
      throw new Error("Failed to retrieve chats");
    }

    return chats;
  }
  async getAllMessages(id: string) {
    const messages = this.messageRepository.getAllMessages(id);
    if (!messages) {
      throw new Error("Failed to retrieve messages");
    }
    return messages;
  }
  async getChatById(id: string) {
    const chat = await AiChatMessageModel.findById(id).lean();
    if (!chat) {
      throw new Error("Chat not found");
    }
    return chat;
  }

  async runChat(message: string, studentId: string, courseId: string) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
    const result = await chat.sendMessage(
      `${message} Respond in plain text only (no formatting, no markdown) and peragraph vice  `
    );
    console.log(result.response.text)
    const responseText = result.response.text();
    await AiChatMessageModel.create({
      studentId,
      courseId,
      text: message,
      reply: responseText,
    });
    return responseText;
  }
  async getCallHistory(id: string) {
    const messages = this.messageRepository.getCallHistory(id);
    if (!messages) {
      throw new Error("Failed to retrieve messages");
    }
    return messages;
  }
}
