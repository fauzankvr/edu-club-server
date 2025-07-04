import { Model } from "mongoose";
import { Chat } from "../../domain/entities/Chat";
import { IChat } from "../database/models/ChatModel";
import { IChatRepo } from "../../application/interface/IChatRepo";
import Instructor from "../database/models/InstructorModel";
import { IMessage } from "../database/models/MessageModel";

export class ChatRepository implements IChatRepo {
  constructor(
    private ChatModel: Model<IChat>,
    private MessageModel: Model<IMessage>
  ) {}

  async getAllChats(id: string): Promise<any[]> {
    const chats = await this.ChatModel.aggregate([
      { $match: { instructorId: id } },
      {
        $addFields: {
          userIdObj: {
            $convert: {
              input: "$userId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "userIdObj",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $unwind: {
          path: "$studentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        // 🔽 Sort by lastMessageTime in descending order
        $sort: { lastMessageTime: -1 },
      },
    ]);

    // Compute unread count for each chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await this.MessageModel.countDocuments({
          chatId: chat._id.toString(),
          seenBy: { $ne: id },
        });
        return { ...chat, unreadCount };
      })
    );

    return chatsWithUnread;
  }

  async createChat(data: {
    userId: string;
    instructorId: string;
  }): Promise<Chat> {
    const chat = new this.ChatModel(data);
    await chat.save();
    return chat.toObject();
  }

  async findChatById(id: string): Promise<Chat | null> {
    return await this.ChatModel.findById(id).lean();
  }

  async findChatsByUserId(userId: string): Promise<any[]> {
    const chats = await this.ChatModel.find({ userId }).lean();

    const instructorIds = [...new Set(chats.map((chat) => chat.instructorId))];

    const instructors = await Instructor.find({
      _id: { $in: instructorIds },
    }).lean();

    const instructorMap = new Map(
      instructors.map((instr) => [instr._id.toString(), instr])
    );

    return chats.map((chat) => ({
      ...chat,
      instructor: instructorMap.get(chat.instructorId),
    }));
  }

  async findChatsByInstructorId(instructorId: string): Promise<any[]> {
    const chats = await this.ChatModel.find({ instructorId }).lean();
    const instructor = await Instructor.findOne({
      _id: instructorId,
    }).lean();

    return chats.map((chat) => ({
      ...chat,
      instructor,
    }));
  }

  async updateChat(id: string, data: Partial<Chat>): Promise<Chat> {
    const chat = await this.ChatModel.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();
    return chat as Chat;
  }
}
