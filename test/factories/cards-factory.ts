import { CardType } from "@prisma/client";
import { DatabaseService } from "../../src/database/database.service";
import { CryptrService } from "../../src/cryptr/cryptr.service";


export class CardsFactory {
    private label: string;
    private cardOwner: string;
    private cardNumber: string;
    private cvc: string;
    private expirationDate: string;
    private password: string;
    private virtual: boolean;
    private CardType: CardType

    private userId: number;

    constructor(
        private readonly prisma: DatabaseService,
        private readonly cryptr: CryptrService) { }

    withLabel(label: string) {
        this.label = label;
        return this;
    };

    withCardOwner(cardOwner: string) {
        this.cardOwner = cardOwner;
        return this;
    };

    withUserId(userId: number) {
        this.userId = userId;
        return this;
    };
    withCVC(cvc: string) {
        this.cvc = this.cryptr.encryptData(cvc);
        return this;
    }

    withCardNumber(cardNumber: string) {
        this.cardNumber = cardNumber;
        return this;
    }

    withExpirationDate(expirationDate: string) {
        this.expirationDate = expirationDate;
        return this;
    }

    withPassword(password: string) {
        this.password = this.cryptr.encryptData(password);
        return this;
    }

    withVirtual(virtual: boolean) {
        this.virtual = virtual;
        return this;
    };

    withCardType(CardType: CardType) {
        this.CardType = CardType;
        return this;
    }

    build() {
        return {
            label: this.label,
            cardOwner: this.cardOwner,
            cardNumber: this.cardNumber,
            cvc: this.cvc,
            expirationDate: this.expirationDate,
            password: this.password,
            virtual: this.virtual,
            CardType: this.CardType,
            userId: this.userId
        };
    };

    async persist() {
        const card = this.build();
        return await this.prisma.card.create({
            data: card
        });
    };
}