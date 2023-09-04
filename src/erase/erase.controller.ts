import { Controller, Param, Delete, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { EraseService } from './erase.service';
import { AuthGuard } from '../guards/auth-guard';
import { User } from '@prisma/client';
import { UserInfo } from '../decorators/auth-decorator';
import { CreateEraseDto } from './dto/create-erase.dto';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@Controller('erase')
@ApiTags('erase')
@ApiBearerAuth()
@ApiHeader({name: 'Authorization', description: 'header to pass the user JWT token generated in /users/sign-in'})
export class EraseController {
  constructor(private readonly eraseService: EraseService) {}

  @Delete()
  @ApiOperation({description: 'deletes account and all info registered by user'})
  @ApiResponse({status: HttpStatus.OK, description: 'Account deleted successfully'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})
  @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'incorrect password'})
  remove(@Body() password: CreateEraseDto, @UserInfo() user: Partial<User>) {
    return this.eraseService.remove(user, password);
  }
}
