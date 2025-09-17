import { WishlistEntity } from "../../domain/entities/Wishlist";

export interface IWishlistRepository {
  find(studentId: string, courseId: string): Promise<WishlistEntity | null>;
  add(studentId: string, courseId: string): Promise<WishlistEntity>;
  remove(studentId: string, courseId: string): Promise<WishlistEntity | null>;
  getByStudentId(studentId: string): Promise<WishlistEntity[]>;
}
