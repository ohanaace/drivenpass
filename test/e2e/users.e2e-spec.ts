import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import { DatabaseModule } from '../../src/database/database.module';
import { E2EUtils } from '../utils/e2e-utils';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UserFactory } from '../factories/users-factory';
import * as request from 'supertest';
import { faker } from "@faker-js/faker";
import { SignInDto } from '../../src/users/dto/sign-in.dto';

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

  it('POST /sign-up => should create a new user', async () => {
    const userDTO: CreateUserDto = new CreateUserDto({
      email: faker.internet.email(),
      password: faker.internet.password({
        length: 10,
        prefix: 'aZ1_'
      })
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

  it('POST /sign-up => should respond with 400 if data is missing', async () => {
    const userDTO = new CreateUserDto();

    const response = await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(userDTO)

    const { status } = response;
    expect(status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('POST /sign-up => should respond with 409 if email is already in use', async () => {
    const signedUpUser = await new UserFactory(prisma)
      .withEmail(faker.internet.email())
      .withPassword(faker.internet.password({
        length: 10,
        prefix: 'aZ1_'
      }))
      .persist();

    const userDTO: CreateUserDto = new CreateUserDto({
      email: signedUpUser.email,
      password: faker.internet.password({
        length: 10,
        prefix: 'aZ1_'
      })
    });

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(userDTO)
      .expect(HttpStatus.CONFLICT);
  });

  it('POST /sign-in => should generate a new token', async () => {
    const userDTO: CreateUserDto = new CreateUserDto({
      email: faker.internet.email(),
      password: faker.internet.password({
        length: 10,
        prefix: 'aZ1_'
      })
    });

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(userDTO)

    const signInUser: SignInDto = {
      email: userDTO.email,
      password: userDTO.password
    };

    const response = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send(signInUser)
      .expect(HttpStatus.OK)

    const { body } = response;

    expect(body).toEqual({
      token: expect.any(String)
    });
  });

  it('POST /sign-in => should respond with 401 if user is not in DB', async () => {
    const signInUser: SignInDto = {
      email: faker.internet.email(),
      password: faker.internet.password({
        length: 10,
        prefix: 'aZ1_'
      })
    };

    await request(app.getHttpServer())
      .post('/users/sign-in')
      .send(signInUser)
      .expect(HttpStatus.UNAUTHORIZED)
  });

  it('POST /sign-in => should respond with 401 if password is incorrect', async () => {
    const userDTO: CreateUserDto = new CreateUserDto({
      email: faker.internet.email(),
      password: faker.internet.password({
        length: 10,
        prefix: 'aZ1_'
      })
    });

    await request(app.getHttpServer())
      .post('/users/sign-up')
      .send(userDTO)

    const signInUser: SignInDto = {
      email: userDTO.email,
      password: faker.internet.password({
        length: 10,
        prefix: 'aZ1_'
      })
    };
    await request(app.getHttpServer())
    .post('/users/sign-in')
    .send(signInUser)
    .expect(HttpStatus.UNAUTHORIZED)
  });
});
