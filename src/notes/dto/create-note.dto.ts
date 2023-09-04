import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateNoteDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 'A very sofisticated title', description: 'field that sets a title for the note'})
    title: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: 'My very sofisticated text to remind me to throw the trash out and vaccuum my bedroom', description: 'note content'})
    text: string;

    constructor(params?: Partial<CreateNoteDto>) {
        if(params) Object.assign(this, params)
    }
}
