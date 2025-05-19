import { IChatRepo } from "../../application/interface/IChatRepo";
import { Chat } from "../../domain/entities/Chat";
import { Message } from "../../domain/entities/Message";
import { ChatModel } from "../database/models/ChatModel";
import InstructorModel from "../database/models/InstructorModel";
import { MessageModel } from "../database/models/MessageModel";


export class MongoChatRepository implements IChatRepo {
  async createChat(data: {
    userId: string;
    instructorId: string;
  }): Promise<Chat> {
    const chat = new ChatModel(data);
    await chat.save();
    return chat.toObject();
  }

  async findChatById(id: string): Promise<Chat | null> {
    const chat = await ChatModel.findById(id).lean();
    return chat || null;
  }

  async findChatsByUserId(userId: string): Promise<any[]> {
    const chats = await ChatModel.find({ userId }).lean();

    // Get unique instructor IDs
    const instructorIds = [...new Set(chats.map((chat) => chat.instructorId))];

    // Fetch all relevant instructors
    const instructors = await InstructorModel.find({
      _id: { $in: instructorIds },
    }).lean();

    // Create a map for quick lookup
    const instructorMap = new Map(
      instructors.map((instr) => [instr._id.toString(), instr])
    );

    // Attach instructor data to each chat
    const chatsWithInstructor = chats.map((chat) => ({
      ...chat,
      instructor: instructorMap.get(chat.instructorId),
    }));

    return chatsWithInstructor;
  }

  async findChatsByInstructorId(instructorId: string): Promise<any[]> {
    const chats = await ChatModel.find({ instructorId }).lean();

    const instructor = await InstructorModel.findOne({
      _id: instructorId,
    }).lean();

    // Manually append instructor data to each chat
    const chatsWithInstructor = chats.map((chat) => ({
      ...chat,
      instructor,
    }));

    return chatsWithInstructor;
  }

  async updateChat(id: string, data: Partial<Chat>): Promise<Chat> {
    const chat = await ChatModel.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();
    if (!chat) {
      throw new Error("Chat not found");
    }
    return chat;
  }

  async createMessage(data: {
    text: string;
    sender: string;
    chatId: string;
  }): Promise<Message> {
    const message = new MessageModel(data);
    await message.save();
    return message.toObject();
  }

  async findMessagesByChatId(chatId: string): Promise<Message[]> {
    return MessageModel.find({ chatId }).lean();
  }
}
