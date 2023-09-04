import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { CardsRepository } from './cards.repository';
import { User } from '@prisma/client';
import { CryptrService } from '../cryptr/cryptr.service';

@Injectable()
export class CardsService {

  constructor(
    private readonly repository: CardsRepository,
    private readonly cryptr: CryptrService) { }

  async create(createCardDto: CreateCardDto, user: Partial<User>) {
    const { label, password, cvc } = createCardDto;
    const { id } = user
    await this.findByLabelAndUserId(label, id);
    const body = {
      ...createCardDto,
      password: this.cryptr.encryptData(password),
      cvc: this.cryptr.encryptData(cvc)
    }

    return await this.repository.create(body, id)
  }

  async findAll(user: Partial<User>) {
    const cards = await this.repository.findAll(user.id);
    const responseCards = cards?.map((card) => {
      return {
        ...card,
        password: this.cryptr.decryptData(card.password),
        cvc: this.cryptr.decryptData(card.cvc)
      }
    });
    return responseCards;
  }

  async findOne(id: number, user: Partial<User>) {
    const card = await this.repository.findOne(id);
    if (!card) throw new NotFoundException();
    if (card.userId !== user.id) throw new ForbiddenException();

    const decryptPassword = this.cryptr.decryptData(card.password);
    const decryptCVC = this.cryptr.decryptData(card.cvc)
    const responseCard = { ...card, password: decryptPassword, cvc: decryptCVC };

    return responseCard;
  }

  async remove(id: number, user: Partial<User>) {
    await this.findOne(id, user);
    return await this.repository.remove(id);
  }

  async removeAll(userId: number) {
    return await this.repository.removeAll(userId)
  }

  private async findByLabelAndUserId(label: string, id: number) {
    const conflictedCard = await this.repository.findByLabelAndUserId(label, id)
    if (conflictedCard) throw new ConflictException();
  }
}
