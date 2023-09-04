import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from '../guards/auth-guard';
import { User } from '@prisma/client';
import { UserInfo } from '../decorators/auth-decorator';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@Controller('cards')
@ApiTags('cards')
@ApiBearerAuth()
@ApiHeader({name: 'Authorization', description: 'header to pass the user JWT token generated in /users/sign-in'})
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({summary: 'register a new card info'})
  @ApiResponse({status: HttpStatus.CREATED, description: 'new card registered successfully'})
  @ApiResponse({status: HttpStatus.CONFLICT, description: 'card with the informed label is already in use by user'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})

  create(@Body() createCardDto: CreateCardDto, @UserInfo() user: Partial<User>) {
    return this.cardsService.create(createCardDto, user);
  }

  @Get()
  @ApiOperation({summary: 'shows all cards that belong to user'})
  @ApiResponse({status: HttpStatus.OK, description: 'a list of all cards registered by user'})
  
  findAll(@UserInfo() user: Partial<User>) {
    return this.cardsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({summary: 'shows a specific card that belongs to user'})
  @ApiParam({name: 'id', example: '1', description: 'id that identifies a card'})
  @ApiResponse({status: HttpStatus.OK, description: 'shows card info'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'card does not exist'})
 
  findOne(@Param('id') id: string, @UserInfo() user: Partial<User>) {
    return this.cardsService.findOne(+id, user);
  }

  @Delete(':id')
  @ApiOperation({summary: 'deletes a specific card that belongs to user'})
  @ApiParam({name: 'id', example: '1', description: 'id that identifies a card'})
  @ApiResponse({status: HttpStatus.OK, description: 'deletes card from database'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'card does not exist'})

  remove(@Param('id') id: string, @UserInfo() user: Partial<User>) {
    return this.cardsService.remove(+id, user);
  }
}
