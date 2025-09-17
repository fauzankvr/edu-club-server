import { TransactionEntity } from "../../domain/entities/Transaction";


export interface ITransactionRepository{
    getPendingPayments(email: string): Promise<TransactionEntity[]> 
}