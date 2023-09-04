import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotesRepository {

  constructor(private readonly prisma: DatabaseService) { }

  create(createNoteDto: CreateNoteDto, userId: number) {
    const data = { ...createNoteDto, userId }
    return this.prisma.note.create({
      data
    });
  };

  findAll(userId: number) {
    return this.prisma.note.findMany({
      where: {
        userId
      }
    });
  }

  findOne(id: number) {
    return this.prisma.note.findUnique({
      where: {
        id
      }
    });
  }

  remove(id: number) {
    return this.prisma.note.delete({
      where: {
        id
      }
    });
  };

  findByTitleAndUserId(title: string, userId: number) {
    return this.prisma.note.findUnique({
      where: {
        title_userId: {
          title,
          userId
        }
      }
    });
  };

}
