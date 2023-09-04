import { Global, Module, Provider } from '@nestjs/common';
import { CryptrService } from './cryptr.service';
import Cryptr from 'cryptr';


@Global()
@Module({
  providers: [CryptrService],
  exports: [CryptrService]
})
export class CryptrModule {}
