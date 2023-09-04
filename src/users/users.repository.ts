import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: DatabaseService) { }

  signup(data: CreateUserDto) {
    return this.prisma.user.create({
      data
    });
  };

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: {
        id
      }
    });
  }
  checkEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email
      }
    });
  }
}
