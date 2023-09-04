import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
    @IsEmail()
    @IsNotEmpty({})
    @ApiProperty({ example: 'myemail@email.com', description: 'email for signup and authentication' })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({example: 's3nh4F@rtE!', description: 'password for signup and authentication'})
    password: string;
}