import { Controller, Param, Delete, UseGuards, Body } from '@nestjs/common';
import { EraseService } from './erase.service';
import { AuthGuard } from '../guards/auth-guard';
import { User } from '@prisma/client';
import { UserInfo } from '../decorators/auth-decorator';
import { CreateEraseDto } from './dto/create-erase.dto';

@UseGuards(AuthGuard)
@Controller('erase')
export class EraseController {
  constructor(private readonly eraseService: EraseService) {}

  @Delete()
  remove(@Body() password: CreateEraseDto, @UserInfo() user: Partial<User>) {
    return this.eraseService.remove(user, password);
  }
}
