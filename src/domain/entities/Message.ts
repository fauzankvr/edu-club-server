export interface Message {
  id?: string;
  text: string;
  sender: "user" | "instructor";
  chatId: string;
  createdAt?: Date;
}
