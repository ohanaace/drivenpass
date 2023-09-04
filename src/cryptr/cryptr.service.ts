import { Injectable } from '@nestjs/common';
import Cryptr from 'cryptr';

@Injectable()
export class CryptrService {
    private cryptr: Cryptr

    constructor() {
        const Cryptr = require('cryptr')
        this.cryptr = new Cryptr(process.env.CRYPTR)
     }

    encryptData(data: string): string {
        return this.cryptr.encrypt(data);
    }

    decryptData(encryptedData: string): string {
        return this.cryptr.decrypt(encryptedData);
    }
}
