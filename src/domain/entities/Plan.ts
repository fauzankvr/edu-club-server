export class FeatureEntity {
  constructor(
    public readonly description: string,
    public readonly icon: string,
    public readonly isAvailable: boolean = true
  ) {}
}

export class PlanEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public billingPeriod: "forever" | "year" | "month",
    public features: FeatureEntity[],
    public isFeatured: boolean,
    public isBlocked: boolean,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
