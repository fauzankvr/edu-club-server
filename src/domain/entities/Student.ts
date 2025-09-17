export class StudentEntity {
  constructor(
    public readonly id?: string,
    public email: string = "",
    public password?: string,
    public isBlocked: boolean = false,
    public firstName: string = "unknown",
    public lastName?: string,
    public phone?: string | null,
    public linkedInId?: string | null,
    public githubId?: string | null,
    public googleId?: string | null,
    public profileImage?: string | null,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
