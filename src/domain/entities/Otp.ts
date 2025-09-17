export class OtpEntity {
  constructor(
    public id: string,
    public email: string,
    public otp: string,
    public createdAt: Date
  ) {}
}
