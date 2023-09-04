import { IsNotEmpty, IsString } from "class-validator";

export class CreateEraseDto {
    
    @IsString()
    @IsNotEmpty()
    password: string;
}
