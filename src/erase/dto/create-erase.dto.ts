import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateEraseDto {
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 's3nh4F@rtE!', description: 'Password created by user when they signed up in Drivenpass'})
    password: string;


    constructor(params?: Partial<CreateEraseDto>) {
        if(params) Object.assign(this, params)
    };
}
