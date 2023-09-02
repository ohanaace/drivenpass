import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { AuthGuard } from '../guards/auth-guard';
import { UserInfo } from '../decorators/auth-decorator';
import { User} from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto, @UserInfo() user: Partial<User> ) {
    return this.notesService.create(createNoteDto, user);
  }

  @Get()
  findAll(@UserInfo() user: Partial<User>) {
    return this.notesService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(+id);
  }
}
