import { Controller, Param, Delete } from '@nestjs/common';
import { EraseService } from './erase.service';

@Controller('erase')
export class EraseController {
  constructor(private readonly eraseService: EraseService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eraseService.remove(+id);
  }
}
