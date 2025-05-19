import { Request, Response } from "express";
import { ChatUseCase } from "../../application/useCase/ChatUsecase";
import { CreateChatDTO } from "../types/ChatDto";
import { SendMessageDTO } from "../types/MessageDto";

export class ChatController {
  constructor(private chatUseCase: ChatUseCase) {}

  async createChat(req: Request, res: Response): Promise<void> {
    try {
      console.log("i ami in cratechat")
      const chatData: CreateChatDTO = req.body;
      const chat = await this.chatUseCase.createChat(chatData);
      res.status(201).json(chat);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      console.log("iam in getchat")
      const { userId } = req.params;
      const chats = await this.chatUseCase.getUserChats(userId);
      res.status(200).json(chats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getInstructorChats(req: Request, res: Response): Promise<void> {
    try {
      const { instructorId } = req.params;
      const chats = await this.chatUseCase.getInstructorChats(instructorId);
      res.status(200).json(chats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      console.log("in send message")
      const messageData: SendMessageDTO = req.body;
      const message = await this.chatUseCase.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const messages = await this.chatUseCase.getChatMessages(chatId);
      res.status(200).json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
