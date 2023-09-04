import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { DatabaseService } from "../../src/database/database.service";
import { DatabaseModule } from "../../src/database/database.module";
import { E2EUtils } from "../utils/e2e-utils";
import { faker } from "@faker-js/faker";
import { UserFactory } from "../factories/users-factory";
import { TokenFactory } from "../factories/token-factory";
import { JwtService } from "@nestjs/jwt";
import { CreateNoteDto } from "../../src/notes/dto/create-note.dto";
import * as request from 'supertest';
import { NotesFactory } from "../factories/notes-factory";

describe('NotesController (e2e)', () => {
    let app: INestApplication;
    let prisma: DatabaseService;
    let jwt: JwtService

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get(DatabaseService)
        jwt = app.get(JwtService)
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        await E2EUtils.cleanDB(prisma);
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it('POST /notes => should create a new note', async () => {
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

        const noteDto: CreateNoteDto = {
            title: faker.lorem.sentence(),
            text: faker.lorem.text()
        };

        await request(app.getHttpServer())
            .post('/notes')
            .set("Authorization", `Bearer ${token}`)
            .send(noteDto)
            .expect(HttpStatus.CREATED);

        const notes = await prisma.note.findMany();

        expect(notes).toHaveLength(1);
        expect(notes[0]).toEqual({
            id: expect.any(Number),
            title: noteDto.title,
            text: noteDto.text,
            userId: user.id,
            createdAt: expect.any(Date)
        });
    });

    it('POST /notes => should respond with 400 if data is missing', async () => {
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

        const noteDto = new CreateNoteDto()

        await request(app.getHttpServer())
            .post('/notes')
            .set("Authorization", `Bearer ${token}`)
            .send(noteDto)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /notes => should respond with 403 if no valid token is provided', async () => {
        const token = faker.lorem.sentence()

        const noteDto: CreateNoteDto = {
            title: faker.lorem.sentence(),
            text: faker.lorem.text()
        };

        await request(app.getHttpServer())
            .post('/notes')
            .set("Authorization", `Bearer ${token}`)
            .send(noteDto)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('POST /notes => should respond with 409 if user tries to post multiple notes with same title', async () => {
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

        const savedNote = await new NotesFactory(prisma)
            .withTitle(faker.lorem.word())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();

        const conflictedNote: CreateNoteDto = {
            title: savedNote.title,
            text: faker.lorem.paragraph()
        };

        await request(app.getHttpServer())
            .post('/notes')
            .set("Authorization", `Bearer ${token}`)
            .send(conflictedNote)
            .expect(HttpStatus.CONFLICT);
    });

    it('GET /notes => should return all notes from user', async () => {
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

        const response = await request(app.getHttpServer())
            .get('/notes')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK);

        const { body } = response;
        expect(body).toHaveLength(2);
        console.log(body[0])
        expect(body[0]).toEqual({
            id: expect.any(Number),
            title: expect.any(String),
            text: expect.any(String),
            userId: user.id,
            createdAt: expect.any(String)
        });
    });

    it('GET /notes => should return an empty array if user does not have notes', async () => {
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
            .get('/notes')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)
            .expect([])
    });

    it('GET /notes => should respond with 403 if user has no valid token', async () => {
        const token = faker.lorem.word()

        await request(app.getHttpServer())
            .get('/notes')
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('GET /notes/:id => should return a note that belongs to user', async () => {
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

        const note = await new NotesFactory(prisma)
            .withTitle(faker.lorem.word())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();

        await request(app.getHttpServer())
            .get(`/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)
            .expect({
                id: note.id,
                title: note.title,
                text: note.text,
                userId: note.userId,
                createdAt: note.createdAt.toISOString()
            });
    });

    it('GET /notes/:id => should return 403 if note does not belong to user', async () => {
        const user = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const note = await new NotesFactory(prisma)
            .withTitle(faker.lorem.word())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();

        const userWithoutNote = await new UserFactory(prisma)
            .withEmail(faker.internet.email())
            .withPassword(faker.internet.password({
                length: 10,
                prefix: 'aZ1_'
            }))
            .persist();

        const token = new TokenFactory(jwt)
            .withEmail(userWithoutNote.email)
            .withUserId(userWithoutNote.id)
            .generate();

        await request(app.getHttpServer())
            .get(`/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN);

    });

    it('GET /notes/:id => should return 404 if note does not exist', async () => {
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
            .get(`/notes/1`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND)
    });

    it('GET /notes/:id => should return 403 if no valid token is given',async () => {
        const user = await new UserFactory(prisma)
        .withEmail(faker.internet.email())
        .withPassword(faker.internet.password({
            length: 10,
            prefix: 'aZ1_'
        }))
        .persist();

    const token = faker.lorem.sentence()

        const note = await new NotesFactory(prisma)
        .withTitle(faker.lorem.word())
        .withText(faker.lorem.word())
        .withUserId(user.id)
        .persist();

    await request(app.getHttpServer())
        .get(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN) 
    });

    it('DELETE /notes/:id => should delete a note that belongs to user', async () => {
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

        const note = await new NotesFactory(prisma)
            .withTitle(faker.lorem.word())
            .withText(faker.lorem.word())
            .withUserId(user.id)
            .persist();

        await request(app.getHttpServer())
            .delete(`/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.OK)

        const deletedNote = await prisma.note.findFirst({
            where: {
                id: note.id
            }
        })

        expect(deletedNote).toBe(null)
    });

    it('DELETE /notes/:id => should return 404 if note does not exist', async () => {
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
            .delete(`/notes/1`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND)
    });

    it('DELETE /notes/:id => should return 403 if note does not belong to user',async () => {
        const user = await new UserFactory(prisma)
        .withEmail(faker.internet.email())
        .withPassword(faker.internet.password({
            length: 10,
            prefix: 'aZ1_'
        }))
        .persist();

        const userWithoutNote = await new UserFactory(prisma)
        .withEmail(faker.internet.email())
        .withPassword(faker.internet.password({
            length: 10,
            prefix: 'aZ1_'
        }))
        .persist();


    const token = new TokenFactory(jwt)
        .withEmail(userWithoutNote.email)
        .withUserId(userWithoutNote.id)
        .generate();

        const note = await new NotesFactory(prisma)
        .withTitle(faker.lorem.word())
        .withText(faker.lorem.word())
        .withUserId(user.id)
        .persist();

    await request(app.getHttpServer())
        .delete(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN)
    });

    it('DELETE /notes/:id => should return 403 if no valid token is given',async () => {
        const user = await new UserFactory(prisma)
        .withEmail(faker.internet.email())
        .withPassword(faker.internet.password({
            length: 10,
            prefix: 'aZ1_'
        }))
        .persist();

    const token = faker.lorem.sentence()

        const note = await new NotesFactory(prisma)
        .withTitle(faker.lorem.word())
        .withText(faker.lorem.word())
        .withUserId(user.id)
        .persist();

    await request(app.getHttpServer())
        .delete(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN) 
    });
});