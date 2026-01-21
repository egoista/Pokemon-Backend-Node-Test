export class Pokemon {
    id: number;
    name: string;
    type: string;
    created_at: Date;

    constructor(id: number, name: string, type: string, created_at?: Date) {
        this.validateName(name);
        this.validateType(type);

        this.id = id;
        this.name = name;
        this.type = type;
        this.created_at = created_at || new Date();
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Name must not be empty.');
        }
    }

    private validateType(type: string): void {
        if (!type || type.trim().length === 0) {
            throw new Error('Type must not be empty.');
        }
    }
}
