import { Model } from "mongoose";
import { IAichatRepository } from "../../application/interface/IAicharRepository";
import { AiChatEntity } from "../../domain/entities/Aichat";
import { IAiChatMessage } from "../database/models/GeminiChatModel";


export class AichatRepository implements IAichatRepository {
    constructor(private _AichatModel: Model<IAiChatMessage>) { }
    private toEntity(doc: IAiChatMessage): AiChatEntity {
        return new AiChatEntity(
            doc.studentId.toString(),
            doc.courseId.toString(),
            doc.text,
            doc.reply,
            doc.createdAt,
            doc._id.toString(),
        );
    }
    async create(aiChatMessage: AiChatEntity): Promise<AiChatEntity> {
        const doc = await this._AichatModel.create(aiChatMessage);
        return this.toEntity(doc);
    }


    async findByCourseId(courseId: string): Promise<AiChatEntity[]> {
        const docs = await this._AichatModel.find({ courseId }).exec();
        return docs.map(this.toEntity);
    }
}