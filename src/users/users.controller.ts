import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signup(createUserDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signin(@Body() signInDto: SignInDto) {
    return this.usersService.signin(signInDto);
  }

}
