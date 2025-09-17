import { Model } from "mongoose";
// import { UpdateLanguageDto } from "../../application/interface/Dto/LanguageDto";
import { ILanguage } from "../database/models/LanguageModel";
import { ILanguageRepository } from "../../application/interface/ILanguageRepository";
import { BaseRepository } from "./base.repository";
import { LanguageEntity } from "../../domain/entities/Languate";

const toEntity=function(language: ILanguage): LanguageEntity {
    return new LanguageEntity(
      language.name,
      language.isBlocked,
      language._id.toString(),
    );
  }

export class LanguageRepository
  extends BaseRepository<ILanguage, LanguageEntity>
  implements ILanguageRepository
{
  constructor(private _languageModel: Model<ILanguage>) {
    super(_languageModel,toEntity);
  }



  // async update(
  //   id: string,
  //   data: UpdateLanguageDto
  // ): Promise<LanguageEntity | null> {
  //   const updated = await this._languageModel.findByIdAndUpdate(id, data, {
  //     new: true,
  //   });

  //   return toEntity(updated);
  // }

  async findByName(name: string): Promise<LanguageEntity | null> {
    const language = await this._languageModel.findOne({ name });
    return language ? toEntity(language) : null;
  }

  async findNotBlocked(): Promise<LanguageEntity[]> {
    const languages = await this._languageModel.find({ isBlocked: false });
    return languages.map((lang) => toEntity(lang)!);
  }

  async findAllLanguages(
    limit: number,
    skip: number
  ): Promise<LanguageEntity[]> {
    const languages = await this._languageModel
      .find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    return languages.map((lang) => toEntity(lang)!);
  }

  async countDocuments(): Promise<number> {
    return this._languageModel.countDocuments();
  }
}
