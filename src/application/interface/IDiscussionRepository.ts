import { DiscussionEntity } from "../../domain/entities/Discussion";
import { ReplyEntity } from "../../domain/entities/Reply";
import { IDiscussion } from "./IDiscussion";


export interface IDiscussionRepository {
  create(
    data: Partial<DiscussionEntity>
  ): Promise<DiscussionEntity | null>;

  getAllDiscussions(paypalOrderId: string): Promise<DiscussionEntity[]>;

  findByIdDiscussion(id: string): Promise<DiscussionEntity | null>;

  updateReaction(
    id: string,
    data: Partial<DiscussionEntity>
  ): Promise<DiscussionEntity | null>;

  updateReplay(
    id: string,
    data: Partial<DiscussionEntity>
  ): Promise<DiscussionEntity | null>;

  findReplayById(id: string): Promise<ReplyEntity[]>;
}
