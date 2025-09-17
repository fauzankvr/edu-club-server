  import { ReplyEntity } from "./Reply";

  export class DiscussionEntity {
    constructor(
      public readonly id: string,
      public readonly studentId: string,
      public readonly courseId: string,
      public readonly text: string,
      public  likes: number,
      public  dislikes: number,
      public  likedBy: string[],
      public  dislikedBy: string[],
      public  replies?: ReplyEntity[], 
      public readonly createdAt?: Date
    ) {}
  }
