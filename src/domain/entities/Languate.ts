export class LanguageEntity {
    constructor(
        public name: string,
        public isBlocked: boolean,
        public readonly id?: string,
    ) {}
}