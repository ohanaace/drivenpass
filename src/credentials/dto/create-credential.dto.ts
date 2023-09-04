import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";


export class CreateCredentialDto {
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 'My-Penguim-club-account', description: 'alias to register a credential'})
    label: string;
    
    @IsUrl()
    @IsNotEmpty()
    @ApiProperty({example: 'https://haboo.com', description: 'URL where the credential that consumes the credential info'})
    link: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 'p3nguim-crazY', description: 'username that user registered for service/website'})
    username: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 's3nhaF@ort4!', description: 'password created by user in service/website when their account was created'})
    password: string;

    constructor(params?: Partial<CreateCredentialDto>) {
        if(params) Object.assign(this, params)
    };
};
