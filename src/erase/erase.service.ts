import { Injectable } from '@nestjs/common';
import { EraseRepository } from './erase.repository';

@Injectable()
export class EraseService {
  constructor(private readonly repository: EraseRepository) { }

  remove(id: number) {
    return `This action removes a #${id} erase`;
  }
}
