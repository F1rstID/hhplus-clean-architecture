export class Lecture {
  constructor(
    public readonly id: number,
    public speakerId: number,
    public title: string,
    public description: string,
    public date: Date,
    public registeredCount: number,
    public capacity: number = 30,
  ) {}

  isAvailable(): boolean {
    return this.registeredCount < this.capacity;
  }
}
