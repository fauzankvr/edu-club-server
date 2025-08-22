import { IDiscussion, IReply } from "../interface/IDiscussion";

export interface IDiscussionUseCase {
  createDiscussion(
    id: string,
    data: Partial<IDiscussion>
  ): Promise<IDiscussion>;

  getAllDiscussions(orderId: string): Promise<IDiscussion[]>;

  createReact(
    id: string,
    type: "like" | "dislike"
  ): Promise<IDiscussion | null>;

  addReply(discussionId: string, reply: IReply): Promise<IDiscussion | null>;

  getReplay(discussionId: string): Promise<IReply[]>;
}
