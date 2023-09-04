import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CardsRepository {
  
  
  constructor(private readonly prisma: DatabaseService) {}
  
  create(createCardDto: CreateCardDto, userId: number) {
    return this.prisma.card.create({
      data: {
        ...createCardDto, userId
      }
    })
  }
  
  findAll(userId: number) {
    return this.prisma.card.findMany({
      where: {
        userId
      }
    });
  }
  
  findOne(id: number) {
    return this.prisma.card.findFirst({
      where: {
        id
      }
    });
  }
  
  remove(id: number) {
    return this.prisma.card.delete({
      where: {
        id
      }
    });
  }
  
  removeAll(userId: number) {
    return this.prisma.card.deleteMany({
      where: {
        userId
      }
    });
  }
  
  findByLabelAndUserId(label: string, userId: number) {
    return this.prisma.card.findUnique({
      where: {
        userId_label: {
          userId,
          label
        }
      }
    });
  }
}
