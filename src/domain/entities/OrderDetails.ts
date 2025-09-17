export class OrderDetailsEntity {
  constructor(
    public readonly courseName: string,
    public readonly courseImage: string,
    public readonly studentName: string,
    public readonly price: number,
    public readonly date: string
  ) {}
}
