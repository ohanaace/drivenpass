import { IsNotEmpty, IsString } from "class-validator";

export class CreateNoteDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    constructor(params?: Partial<CreateNoteDto>) {
        if(params) Object.assign(this, params)
    }
}
