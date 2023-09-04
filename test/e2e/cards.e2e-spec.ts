import { DatabaseModule } from "../../src/database/database.module"
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { DatabaseService } from "../../src/database/database.service";
import { E2EUtils } from "../utils/e2e-utils";
import Cryptr from "cryptr";
import { CryptrService } from "../../src/cryptr/cryptr.service";
import { CreateCardDto } from "../../src/cards/dto/create-card.dto";
import { faker } from "@faker-js/faker";
import { TokenFactory } from "../factories/token-factory";
import { UserFactory } from "../factories/users-factory";
import * as request from 'supertest';
import { format } from "date-fns";
import { CardsFactory } from "../factories/cards-factory";
import { CardType } from "@prisma/client";


describe('CardsController (e2e)', () => {
    let app: INestApplication;
    let prisma: DatabaseService;
    let jwt: JwtService;
    let cryptr: CryptrService

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get(DatabaseService)
        jwt = app.get(JwtService)
        cryptr = app.get(CryptrService)
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        await E2EUtils.cleanDB(prisma);
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it('POST /cards => should create a new card', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();

        const card: CreateCardDto = new CreateCardDto({
            label: faker.lorem.word(),
            cardNumber: faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString(),
            cardOwner: faker.person.fullName(),
            virtual: faker.datatype.boolean(),
            password: faker.number.int().toString(),
            expirationDate: format(faker.date.future(), 'yyyy-MM-dd'),
            cvc: faker.number.int({ min: 100, max: 999 }).toString(),
            CardType: 'CREDIT'
        });

        await request(app.getHttpServer())
            .post('/cards')
            .set('Authorization', `Bearer ${token}`)
            .send(card)
            .expect(HttpStatus.CREATED)

        const cards = await prisma.card.findMany()

        expect(cards[0]).toEqual({
            id: expect.any(Number),
            label: card.label,
            cardNumber: card.cardNumber,
            cardOwner: card.cardOwner,
            virtual: card.virtual,
            password: expect.any(String),
            expirationDate: card.expirationDate,
            cvc: expect.any(String),
            CardType: card.CardType,
            userId: user.id,
            createdAt: expect.any(Date)
        });
    });

    it('POST /cards => should return 400 if data is missing', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();



        const card = new CreateCardDto()

        await request(app.getHttpServer())
            .post('/cards')
            .set('Authorization', `Bearer ${token}`)
            .send(card)
            .expect(HttpStatus.BAD_REQUEST)
    })

    it('POST /cards => should return 409 if user already has a card with label', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();


        const savedCard = await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();

        const conflictedCard: CreateCardDto = new CreateCardDto({
            label: savedCard.label,
            cardNumber: faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString(),
            cardOwner: faker.person.fullName(),
            virtual: faker.datatype.boolean(),
            password: faker.number.int().toString(),
            expirationDate: format(faker.date.future(), 'yyyy-MM-dd'),
            cvc: faker.number.int({ min: 100, max: 999 }).toString(),
            CardType: 'CREDIT'
        });

        await request(app.getHttpServer())
            .post('/cards')
            .set('Authorization', `Bearer ${token}`)
            .send(conflictedCard)
            .expect(HttpStatus.CONFLICT)
    });

    it('POST /cards => should return 403 if no valid token is provided',async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = faker.lorem.sentence()

        const card: CreateCardDto = new CreateCardDto({
            label: faker.lorem.word(),
            cardNumber: faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString(),
            cardOwner: faker.person.fullName(),
            virtual: faker.datatype.boolean(),
            password: faker.number.int().toString(),
            expirationDate: format(faker.date.future(), 'yyyy-MM-dd'),
            cvc: faker.number.int({ min: 100, max: 999 }).toString(),
            CardType: 'CREDIT'
        });

        await request(app.getHttpServer())
            .post('/cards')
            .set('Authorization', `Bearer ${token}`)
            .send(card)
            .expect(HttpStatus.FORBIDDEN)
    })

    it('GET /cards => should return all cards from user', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();

        const card1 = await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();

        await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();

        const response = await request(app.getHttpServer())
            .get('/cards')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)

        const { body } = response;

        expect(body).toHaveLength(2);

        console.log(response.body)


        expect(response.body[0]).toHaveProperty('id');
    });

    it('GET /cards => should return an empty array if user has no cards', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();

        await request(app.getHttpServer())
            .get('/cards')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)
            .expect([])
    });

    it('GET /cards => should return 403 if no valid token is provided', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = faker.lorem.sentence();

        await request(app.getHttpServer())
            .get('/cards')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN)
    });

    it('GET /cards/:id => should return a card that belongs to user', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();

        const card1 = await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();

        const response = await request(app.getHttpServer())
            .get(`/cards/${card1.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)

        expect(response.body).toEqual({
            id: card1.id,
            label: card1.label,
            cardNumber: card1.cardNumber,
            cardOwner: card1.cardOwner,
            virtual: card1.virtual,
            password: cryptr.decryptData(card1.password),
            expirationDate: card1.expirationDate,
            cvc: cryptr.decryptData(card1.cvc),
            userId: card1.userId,
            CardType: card1.CardType,
            createdAt: card1.createdAt.toISOString()
        });
    });

    it('GET /cards/:id => should return 404 if card does not exist', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();

        await request(app.getHttpServer())
            .get('/cards/1')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND)
    });

    it('GET /cards/:id => should return 403 if card does not belong to user', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const userWithoutCard = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(userWithoutCard.email)
            .withUserId(userWithoutCard.id)
            .generate();

        const card1 = await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();

        await request(app.getHttpServer())
            .get(`/cards/${card1.id}`)
            .set('Authorization', `Beare ${token}`)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('GET /cards/:id => should return 403 if no valid token is provided', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = faker.lorem.sentence();

        const card1 = await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();


        await request(app.getHttpServer())
            .get(`/cards/${card1.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN)
    });

    it('DELETE /cards/:id => should delete a card that belongs to user', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();

        const card1 = await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();

        await request(app.getHttpServer())
            .delete(`/cards/${card1.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK);

        const deletedCard = await prisma.card.findFirst({
            where: {
                id: card1.id
            }
        })
        expect(deletedCard).toBe(null)
    });

    it('DELETE /cards/:id => should return 404 if card does not exist', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();

        await request(app.getHttpServer())
            .delete('/cards/1')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND)
    });

    it('DELETE /cards/:id => should return 403 if card does not belong to user', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const userWithoutCard = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(userWithoutCard.email)
            .withUserId(userWithoutCard.id)
            .generate();

        const card1 = await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();

        await request(app.getHttpServer())
            .delete(`/cards/${card1.id}`)
            .set('Authorization', `Beare ${token}`)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /cards/:id => should return 403 if no valid token is provided', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = faker.lorem.sentence();

        const card1 = await new CardsFactory(prisma, cryptr)
            .withCVC(faker.number.int({ min: 100, max: 999 }).toString())
            .withCardNumber(faker.number.bigInt({ min: 1000000000000000, max: 9999999999999999n }).toString())
            .withCardOwner(faker.person.fullName())
            .withCardType(CardType.HYBRID)
            .withExpirationDate(format(faker.date.future(), 'yyyy-MM-dd'))
            .withLabel(faker.lorem.word())
            .withPassword(faker.number.int().toString())
            .withVirtual(faker.datatype.boolean())
            .withUserId(user.id)

            .persist();


        await request(app.getHttpServer())
            .delete(`/cards/${card1.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN)
    });
});