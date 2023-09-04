import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { CredentialsRepository } from './credentials.repository';
import { User } from '@prisma/client';
import { CryptrService } from '../cryptr/cryptr.service';

@Injectable()
export class CredentialsService {

  constructor(
    private readonly repository: CredentialsRepository,
    private readonly cryptr: CryptrService) { }

  async create(createCredentialDto: CreateCredentialDto, user: Partial<User>) {
    const { label, password } = createCredentialDto
    const { id } = user;

    await this.findByLabelAndUserId(label, id);
    const hashPassword = this.cryptr.encryptData(password);
    const body = { ...createCredentialDto, password: hashPassword }

    return await this.repository.create(body, id);
  }


  async findAll(user: Partial<User>) {
    const { id } = user;
    const credentials = await this.repository.findAll(id);
    const responseCredentials = credentials?.map((cred) => {
      return {
        ...cred,
        password: this.cryptr.decryptData(cred.password)
      }
    });
    return responseCredentials;
  }

  async findOne(id: number, user: Partial<User>) {
    const credential = await this.repository.findOne(id);
    if (!credential) throw new NotFoundException()
    if (credential.userId !== user.id) throw new ForbiddenException();
    const decryptPassword = this.cryptr.decryptData(credential.password)
    const responseCredential = { ...credential, password: decryptPassword }
    return responseCredential;
  }
  async remove(id: number, user: Partial<User>) {
    await this.findOne(id, user);

    return await this.repository.remove(id);
  }

  private async findByLabelAndUserId(label: string, id: number) {
    const conflictedCredential = await this.repository.findByLabelAndUserId(label, id)
    if (conflictedCredential) throw new ConflictException();
  }
}
