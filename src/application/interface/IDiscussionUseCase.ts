import { DiscussionEntity } from "../../domain/entities/Discussion";
import { IDiscussion, IReply } from "../interface/IDiscussion";
import { DiscussionDto, ReplyDto } from "./Dto/DiscussionDto";

export interface IDiscussionUseCase {
  createDiscussion(
    id: string,
    text:string 
  ): Promise<DiscussionDto>;

  getAllDiscussions(orderId: string): Promise<DiscussionDto[]>;

  createReact(
    id: string,
    type: "like" | "dislike"
  ): Promise<DiscussionDto | null>;

  addReply(
    discussionId: string,
    reply: ReplyDto
  ): Promise<DiscussionDto | null>;

  getReplay(discussionId: string): Promise<ReplyDto[]>;
}
