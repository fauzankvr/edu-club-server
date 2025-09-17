export class CategoryEntity {
  constructor(
    public name: string,
    public readonly id?: string,
    public isBlocked?: boolean
  ) {}

}
