import { IDiscussion, IReply } from "../interface/IDiscussion";
import { IDiscussionRepository } from "../interface/IDiscussionRepository";
import { IDiscussionUseCase } from "../interface/IDiscussionUseCase";


export class DiscussionUseCase implements IDiscussionUseCase {
  constructor(private _discussionRepository: IDiscussionRepository) {}
  async createDiscussion(id: string, data: Partial<IDiscussion>) {
    return await this._discussionRepository.createDiscussion(id, data);
  }

  async getAllDiscussions(orderId: string): Promise<IDiscussion[]> {
    try {
      return await this._discussionRepository.getAllDiscussions(orderId);
    } catch (error) {
      console.error("Error in getAllDiscussions:", error);
      throw new Error("Failed to fetch discussions");
    }
  }
  async createReact(
    id: string,
    type: "like" | "dislike"
  ): Promise<IDiscussion | null> {
    const discussion = await this._discussionRepository.findByIdDiscussion(id);
    if (!discussion) throw new Error("disscussion not found");
    let usersId = discussion.studentId;
    let userId = usersId.toString();
    // Remove existing reaction
    discussion.likedBy = discussion.likedBy.filter((id) => id !== userId);
    discussion.dislikedBy = discussion.dislikedBy.filter((id) => id !== userId);

    if (type === "like") {
      discussion.likedBy.push(userId);
    } else {
      discussion.dislikedBy.push(userId);
    }

    discussion.likes = discussion.likedBy.length;
    discussion.dislikes = discussion.dislikedBy.length;

    return await this._discussionRepository.updateReaction(id, discussion);
  }

  async addReply(
    discussionId: string,
    reply: IReply
  ): Promise<IDiscussion | null> {
    const discussion = await this._discussionRepository.findByIdDiscussion(
      discussionId
    );
    if (!discussion) throw new Error("Discussion not found");
    console.log(discussionId);
    discussion.replies.push(reply);
    return await this._discussionRepository.updateReplay(discussionId, discussion);
  }

  async getReplay(discussionId: string): Promise<IReply[]> {
    const discussion = await this._discussionRepository.findReplayById(discussionId);

    if (!discussion) {
      throw new Error("Discussion not found");
    }

    return discussion;
  }
}