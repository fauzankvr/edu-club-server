import { Model } from "mongoose";
import { UpdateCategoryDTO } from "../../application/interface/Dto/CatetoryDto";
import { ILanguage } from "../database/models/LanguageModel"; 
import { ILanguageRepository } from "../../application/interface/ILanguageRepository";
import { BaseRepository } from "./base.repository"; 

export class LanguageRepository extends BaseRepository<ILanguage> implements ILanguageRepository {
  constructor(private _languageModal: Model<ILanguage>) {
    super(_languageModal)
  }
   async update(id: string, data: UpdateCategoryDTO): Promise<ILanguage|null> {
       return await this._languageModal.findByIdAndUpdate(id, data, {
         new: true,
       });
  }
  findNotBlocked(): Promise<ILanguage[]> {
    return this._languageModal.find({ isBlocked: false });
  }

  findAllLanguages(limit: number, skip: number): Promise<ILanguage[]> {
    return this._languageModal.find().limit(limit).skip(skip).sort({ createdAt: -1 });
  }

  countDocuments(): Promise<number> {
    return this._languageModal.countDocuments();
  }

}
