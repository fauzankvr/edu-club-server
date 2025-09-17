// domain/entities/ProgressEntity.ts

export class LectureProgressEntity {
  constructor(
    public readonly lectureId: string,
    public progress: string // e.g., "15", "50", "95"
  ) {}
}

export class SectionProgressEntity {
  constructor(
    public readonly sectionId: string,
    public lectures: LectureProgressEntity[],
    public completed: boolean = false // true if all lectures >= 95%
  ) {}
}

export class ProgressEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly courseId: string,
    public sections: SectionProgressEntity[],
    public completed: boolean = false, // true if all sections are completed
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
