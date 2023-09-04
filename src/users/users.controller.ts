import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  @ApiOperation({summary: 'creates a new user'})
  @ApiResponse({status: HttpStatus.CREATED, description: 'user successfully signed up'})
  @ApiResponse({status: HttpStatus.CONFLICT, description: 'email already in use'})

  signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signup(createUserDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'generates user token'})
  @ApiResponse({status: HttpStatus.OK, description: 'JWT token generated'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'email/password not valid'})
  signin(@Body() signInDto: SignInDto) {
    return this.usersService.signin(signInDto);
  }

}
