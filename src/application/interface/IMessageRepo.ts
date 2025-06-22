import { IMessage } from "../../infrastructure/database/models/MessageModel";

export interface IMessageRepo {
  createMessage(data: {
    text: string;
    sender: string;
    chatId: string;
  }): Promise<IMessage>;

  findMessagesByChatId(chatId: string): Promise<IMessage[] | null>;
  getCallHistory(instructorId: string): Promise<any>;
}
