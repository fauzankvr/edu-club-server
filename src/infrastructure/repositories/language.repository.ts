import { Model } from "mongoose";
import { UpdateCategoryDTO } from "../../application/interface/Dto/CatetoryDto";
import { ILanguage } from "../database/models/LanguageModel"; 
import { ILanguageRepo } from "../../application/interface/ILanguageRepository";
import { BaseRepository } from "./base.repository"; 

export class LanguageRepository extends BaseRepository<ILanguage> implements ILanguageRepo {
  constructor(private LanguageModal: Model<ILanguage>) {
    super(LanguageModal)
  }
   async update(id: string, data: UpdateCategoryDTO): Promise<ILanguage|null> {
       return await this.LanguageModal.findByIdAndUpdate(id, data, {
         new: true,
       });
  }
  findNotBlocked(): Promise<ILanguage[]> {
    return this.LanguageModal.find({ isBlocked: false });
  }
    
}
