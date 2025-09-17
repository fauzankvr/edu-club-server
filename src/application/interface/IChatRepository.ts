import { ChatEntity } from "../../domain/entities/Chat";

export interface IChatRepo {
  create(data: { userId: string; instructorId: string }): Promise<ChatEntity>;
  findById(id: string): Promise<ChatEntity[] | []>;
  findByUser(userId: string): Promise<ChatEntity[]>;
  findByInstructor(instructorId: string): Promise<ChatEntity[]>;
  update(id: string, data: Partial<ChatEntity>): Promise<ChatEntity>;
}
