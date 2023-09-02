import { ConflictException, Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { User } from '@prisma/client';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {

  constructor(private readonly repository: NotesRepository) { }

  async create(createNoteDto: CreateNoteDto, user: Partial<User>) {
    const { title } = createNoteDto;
    const { id } = user;

    await this.findByTitleAndUserId(title, id);

    return await this.repository.create(createNoteDto, id);
  }
  private async findByTitleAndUserId(title: string, id: number) {
    const conflictedNote = await this.repository.findByTitleAndUserId(title, id);
    if (conflictedNote) throw new ConflictException();
  }

 async findAll(user: Partial<User>) {
    const { id } = user;
    return await this.repository.findAll(id)
  }

  findOne(id: number) {
    return `This action returns a #${id} note`;
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }
}
