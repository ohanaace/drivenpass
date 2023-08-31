import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) { }

  async signup(body: CreateUserDto) {
    const { email, password } = body;
    const usedEmail = await this.checkEmail(email);
    if (usedEmail) throw new ConflictException('Unavailable email.');
    const hashPassword = this.cryptPassword(password);
    const user = await this.repository.signup({ email, password: hashPassword });
    delete user.password
    return user;
  }
  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private async checkEmail(email: string) {
    return await this.repository.checkEmail(email);
  }
  private cryptPassword(password: string) {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  };
}