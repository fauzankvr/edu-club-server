import { IMessage } from "../database/models/MessageModel";
import { IMessageRepo } from "../../application/interface/IMessageRepo";
import { Model } from "mongoose";
import { CallHistoryModel } from "../database/models/CallHistoryModel";

export class MessageRepository implements IMessageRepo {
    constructor(private MessageModel: Model<IMessage>) {
        
    }
  async findMessagesByChatId(chatId: string): Promise<IMessage[]|null> {
    return await this.MessageModel.find({ chatId }).lean();
  }

  async postMessage(data: object): Promise<IMessage> {
    return await this.MessageModel.create(data);
  }

  async createMessage(data: {
    text: string;
    sender: string;
    chatId: string;
  }): Promise<IMessage> {
    const message = new this.MessageModel(data);
    await message.save();
    return message
  }

  async getAllMessages(chatId: string): Promise<IMessage[]|null> {
    return this.MessageModel.find({ chatId }).lean();
    }
    async getCallHistory(instructorId: string): Promise<any> {
      return await CallHistoryModel.find({ receiverId: instructorId });
    }
}
