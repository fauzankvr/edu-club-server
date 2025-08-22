import { IMessage } from "../../infrastructure/database/models/MessageModel";

export interface IMessageRepository {
  createMessage(data: {
    text: string;
    sender: string;
    chatId: string;
  }): Promise<IMessage>;
  
  postMessage(data: object): Promise<IMessage>;
  findMessagesByChatId(chatId: string): Promise<IMessage[] | null>;
  getCallHistory(instructorId: string): Promise<any>;
  getAllMessages(chatId: string): Promise<IMessage[]>;
}
