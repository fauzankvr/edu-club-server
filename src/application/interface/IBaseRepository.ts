
export interface IBaseRepo<Entity> {
  findAll(): Promise<Entity[]>;
  findById(id: string): Promise<Entity | null>;
  create(data: Partial<Entity>): Promise<Entity>;
  updateById(id: string, data: Partial<Entity>): Promise<Entity | null>;
  deleteById(id: string): Promise<void>;
}
