import { DatabaseModule } from "../../src/database/database.module";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { CryptrService } from "../../src/cryptr/cryptr.service";
import { DatabaseService } from "../../src/database/database.service";
import { E2EUtils } from "../utils/e2e-utils";
import { faker } from "@faker-js/faker";
import { TokenFactory } from "../factories/token-factory";
import { UserFactory } from "../factories/users-factory";
import { CreateCredentialDto } from "../../src/credentials/dto/create-credential.dto";
import * as request from 'supertest';
import { CredentialsFactory } from "../factories/credentials.factory";

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

    it('POST /credentials => should create a new credential', async () => {
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

        const credential: CreateCredentialDto = new CreateCredentialDto({
            label: faker.lorem.word(),
            password: faker.lorem.words(),
            link: faker.internet.url(),
            username: faker.internet.userName()
        });

        await request(app.getHttpServer())
            .post('/credentials')
            .set('Authorization', `Bearer ${token}`)
            .send(credential)
            .expect(HttpStatus.CREATED)

        const credentials = await prisma.credential.findMany();

        expect(credentials).toHaveLength(1);
        expect(credentials[0]).toEqual({
            id: expect.any(Number),
            label: credential.label,
            link: credential.link,
            username: credential.username,
            password: expect.any(String),
            userId: user.id,
            createdAt: expect.any(Date)
        });
    });

    it('POST /credentials => should return 409 if user has a credential with that label', async () => {
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


        const savedCredential = await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        const conflictedCredential: CreateCredentialDto = new CreateCredentialDto({
            label: savedCredential.label,
            password: faker.lorem.words(),
            link: faker.internet.url(),
            username: faker.internet.userName()
        });

        await request(app.getHttpServer())
            .post('/credentials')
            .set('Authorization', `Bearer ${token}`)
            .send(conflictedCredential)
            .expect(HttpStatus.CONFLICT)
    });

    it('POST /credentials => should return 400 if data is missing', async () => {
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

        const credential = new CreateCredentialDto();

        await request(app.getHttpServer())
            .post('/credentials')
            .set('Authorization', `Bearer ${token}`)
            .send(credential)
            .expect(HttpStatus.BAD_REQUEST)
    });

    it('POST /credentials => should return 403 if no valid token is provided', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = faker.lorem.sentence()

        const credential: CreateCredentialDto = new CreateCredentialDto({
            label: faker.lorem.word(),
            password: faker.lorem.words(),
            link: faker.internet.url(),
            username: faker.internet.userName()
        });

        await request(app.getHttpServer())
            .post('/credentials')
            .set('Authorization', `Bearer ${token}`)
            .send(credential)
            .expect(HttpStatus.FORBIDDEN)
    });

    it('GET /credentials => should return all credentials from user', async () => {
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

        const response = await request(app.getHttpServer())
            .get('/credentials')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)

        const { body } = response;
        expect(body).toHaveLength(2)
        expect(body[0]).toHaveProperty('id')
    });

    it('GET /credentials => should return an empty array if user has no credentials', async () => {
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
            .get('/credentials')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)
            .expect([])
    });

    it('GET /credentials => should return 403 if no valid token is provided', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = faker.lorem.sentence();


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

        await request(app.getHttpServer())
            .get('/credentials')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN)

    });

    it('GET /credentials/:id => should return a credential that belongs to user', async () => {
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


        const credential = await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        const response = await request(app.getHttpServer())
            .get(`/credentials/${credential.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)

        expect(response.body).toEqual({
            id: credential.id,
            label: credential.label,
            link: credential.link,
            userId: user.id,
            username: credential.username,
            password: cryptr.decryptData(credential.password),
            createdAt: credential.createdAt.toISOString()
        })
    });

    it('GET /credentials/:id => should return 404 if credential does not exist', async () => {
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
            .get(`/credentials/1`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND)
    });

    it('GET /credentials/:id => should return 403 if credential does not belong to user', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const userWithoutCredential = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(userWithoutCredential.email)
            .withUserId(userWithoutCredential.id)
            .generate();


        const credential = await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        await request(app.getHttpServer())
            .get(`/credentials/${credential.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN)

    });

    it('GET /credentials/:id => should return 403 if no valid token is provided', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = faker.lorem.sentence();


        const credential = await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        await request(app.getHttpServer())
            .get(`/credentials/${credential.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN)
    });

    it('DELETE /credentials/:id => should return a credential that belongs to user', async () => {
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


        const credential = await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        const response = await request(app.getHttpServer())
            .delete(`/credentials/${credential.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)

        const deletedCredential = await prisma.credential.findFirst({
            where: {
                id: credential.id
            }
        });

        expect(deletedCredential).toBe(null);
    });

    it('DELETE /credentials/:id => should return 404 if credential does not exist', async () => {
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
            .delete(`/credentials/1`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND)
    });

    it('DELETE /credentials/:id => should return 403 if credential does not belong to user', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const userWithoutCredential = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(userWithoutCredential.email)
            .withUserId(userWithoutCredential.id)
            .generate();


        const credential = await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        await request(app.getHttpServer())
            .delete(`/credentials/${credential.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN)

    });

    it('DELETE /credentials/:id => should return 403 if no valid token is provided', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = faker.lorem.sentence();


        const credential = await new CredentialsFactory(cryptr, prisma)
            .withLabel(faker.lorem.word())
            .withLink(faker.internet.url())
            .withPassword(faker.internet.password())
            .withUsername(faker.internet.userName())
            .withUserId(user.id)
            .persist();

        await request(app.getHttpServer())
            .delete(`/credentials/${credential.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN)
    });
});