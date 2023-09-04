import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CredentialsModule } from './credentials/credentials.module';
import { NotesModule } from './notes/notes.module';
import { CardsModule } from './cards/cards.module';
import { EraseModule } from './erase/erase.module';
import { DatabaseModule } from './database/database.module';
import { CryptrModule } from './cryptr/cryptr.module';


@Module({
  imports: [UsersModule, CredentialsModule, NotesModule, CardsModule, EraseModule, DatabaseModule, CryptrModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
