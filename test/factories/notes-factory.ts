import { DatabaseService } from "../../src/database/database.service";

export class NotesFactory {
    private title: string;
    private text: string;
    private userId: number;

    constructor(private readonly prisma: DatabaseService) { }

    withTitle(title: string) {
        this.title = title;
        return this;
    };

    withText(text: string) {
        this.text = text;
        return this;
    };

    withUserId(userId: number) {
        this.userId = userId;
        return this;
    }

    build() {
        return {
            title: this.title,
            text: this.text,
            userId: this.userId
        };
    };

    async persist() {
        const note = this.build();
        return await this.prisma.note.create({
            data: note
        });
    };
};