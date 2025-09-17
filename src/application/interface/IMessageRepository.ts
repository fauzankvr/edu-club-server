import { MessageEntity } from "../../domain/entities/Message";
import { IBaseRepo } from "./IBaseRepository";

export interface IMessageRepository extends IBaseRepo<MessageEntity> {
  // createMessage(data: {
  //   text: string;
  //   sender: string;
  //   chatId: string;
  // }): Promise<MessageEntity>;

  // postMessage(data: object): Promise<MessageEntity>;

  findByChatId(chatId: string): Promise<MessageEntity[] | null>;

  getCallHistory(instructorId: string): Promise<any>;

  getAllMessages(chatId: string): Promise<MessageEntity[]>;
}
