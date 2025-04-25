
export class SafeStudent {
  constructor(
    public email: string,
    public isBlocked: boolean,
    public firstName?: string,
    public lastName?: string,
    public phone?: number | null,
    public linkedInId?: string | null,
    public githubId?: string | null,
    public googleId?: string | null,
    public profileImage?: string | null,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  getFullName(): string {
    return `${this.firstName ?? ""} ${this.lastName ?? ""}`.trim();
  }
}
