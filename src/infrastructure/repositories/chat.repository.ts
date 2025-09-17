import { Model } from "mongoose";
import { ChatEntity } from "../../domain/entities/Chat";
import { IChat } from "../database/models/ChatModel";
import { IChatRepo } from "../../application/interface/IChatRepository";
import mongoose from "mongoose";

export class ChatRepository implements IChatRepo {
  constructor(private _chatModel: Model<IChat>) {}

  // DB → Entity
  private static toEntity(chat: IChat): ChatEntity {
    return new ChatEntity(
      chat.userId,
      chat.instructorId,
      chat.userLastSeen,
      chat.instructorLastSeen,
      chat.lastMessage,
      chat.lastMessageTime,
      chat._id?.toString()
    );
  }

  // Entity → DB
  private static toDatabase(entity: ChatEntity): Partial<IChat> {
    return {
      userId: entity.userId,
      instructorId: entity.instructorId,
      userLastSeen: entity.userLastSeen,
      instructorLastSeen: entity.instructorLastSeen,
      lastMessage: entity.lastMessage,
      lastMessageTime: entity.lastMessageTime,
    };
  }

  async create(data: {
    userId: string;
    instructorId: string;
  }): Promise<ChatEntity> {
    const chat = new this._chatModel(data);
    await chat.save();
    return ChatRepository.toEntity(chat.toObject());
  }

  // async findById(id: string): Promise<ChatEntity | null> {
  //  const chat = await this._chatModel.aggregate([
  //    { $match: { _id: new mongoose.Types.ObjectId(id) } },
  //   //  {
  //   //    $lookup: {
  //   //      from: "instructors", // The target collection name
  //   //      let: { instructorId: { $toObjectId: "$instructorId" } }, // Convert instructorId to ObjectId
  //   //      pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$instructorId"] } } }],
  //   //      as: "instructor", // Output array field
  //   //    },
  //   //  },
  //  ]);

  //  return chat.length > 0 ? ChatRepository.toEntity(chat[0]) : null;
  // }

  async findById(id: string): Promise<ChatEntity[] | []> {
    const chat = await this._chatModel.aggregate([
      { $match: { instructorId: id } },
      {
        $lookup: {
          from: "students",
          let: { userIdStr: "$userId" }, // userId is string in chats
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$userIdStr" }], // convert string -> ObjectId
                },
              },
            },
          ],
          as: "userId",
        },
      },
      { $unwind: "$userId" },
    ]);
    return chat.length > 0 ? chat.map((item)=>ChatRepository.toEntity(item))  : [];
  }

  async findByUser(userId: string): Promise<ChatEntity[]> {
    const chats = await this._chatModel.find({ userId }).lean();
    return chats.map(ChatRepository.toEntity);
  }

  async findByInstructor(instructorId: string): Promise<ChatEntity[]> {
    const chats = await this._chatModel.find({ instructorId }).lean();
    return chats.map(ChatRepository.toEntity);
  }

  async update(id: string, data: Partial<ChatEntity>): Promise<ChatEntity> {
    const chat = await this._chatModel
      .findByIdAndUpdate(id, ChatRepository.toDatabase(data as ChatEntity), {
        new: true,
      })
      .lean();

    if (!chat) {
      throw new Error("Chat not found");
    }

    return ChatRepository.toEntity(chat);
  }
}
