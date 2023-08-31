import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class CreateUserDto {

    @IsEmail({}, { message: 'Please, insert a valid email!' })
    @IsNotEmpty({ message: 'email is required!' })
    email: string;

    @IsNotEmpty({ message: 'password is required!' })
    @IsStrongPassword({
        minLength: 10,
        minNumbers: 1,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1
    },
        { message: 'Password not strong enough!' })
    password: string;

    constructor(params?: Partial<CreateUserDto>) {
        if(params) Object.assign(this, params)
    }
}
