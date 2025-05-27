import { IAdmin } from "../../infrastructure/database/models/AdminModel"


interface IAdminRepo {
  findAdminByEmail(email: string): Promise<IAdmin | null>;
  getPayouts(): Promise<any[]>;
}

export default IAdminRepo