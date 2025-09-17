import { DiscussionEntity } from "../../domain/entities/Discussion";
import { DiscussionDto } from "../interface/Dto/DiscussionDto";
import { ReplyDto } from "../interface/Dto/ReplayDto";
import { IDiscussion, IReply } from "../interface/IDiscussion";
import { IDiscussionRepository } from "../interface/IDiscussionRepository";
import { IDiscussionUseCase } from "../interface/IDiscussionUseCase";
import { IOrderRepository } from "../interface/IOrderRepository";


export class DiscussionUseCase implements IDiscussionUseCase {
  constructor(private _discussionRepository: IDiscussionRepository,private _orderRepository:IOrderRepository) { }
  
  async createDiscussion(
    id: string,
    text: string
  ): Promise<DiscussionDto> {
    const res = await this._orderRepository.getOrderById(id)
    if (!res) {
      throw new Error("inviled datas")
    }
    if (!res.userId || !res.courseId || !text) {
      throw new Error("Missing required fields");
    }
    const discussion = new DiscussionEntity(
      id,
      res.userId,
      res.courseId,
      text,
      0,
       0,
      [],
      []
    );

    const result = await this._discussionRepository.create(discussion);
    if (!result) throw new Error("Failed to create discussion");

    return DiscussionDto.fromEntity(result);
  }

  async getAllDiscussions(orderId: string): Promise<DiscussionDto[]> {
    try {
      const discussions = await this._discussionRepository.getAllDiscussions(
        orderId
      );

      return discussions.map((discussion) =>
        DiscussionDto.fromEntity(discussion)
      );
    } catch (error) {
      console.error("Error in getAllDiscussions:", error);
      throw new Error("Failed to fetch discussions");
    }
  }
  async createReact(
    id: string,
    type: "like" | "dislike"
  ): Promise<DiscussionDto | null> {
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
    const discussionData = new DiscussionEntity(
      id,
      discussion.studentId,
      discussion.courseId,
      discussion.text,
      discussion.likes,
      discussion.dislikes,
      discussion.likedBy,
      discussion.dislikedBy
    );
    const result = await this._discussionRepository.updateReaction(
      id,
      discussionData
    );
    if (!result) throw new Error("Failed to update reaction");
    return DiscussionDto.fromEntity(result);
  }

  async addReply(
    discussionId: string,
    reply: ReplyDto
  ): Promise<DiscussionDto | null> {
    const discussion = await this._discussionRepository.findByIdDiscussion(
      discussionId
    );
    if (!discussion) throw new Error("Discussion not found");
    if (!discussion.replies) discussion.replies = [];
    discussion?.replies.push(reply);
    const discussionData = new DiscussionEntity(
      discussion.id,
      discussion.studentId,
      discussion.courseId,
      discussion.text,
      discussion.likes,
      discussion.dislikes,
      discussion.likedBy,
      discussion.dislikedBy
    )
    const result = await this._discussionRepository.updateReplay(
      discussionId,
      discussionData
    );
    if(!result) throw new Error("Failed to add reply");
    return DiscussionDto.fromEntity(result);
  }

  async getReplay(discussionId: string): Promise<ReplyDto[]> {
    const discussion = await this._discussionRepository.findReplayById(
      discussionId
    );

    if (!discussion) {
      throw new Error("Discussion not found");
    }

    return discussion;
  }
}