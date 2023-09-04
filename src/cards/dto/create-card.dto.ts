import { ApiProperty } from "@nestjs/swagger";
import { CardType } from "@prisma/client";
import { IsBoolean, IsCreditCard, IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumberString, IsString, Length } from "class-validator";

export class CreateCardDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 'My international card', description: 'alias for new card. User cannot repeat alias for different cards'})
    label: string;

    @IsNotEmpty()
    @IsNumberString()
    @Length(16, 16, {message: 'card number must have 16 digits'})
    @ApiProperty({example: '1234567891234567', description: '16 digits field to register card number'})
    cardNumber: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 'John Doe II', description: 'Full name written on card'})
    cardOwner: string;

    @IsDateString({}, {message: 'expiration date must follow the YYYY-MM-DD format'})
    @IsNotEmpty()
    @ApiProperty({example: '2025-09-30', description: 'Full expiration date of card'})
    expirationDate: string;
    
    @IsNumberString()
    @IsNotEmpty()
    @Length(3, 3, {message: 'cvc must have 3 digits'})
    @ApiProperty({example: '789', description: '3 digit number that represents the card security code'})
    cvc: string;
    
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({example: true, description: 'boolean value to inform if card is virtual or phisical. If true, card is registered as virtual'})
    virtual: boolean;
    
    @IsNumberString()
    @IsNotEmpty()
    @ApiProperty({example: '999999', description: 'sequency of numerics that represent the card password'})
    password: string;
    
    @IsEnum(CardType)
    @IsNotEmpty()
    @ApiProperty({examples: ['CREDIT', 'DEBIT', 'HYBRID'], description: 'Type of possible operations operations. If set HYBRID, card is registered as both debit and credit'})
    CardType: CardType;

    constructor(params?: Partial<CreateCardDto>) {
        if(params) Object.assign(this, params)
    };
}
