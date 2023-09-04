import { IsNotEmpty, IsString } from "class-validator";

export class CreateEraseDto {
    
    @IsString()
    @IsNotEmpty()
    password: string;


    constructor(params?: Partial<CreateEraseDto>) {
        if(params) Object.assign(this, params)
    };
}
