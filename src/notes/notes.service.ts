import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
  
  async findAll(user: Partial<User>) {
    const { id } = user;
    return await this.repository.findAll(id)
  }
  
  async findOne(id: number, user: Partial<User>) {
    const userId = user.id;
    const note = await this.repository.findOne(id);
    if (!note) throw new NotFoundException();
    if (note.userId !== userId) throw new ForbiddenException();
    
    return note;
  }
  
  async remove(id: number, user: Partial<User>) {
    await this.findOne(id, user);
    return await this.repository.remove(id);
  }
  async removeAll(userId: number) {
    return await this.repository.removeAll(userId)
  }
  
  private async findByTitleAndUserId(title: string, id: number) {
    const conflictedNote = await this.repository.findByTitleAndUserId(title, id);
    if (conflictedNote) throw new ConflictException();
  }
}
