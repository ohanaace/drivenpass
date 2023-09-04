import { CryptrService } from "../../src/cryptr/cryptr.service";
import { DatabaseService } from "../../src/database/database.service";

export class CredentialsFactory {
    private label: string;
    private link: string;
    private username: string;
    private password: string;
    private userId: number;

    constructor(
        private readonly cryptr: CryptrService,
        private readonly prisma: DatabaseService) { }

    withLabel(label: string) {
        this.label = label;
        return this;
    };

    withLink(link: string) {
        this.link = link;
        return this;
    };
    withUsername(username: string) {
        this.username = username;
        return this;
    };

    withUserId(userId: number) {
        this.userId = userId;
        return this;
    }

    withPassword(password: string) {
        this.password = this.cryptr.encryptData(password);
        return this;
    }

    build() {
        return {
            label: this.label,
            link: this.link,
            userId: this.userId,
            username: this.username,
            password: this.password
        };
    };

    async persist() {
        const credential = this.build();
        return await this.prisma.credential.create({
            data: credential
        });
    };
}