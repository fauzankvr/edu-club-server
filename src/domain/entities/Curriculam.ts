// Lecture Entity
export class LectureEntity {
  constructor(
    public id: string,
    public title: string,
    public videoPath?: string,
    public pdfPath?: string
  ) {
    if (!title || title.trim().length === 0) {
      throw new Error("Lecture title cannot be empty");
    }

    if (!videoPath && !pdfPath) {
      throw new Error("Lecture must have either a video or a PDF");
    }
  }
}

// Section Entity
export class SectionEntity {
  constructor(
    public id: string,
    public title: string,
    public lectures: LectureEntity[] = []
  ) {
    if (!title || title.trim().length === 0) {
      throw new Error("Section title cannot be empty");
    }
  }

//   addLecture(lecture: LectureEntity): void {
//     if (this.lectures.some((l) => l.id === lecture.id)) {
//       throw new Error("Lecture already exists in this section");
//     }
//     this.lectures.push(lecture);
//   }

//   removeLecture(lectureId: string): void {
//     this.lectures = this.lectures.filter((l) => l.id !== lectureId);
//   }
}

// Curriculum Entity
export class CurriculumEntity {
  constructor(
    public id: string,
    public courseId: string,
    public instructor: string,
    public sections: SectionEntity[] = [],
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

//   addSection(section: SectionEntity): void {
//     if (this.sections.some((s) => s.id === section.id)) {
//       throw new Error("Section already exists");
//     }
//     this.sections.push(section);
//   }

//   addLecture(sectionId: string, lecture: LectureEntity): void {
//     const section = this.sections.find((s) => s.id === sectionId);
//     if (!section) throw new Error("Section not found");
//     section.addLecture(lecture);
//   }

//   removeLecture(sectionId: string, lectureId: string): void {
//     const section = this.sections.find((s) => s.id === sectionId);
//     if (!section) throw new Error("Section not found");
//     section.removeLecture(lectureId);
//   }
}
