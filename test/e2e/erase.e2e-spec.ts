import { DatabaseModule } from "../../src/database/database.module";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { CryptrService } from "../../src/cryptr/cryptr.service";
import { DatabaseService } from "../../src/database/database.service";
import { E2EUtils } from "../utils/e2e-utils";
import * as request from 'supertest';
import { faker } from "@faker-js/faker";
import { CredentialsFactory } from "../factories/credentials.factory";
import { TokenFactory } from "../factories/token-factory";
import { UserFactory } from "../factories/users-factory";
import { CardType } from "@prisma/client";
import { format } from "date-fns";
import { CardsFactory } from "../factories/cards-factory";
import { NotesFactory } from "../factories/notes-factory";
import { CreateEraseDto } from "../../src/erase/dto/create-erase.dto";
import * as bcrypt from "bcrypt";

describe('CredentialsController (e2e)', () => {
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

    it('DELETE /erase => should delete all data from user', async () => {
        const userPassword: string = faker.internet.password({
            length: 10,
            prefix: 'aZ1_'
        })
        const deletePassword = bcrypt.hashSync(userPassword, 10)
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(deletePassword)
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();


        await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
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


        await new NotesFactory(prisma)
            .withTitle(faker.lorem.word())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();

        await new NotesFactory(prisma)
            .withTitle(faker.lorem.sentence())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();


        const UserPassword: CreateEraseDto = new CreateEraseDto({
            password: userPassword
        });

        await request(app.getHttpServer())
            .delete('/erase')
            .set('Authorization', `Bearer ${token}`)
            .send(UserPassword)
            .expect(HttpStatus.OK)

        const credentials = await prisma.credential.findMany();
        expect(credentials).toHaveLength(0);

        const cards = await prisma.card.findMany();
        expect(cards).toHaveLength(0);

        const notes = await prisma.note.findMany()
        expect(notes).toHaveLength(0);

        const deletedUser = await prisma.user.findFirst({
            where: {
                id: user.id
            }
        });
        expect(deletedUser).toBe(null);
        
    });

    it('DELETE /erase => should return 401 if password is not correct', async () => {
        const userPassword: string = faker.internet.password({
            length: 10,
            prefix: 'aZ1_'
        })
        const deletePassword = bcrypt.hashSync(userPassword, 10)
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(deletePassword)
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();


        await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
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


        await new NotesFactory(prisma)
            .withTitle(faker.lorem.word())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();

        await new NotesFactory(prisma)
            .withTitle(faker.lorem.sentence())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();


        const UserPassword: CreateEraseDto = new CreateEraseDto({
            password: faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            })
        });

        await request(app.getHttpServer())
            .delete('/erase')
            .set('Authorization', `Bearer ${token}`)
            .send(UserPassword)
            .expect(HttpStatus.UNAUTHORIZED)


    });

    it('DELETE /erase => should return 400 if password is missing', async () => {
        const userPassword: string = faker.internet.password({
            length: 10,
            prefix: 'aZ1_'
        })
        const deletePassword = bcrypt.hashSync(userPassword, 10)
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(deletePassword)
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(user.email)
            .withUserId(user.id)
            .generate();


        await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
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


        await new NotesFactory(prisma)
            .withTitle(faker.lorem.word())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();

        await new NotesFactory(prisma)
            .withTitle(faker.lorem.sentence())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();


        const NoPassword = new CreateEraseDto()

        await request(app.getHttpServer())
            .delete('/erase')
            .set('Authorization', `Bearer ${token}`)
            .send(NoPassword)
            .expect(HttpStatus.BAD_REQUEST);
    });

});
