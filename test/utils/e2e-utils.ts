import { DatabaseService } from "../../src/database/database.service";

export class E2EUtils {
    static async cleanDB(prisma: DatabaseService) {
        await prisma.card.deleteMany({});
        await prisma.credential.deleteMany({});
        await prisma.note.deleteMany({});
        await prisma.session.deleteMany({});
        await prisma.user.deleteMany({});
    }
}