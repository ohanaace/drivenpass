import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EraseRepository {
  constructor(private readonly prisma: DatabaseService) {}

  remove(id: number) {
    return `This action removes a #${id} erase`;
  }
}
