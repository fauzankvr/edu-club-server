import { IDiscussion, IReply } from "./IDiscussion";

export interface IDiscussionRepo{
    createDiscussion(
        paypalOrderId: string,
        data: Partial<IDiscussion>
    ): Promise<any>
    getAllDiscussions(paypalOrderId: string): Promise<IDiscussion[]>
    findByIdDiscussion(id: string): Promise<IDiscussion | null>
    updateReaction(
        id: string,
        data: Partial<IDiscussion>
    ): Promise<IDiscussion | null>
    updateReplay(
        id: string,
        data: Partial<IDiscussion>
    ): Promise<IDiscussion | null>
    findReplayById(id: string): Promise<IReply[]>
    
}