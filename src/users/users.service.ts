import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from "bcrypt";
import { SignInDto } from './dto/sign-in.dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {

  private EXPIRATION_TIME = '7 days';
  private ISSUER = 'Driven-pass';
  private AUDIENCE = 'users';

  constructor(private readonly repository: UsersRepository,
    private readonly jwtService: JwtService) { }

  async signup(body: CreateUserDto) {
    const { email, password } = body;
    const usedEmail = await this.checkEmail(email);
    if (usedEmail) throw new ConflictException('Unavailable email.');
    const hashPassword = this.cryptPassword(password);
    const user = await this.repository.signup({ email, password: hashPassword });
    delete user.password
    return user;
  }

  async signin(body: SignInDto) {
    const { email, password } = body;
    const user = await this.checkEmail(email);
    if (!user) throw new UnauthorizedException('email or password invalid');
    const valid = this.verifyPassword(password, user.password)
    if (!valid) throw new UnauthorizedException('email or password invalid');

    return this.generateToken(user)
  }

   verifyPassword(password: string, databasePassword: string) {
    return bcrypt.compareSync(password, databasePassword);
  }

  private async checkEmail(email: string) {
    return await this.repository.checkEmail(email);
  }
  private cryptPassword(password: string) {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  };

 async findOne(id: number) {
    const user = await this.repository.findOne(id);
    delete user.password;
    return user;
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }

  async findOneWithPassword(id: number) {
    const user = await this.repository.findOne(id);
    return user;
  }

  private async generateToken(user: User) {
    const { id, email } = user;

    const token = this.jwtService.sign({ email }, {
      expiresIn: this.EXPIRATION_TIME,
      issuer: this.ISSUER,
      audience: this.AUDIENCE,
      subject: String(id)
    });

    return { token }
  }
  checkToken(token: string) {
    return this.jwtService.verify(token,
      {
        secret: process.env.JWT_SECRET
      });
  }
}