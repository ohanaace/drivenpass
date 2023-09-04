import { Module } from '@nestjs/common';
import { EraseService } from './erase.service';
import { EraseController } from './erase.controller';
import { EraseRepository } from './erase.repository';
import { CardsModule } from '../cards/cards.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { NotesModule } from '../notes/notes.module';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [CardsModule, CredentialsModule, NotesModule, UsersModule],
  controllers: [EraseController],
  providers: [EraseService, EraseRepository],
})
export class EraseModule {}
