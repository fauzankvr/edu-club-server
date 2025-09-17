export class NotesEntity {
    constructor(
        public readonly id: string,
        public readonly title: string | null,
        public readonly notes: string[] | null,
        public readonly studentId: string | null,
        public readonly courseId: string | null,
    ) { }
}