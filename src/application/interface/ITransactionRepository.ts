import { ITransaction } from "../../infrastructure/database/models/Transaction";

export interface ITransactionRepository{
    getPendingPayments(email: string): Promise<ITransaction[]> 
}