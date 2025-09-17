import { CurriculumEntity, LectureEntity, SectionEntity } from "../../../domain/entities/Curriculam";


export class LectureDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly videoPath?: string,
    public readonly pdfPath?: string
  ) {}

  static fromEntity(entity: LectureEntity): LectureDto {
    return new LectureDto(
      entity.id,
      entity.title,
      entity.videoPath,
      entity.pdfPath
    );
  }
}


export class SectionDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly lectures: LectureDto[]
  ) {}

  static fromEntity(entity: SectionEntity): SectionDto {
    return new SectionDto(
      entity.id,
      entity.title,
      entity.lectures.map(l => LectureDto.fromEntity(l))
    );
  }
}


export class CurriculumDto {
  constructor(
    public readonly id: string,
    public readonly courseId: string,
    public readonly instructor: string,
    public readonly sections: SectionDto[],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static fromEntity(entity: CurriculumEntity): CurriculumDto {
    return new CurriculumDto(
      entity.id,
      entity.courseId,
      entity.instructor,
      entity.sections.map(s => SectionDto.fromEntity(s)),
      entity.createdAt,
      entity.updatedAt
    );
  }
}

