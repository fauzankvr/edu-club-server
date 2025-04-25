
export class Course {
  constructor(
    public title: string,
    public description: string,
    public language: string,
    public category: string,
    public courseImageId: string,
    public points: string[],
    public price: number,
    public discount: string | null = null,
    public students: string[] = [],
    public instructor:string
  ) {}

  hasDiscount(): boolean {
    return !!this.discount;
  }

  addStudent(studentId: string): void {
    if (!this.students.includes(studentId)) {
      this.students.push(studentId);
    }
  }

  isValid(): boolean {
    return (
      this.title.trim() !== "" &&
      this.description.trim() !== "" &&
      this.points.length > 0 &&
      this.price > 0
    );
  }
}
