import { IsNotEmpty, IsString, IsUrl } from "class-validator";


export class CreateCredentialDto {
    
    @IsString()
    @IsNotEmpty()
    label: string;
    
    @IsUrl()
    @IsNotEmpty()
    link: string;
    
    @IsString()
    @IsNotEmpty()
    username: string;
    
    @IsString()
    @IsNotEmpty()
    password: string;

    constructor(params?: Partial<CreateCredentialDto>) {
        if(params) Object.assign(this, params)
    };
};
