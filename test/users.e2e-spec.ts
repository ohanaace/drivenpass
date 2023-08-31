import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DatabaseService } from './../src/database/database.service';
import { DatabaseModule } from '../src/database/database.module';
import { E2EUtils } from './utils/e2e-utils';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UserFactory } from './factories/users-factory';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: DatabaseService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(DatabaseService)
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await E2EUtils.cleanDB(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('should create a new user', async () => {
    const userDTO: CreateUserDto = new CreateUserDto({
      email: 'umemaildeteste@emailteste.com',
      password: 'um4_s3Nh5--b@m-f0rt3!'
    });

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(userDTO)
      .expect(HttpStatus.CREATED);

    const users = await prisma.user.findMany();
    expect(users).toHaveLength(1);
    const user = users[0];

    expect(user).toEqual({
      id: expect.any(Number),
      email: userDTO.email,
      password: expect.any(String),
      createdAt: expect.any(Date)
    })
  })

  it('should respond with status 400 if data is missing', async () => {
    const userDTO = new CreateUserDto();

    const response = await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(userDTO)

    const { status } = response;
    expect(status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should respond with status 409 if email is already in use', async () => {
    const signedUpUser = await new UserFactory(prisma)
      .withEmail('umemaildeteste@emailteste.com')
      .withPassword('um4_s3Nh5--b@m-f0rt3!')
      .persist();

    const userDTO: CreateUserDto = new CreateUserDto({
      email: signedUpUser.email,
      password: 'um4_s3Nh5--p0ko-f0rt3!'
    });

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(userDTO)
      .expect(HttpStatus.CONFLICT);
  });
});
