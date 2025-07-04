import { IProgress } from "../../infrastructure/database/models/ProgressModel"; 

export interface IProgressRepo {
    findByStudentAndCourse(studentId: string, courseId: string): Promise<IProgress | null>;
    createOrUpdateProgress(
        studentId: string,
        courseId: string,
        sectionId: string,
        lectureId: string,
        progress: string
    ): Promise<IProgress>;
    findAllByStudent(studentId: string): Promise<IProgress[]>;
}