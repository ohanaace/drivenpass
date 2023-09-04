import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CredentialsRepository {

  constructor(private readonly prisma: DatabaseService) { }

  create(createCredentialDto: CreateCredentialDto, userId: number) {
    const data = { ...createCredentialDto, userId }
    return this.prisma.credential.create({
      data
    });
  };

  findAll(userId: number) {
    return this.prisma.credential.findMany({
      where: {
        userId
      }
    });
  }

  findOne(id: number) {
    return this.prisma.credential.findFirst({
      where: {
        id
      }
    })
  }

  remove(id: number) {
    return this.prisma.credential.delete({
      where: {
        id
      }
    });
  }

  findByLabelAndUserId(label: string, userId: number) {
    return this.prisma.credential.findUnique({
      where: {
        label_userId: {
          label,
          userId
        }
      }
    })
  }
}
