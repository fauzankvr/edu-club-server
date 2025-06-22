import { ITransaction } from "../../infrastructure/database/models/Transaction";

export interface ITransactionRepo{
    getPendingPayments(email: string): Promise<ITransaction[]> 
}