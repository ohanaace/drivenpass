import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from '../guards/auth-guard';
import { User } from '@prisma/client';
import { UserInfo } from '../decorators/auth-decorator';

@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @UserInfo() user: Partial<User>) {
    return this.cardsService.create(createCardDto, user);
  }

  @Get()
  findAll(@UserInfo() user: Partial<User>) {
    return this.cardsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserInfo() user: Partial<User>) {
    return this.cardsService.findOne(+id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserInfo() user: Partial<User>) {
    return this.cardsService.remove(+id, user);
  }
}
