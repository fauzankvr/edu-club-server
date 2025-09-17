
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatEntity } from "../../domain/entities/Chat";
import { CreateChatDTO } from "../../interfaces/types/ChatDto";
import { SendMessageDTO } from "../../interfaces/types/MessageDto";
import { IChatUseCase } from "../interface/IChatUseCase";
import { IMessageRepository } from "../interface/IMessageRepository";
import IStudentRepository from "../interface/IStudentRepository";
import IInstructorRepository from "../interface/IInstructorRepository";
import { IChatRepo } from "../interface/IChatRepository";
import { IAichatRepository } from "../interface/IAicharRepository";
import { AiChatEntity } from "../../domain/entities/Aichat";

export class ChatUseCase implements IChatUseCase {
  constructor(
    private _chatMessageRepository: IChatRepo,
    private _messageRepository: IMessageRepository,
    private _userRepository: IStudentRepository,
    private _instrucorRepository: IInstructorRepository,
    private _aichatRepository: IAichatRepository
  ) {}

  async createChat(chatData: CreateChatDTO): Promise<ChatEntity> {
    // Verify user exists
    const user = await this._userRepository.findById(chatData.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify instructor exists
    const instructor = await this._instrucorRepository.findById(
      chatData.instructorId
    );
    if (!instructor) {
      throw new Error("Instructor not found");
    }

    const chat = await this._chatMessageRepository.create({
      userId: chatData.userId,
      instructorId: chatData.instructorId,
    });

    return chat;
  }

  async getUserChats(userId: string): Promise<ChatEntity[]> {
    // Verify user exists
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this._chatMessageRepository.findByUser(userId);
  }

  async getInstructorChats(instructorId: string): Promise<ChatEntity[]> {
    // Verify instructor exists
    const instructor = await this._instrucorRepository.findById(instructorId);
    if (!instructor) {
      throw new Error("Instructor not found");
    }

    return this._chatMessageRepository.findByInstructor(instructorId);
  }

  async sendMessage(messageData: SendMessageDTO): Promise<any> {
    // Verify chat exists
    const chat = await this._chatMessageRepository.findById(
      messageData.chatId
    );
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Create message
    const message = await this._messageRepository.create({
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

  async getChatMessages(chatId: string): Promise<any> {
    // Verify chat exists
    const chat = await this._chatMessageRepository.findById(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Get messages
    return await this._messageRepository.findByChatId(chatId);
  }

  postMessage(chatId: string, text: string, id: string): Promise<any> {
    const data = {
      text,
      sender: id,
      chatId,
    };
    const chat = this._messageRepository.create(data);
    if (!chat) {
      throw new Error("Failed to post message");
    }
    return chat;
  }

  async getAllChats(id: string): Promise<ChatEntity> {
   
    const chats = await this._chatMessageRepository.findById(id);
    if (!chats) {
      throw new Error("Failed to retrieve chats");
    }

    return chats;
  }

  async getAllMessages(id: string): Promise<any> {
    const messages = this._messageRepository.getAllMessages(id);
    if (!messages) {
      throw new Error("Failed to retrieve messages");
    }
    return messages;
  }

  async getChatById(id: string): Promise<any> {
    const chat = await this._aichatRepository.findByCourseId(id)
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
  
    const responseText = result.response.text();
    const AiChat = new AiChatEntity(
      studentId,
      courseId,
      message,
      responseText,
      new Date()
    )
    await this._aichatRepository.create(AiChat);
    return responseText;
  }
  async getCallHistory(id: string) {
    const messages = this._messageRepository.getCallHistory(id);
    if (!messages) {
      throw new Error("Failed to retrieve messages");
    }
    return messages;
  }
}
