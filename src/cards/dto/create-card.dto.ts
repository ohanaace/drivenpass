import { CardType } from "@prisma/client";
import { IsBoolean, IsCreditCard, IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumberString, IsString, Length } from "class-validator";

export class CreateCardDto {
    @IsString()
    @IsNotEmpty()
    label: string;

    @IsNotEmpty()
    @IsNumberString()
    @Length(16, 16, {message: 'card number must have 16 digits'})
    cardNumber: string;
    
    @IsString()
    @IsNotEmpty()
    cardOwner: string;

    @IsDateString({}, {message: 'expiration date must follow the YYYY-MM-DD format'})
    @IsNotEmpty()
    expirationDate: string;
    
    @IsNumberString()
    @IsNotEmpty()
    @Length(3, 3, {message: 'cvc must have 3 digits'})
    cvc: string;
    
    @IsBoolean()
    @IsNotEmpty()
    virtual: boolean;
    
    @IsNumberString()
    @IsNotEmpty()
    password: string;
    
    @IsEnum(CardType)
    @IsNotEmpty()
    CardType: CardType;

    constructor(params?: Partial<CreateCardDto>) {
        if(params) Object.assign(this, params)
    };
}
