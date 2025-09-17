import { MessageEntity } from "../../domain/entities/Message";
import { IMessageRepository } from "../../application/interface/IMessageRepository";
import { Model } from "mongoose";
import { IMessage } from "../database/models/MessageModel";
import { CallHistoryModel } from "../database/models/CallHistoryModel";
import { BaseRepository } from "./base.repository";

const  toEntity =function (message: IMessage): MessageEntity {
    return new MessageEntity(
      message._id.toString(),
      message.text,
      message.sender.toString(),
      message.chatId.toString(),
      message.createdAt,
      message.updatedAt,
      message.seenBy,
      message.deleted,
      message.reactions
    );
  }

export class MessageRepository
  extends BaseRepository<IMessage, MessageEntity>
  implements IMessageRepository
{
  constructor(private _messageModel: Model<IMessage>) {
    super(_messageModel, toEntity);
  }

  

  async findByChatId(chatId: string): Promise<MessageEntity[] | null> {
   
    const messages = await this._messageModel.find({ chatId }).lean();
    return messages
      ? messages.map((msg) => toEntity(msg as IMessage))
      : null;
  }

  // async postMessage(data: object): Promise<MessageEntity> {
  //   const msg = await this._messageModel.create(data);
  //   return toEntity(msg);
  // }

  // async createMessage(data: {
  //   text: string;
  //   sender: string;
  //   chatId: string;
  // }): Promise<MessageEntity> {
  //   const message = new this._messageModel(data);
  //   await message.save();
  //   return toEntity(message);
  // }

  async getAllMessages(chatId: string): Promise<MessageEntity[]> {
    const messages = await this._messageModel.find({ chatId }).lean();
    return messages.map((msg) => toEntity(msg as IMessage));
  }

  async getCallHistory(instructorId: string): Promise<any> {
    return await CallHistoryModel.find({ receiverId: instructorId });
  }
}
