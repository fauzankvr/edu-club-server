export class Instructor {
  constructor(
    public email: string,
    public password: string,
    public isBlocked: boolean,
    public fullName?: string,
    public phone?:number,
    public nationality?: string,
    public dateOfBirth?: Date,
    public eduQulification?: string,
    public profileImage?:string
  ) {}
}
