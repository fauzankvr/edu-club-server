import { IDiscussion, IReply } from "../interface/IDiscussion";
import { IDiscussionRepo } from "../interface/IDiscussionRepo";


export class DiscussionUseCase {
  constructor(private discussionRepo:IDiscussionRepo) {}
  async createDiscussion(id: string, data: Partial<IDiscussion>) {
    return await this.discussionRepo.createDiscussion(id, data);
  }

  async getAllDiscussions(orderId: string): Promise<IDiscussion[]> {
    try {
      return await this.discussionRepo.getAllDiscussions(orderId);
    } catch (error) {
      console.error("Error in getAllDiscussions:", error);
      throw new Error("Failed to fetch discussions");
    }
  }
  async createReact(id: string, type: "like" | "dislike") {
      const discussion = await this.discussionRepo.findByIdDiscussion(id);
      if(!discussion) throw new Error("disscussion not found")
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

    return await this.discussionRepo.updateReaction(id, discussion);
  }

  async addReply(
    discussionId: string,
    reply: IReply
  ): Promise<IDiscussion | null> {
    const discussion = await this.discussionRepo.findByIdDiscussion(
      discussionId
    );
    if (!discussion) throw new Error("Discussion not found");
    console.log(discussionId)
    discussion.replies.push(reply);
    return await this.discussionRepo.updateReplay(discussionId, discussion);
  }

  async getReplay(discussionId: string) {
    const discussion = await this.discussionRepo.findReplayById(discussionId);

    if (!discussion) {
      throw new Error("Discussion not found");
    }

    return discussion;
  }
}