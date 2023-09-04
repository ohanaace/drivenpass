import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { AuthGuard } from '../guards/auth-guard';
import { User } from '@prisma/client';
import { UserInfo } from '../decorators/auth-decorator';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('credentials')
@ApiBearerAuth()
@ApiHeader({name: 'Authorization', description: 'header to pass the user JWT token generated in /users/sign-in'})

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @ApiOperation({summary: 'register a new website credential'})
  @ApiResponse({status: HttpStatus.CREATED, description: 'new credential registered successfully'})
  @ApiResponse({status: HttpStatus.CONFLICT, description: 'credential with the informed label is already in use by user'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})

  create(@Body() createCredentialDto: CreateCredentialDto, @UserInfo() user: Partial<User>) {
    return this.credentialsService.create(createCredentialDto, user);
  }

  @Get()
  @ApiOperation({summary: 'shows all credentials that belong to user'})
  @ApiResponse({status: HttpStatus.OK, description: 'a list of all credentials registered by user'})
  
  findAll(@UserInfo() user: Partial<User>) {
    return this.credentialsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({summary: 'shows a specific credential that belongs to user'})
  @ApiParam({name: 'id', example: '1', description: 'id that identifies a credential'})
  @ApiResponse({status: HttpStatus.OK, description: 'shows credential info'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'credential does not exist'})

  findOne(@Param('id') id: string, @UserInfo() user: Partial<User>) {
    return this.credentialsService.findOne(+id, user);
  }

  @Delete(':id')
  @ApiOperation({summary: 'deletes a specific credential that belongs to user'})
  @ApiParam({name: 'id', example: '1', description: 'id that identifies a credential'})
  @ApiResponse({status: HttpStatus.OK, description: 'deleted credential info'})
  @ApiResponse({status: HttpStatus.FORBIDDEN, description: 'Authentication failed'})
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'credential does not exist'})

  remove(@Param('id') id: string, @UserInfo() user: Partial<User>) {
    return this.credentialsService.remove(+id, user);
  }
}
