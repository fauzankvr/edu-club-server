import { IMessage } from "../database/models/MessageModel";
import { IMessageRepository } from "../../application/interface/IMessageRepository";
import { Model } from "mongoose";
import { CallHistoryModel } from "../database/models/CallHistoryModel";

export class MessageRepository implements IMessageRepository {
    constructor(private _messageModel: Model<IMessage>) {
        
    }
  async findMessagesByChatId(chatId: string): Promise<IMessage[]|null> {
    return await this._messageModel.find({ chatId }).lean();
  }

  async postMessage(data: object): Promise<IMessage> {
    return await this._messageModel.create(data);
  }

  async createMessage(data: {
    text: string;
    sender: string;
    chatId: string;
  }): Promise<IMessage> {
    const message = new this._messageModel(data);
    await message.save();
    return message
  }

  async getAllMessages(chatId: string): Promise<IMessage[]> {
    return this._messageModel.find({ chatId }).lean();
  }
  async getCallHistory(instructorId: string): Promise<any> {
    return await CallHistoryModel.find({ receiverId: instructorId });
  }
}
