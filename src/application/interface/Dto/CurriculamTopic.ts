import { CurriculumEntity, LectureEntity, SectionEntity } from "../../../domain/entities/Curriculam";


export class LectureTopicDto {
  constructor(public readonly id: string, public readonly title: string) {}

  static fromEntity(entity: LectureEntity): LectureTopicDto {
    return new LectureTopicDto(entity.id, entity.title);
  }
}

export class SectionTopicDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly lectures: LectureTopicDto[]
  ) {}

  static fromEntity(entity: SectionEntity): SectionTopicDto {
    return new SectionTopicDto(
      entity.id,
      entity.title,
      entity.lectures.map((l) => LectureTopicDto.fromEntity(l))
    );
  }
}

export class CurriculumTopicsDto {
  constructor(public readonly sections: SectionTopicDto[]) {}

  static fromEntity(
    entity: Pick<CurriculumEntity, "sections">
  ): CurriculumTopicsDto {
    return new CurriculumTopicsDto(
      entity.sections.map((s) => SectionTopicDto.fromEntity(s))
    );
  }
}
