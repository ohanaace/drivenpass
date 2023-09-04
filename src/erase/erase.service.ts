import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CredentialsService } from '../credentials/credentials.service';
import { CardsService } from '../cards/cards.service';
import { NotesService } from '../notes/notes.service';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { CreateEraseDto } from './dto/create-erase.dto';

@Injectable()
export class EraseService {
  constructor(
    private readonly credentials: CredentialsService,
    private readonly cards: CardsService,
    private readonly notes: NotesService,
    private readonly user: UsersService) { }

  async remove(user: Partial<User>, createEraseDto: CreateEraseDto) {
    const { password } = createEraseDto;
    const userPassword = await this.user.findOneWithPassword(user.id)
    const correctPassword = this.user.verifyPassword(password, userPassword.password)
    if (!correctPassword) throw new UnauthorizedException('incorrect password');

    await this.cards.removeAll(user.id);
    await this.credentials.removeAll(user.id);
    await this.notes.removeAll(user.id);
    return await this.user.remove(user.id);
  }
}
