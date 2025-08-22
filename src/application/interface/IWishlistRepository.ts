import { IWishlist } from "../../infrastructure/database/models/WishlistModel";

export interface IWishlistRepository {
  findWishlist(studentId: string, courseId: string): Promise<IWishlist | null>;
    addCourseToWishlist(studentId: string, courseId: string): Promise<IWishlist>;
      removeCourseFromWishlist(
        studentId: string,
        courseId: string
    ): Promise<IWishlist | null> 
    getWishlist(studentEmail: string): Promise<IWishlist[]> 
}