import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: DatabaseService) {}
  
  signup(data: CreateUserDto) {
    return this.prisma.user.create({
      data
    });
  };
  
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
  
  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  checkEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email
      }
    });
  }
}
