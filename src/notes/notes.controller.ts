import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { AuthGuard } from '../guards/auth-guard';
import { UserInfo } from '../decorators/auth-decorator';
import { User} from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@Controller('notes')
@ApiTags('notes')
@ApiBearerAuth()
@ApiHeader({name: 'Authorization', description: 'header to pass the user JWT token generated in /users/sign-in'})
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({summary: 'register a new personal note'})
  @ApiResponse({status: HttpStatus.CREATED, description: 'new note registered successfully'})
  @ApiResponse({status: HttpStatus.CONFLICT, description: 'note with the informed title is already in use by user'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})

  create(@Body() createNoteDto: CreateNoteDto, @UserInfo() user: Partial<User> ) {
    return this.notesService.create(createNoteDto, user);
  }

  @Get()
  @ApiOperation({summary: 'shows all notes that belong to user'})
  @ApiResponse({status: HttpStatus.OK, description: 'a list of all notes registered by user'})
  
  findAll(@UserInfo() user: Partial<User>) {
    return this.notesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({summary: 'shows a specific note that belongs to user'})
  @ApiParam({name: 'id', example: '1', description: 'id that note a credential'})
  @ApiResponse({status: HttpStatus.OK, description: 'shows note content'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'note does not exist'})
  
  findOne(@Param('id') id: string, @UserInfo() user: Partial<User>) {
    return this.notesService.findOne(+id, user);
  }

  @Delete(':id')
  @ApiOperation({summary: 'deletes a specific note that belongs to user'})
  @ApiParam({name: 'id', example: '1', description: 'id that identifies a note'})
  @ApiResponse({status: HttpStatus.OK, description: 'deleted credential content'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'note does not exist'})

  remove(@Param('id') id: string, @UserInfo() user: Partial<User>) {
    return this.notesService.remove(+id, user);
  }
}
