export class ReviewEntity {
    constructor(
        public readonly id: string,       
        public course: string,               
        public user: string,                
        public name: string,                 
        public rating: number,
        public comment: string,
        public likes: number = 0,
        public dislikes: number = 0,
        public likedBy: string[] = [],
        public dislikedBy: string[] = [],
        public createdAt?: Date
    ) { }
    
}