import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { CredentialsRepository } from './credentials.repository';

@Injectable()
export class CredentialsService {

  constructor(private readonly repository: CredentialsRepository) {}

  create(createCredentialDto: CreateCredentialDto) {
    return 'This action adds a new credential';
  }

  findAll() {
    return `This action returns all credentials`;
  }

  findOne(id: number) {
    return `This action returns a #${id} credential`;
  }
  remove(id: number) {
    return `This action removes a #${id} credential`;
  }
}
